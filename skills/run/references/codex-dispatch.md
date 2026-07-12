# Codex dispatch

Every codex worker is launched through the plugin's dispatch script, the one place a `codex exec` invocation is assembled:

```
$CLAUDE_PLUGIN_ROOT/scripts/codex-exec --model <model> --effort <effort> \
  --sandbox <read-only|danger-full-access> --cwd <worktree> \
  --brief <brief.md> --out <msg.txt> --events <events.jsonl> \
  [--schema <schema.json>] [--resume <thread-id>]
```

(In this repo: `scripts/codex-exec`. Pass the script and every file by absolute path.) The script pins `--ignore-user-config` (the machine's config, model, and notify hooks are ignored; auth still resolves from `CODEX_HOME`), captures the `--json` event stream to the events file and the final message to the out file, and encodes the resume rules: a resumed thread re-enters the sandbox as config and runs from the worktree cwd, because `codex exec resume` silently drops `-s` and `-C`. Never assemble `codex exec` by hand; a caller that needs a flag the script lacks changes the script.

Launch it as **tracked background Bash**; the harness re-invokes you when it exits. Never a polling loop, never an untracked shell. One bounded check completes the dispatch: confirm `thread.started` appears in the events file shortly after launch (a single `timeout`-bounded grep). If it is absent, kill and relaunch: a wedged exec sits alive at 0% CPU forever and never exits into the harness's notification. A failed invocation is reported with its stderr, never worked around. Directory trust never gates these runs (verified 2026-07-05: a fresh, never-trusted worktree under `--ignore-user-config` executes normally).

Builders and reviewers take `--sandbox danger-full-access`; consultation reads take `--sandbox read-only`. Full access is a decision, not a convenience; do not "fix" it back. Claude workers run unsandboxed on the same host, so the run's trust boundary is the trusted repo plus the worktree, and sandboxing only the codex family adds no safety while breaking the worker: `workspace-write` denies every socket (no localhost bind, no dev server, no database, no integration suite; verified 2026-07-11) and denies shared-gitdir writes (no commits). Its one repair knob, `sandbox_workspace_write.network_access`, is silently ignored on macOS, so it cannot make a dispatch run identically on any host. If bottega ever runs on a repo the user does not trust, the sandbox comes back, for both families.

## What every brief carries

- The three brief lines from `skills/run` (the safety rule, no piped test commands, name every test you edit), verbatim.
- Skills and files by absolute path. `$CLAUDE_PLUGIN_ROOT`, slash commands, and subagents do not exist for a codex worker; a brief naming any of them stalls the worker. Bulk work a Claude worker would fan out to subagents, a codex brief chunks inline.
- The gate commands verbatim. The worker runs its own gate, including anything that binds (dev server, integration suite), and watches it pass. Green stays something the worker saw itself.
- An output contract ending in a fenced JSON block (verdict, files touched, evidence paths, anomalies, decisions the brief did not determine), so the `-o` message is parsed like every other worker's report instead of hand-read as prose. Reviewers are the exception: their contract is the schema, below.

## Codex reviewer preparation

Before every codex reviewer dispatch, have a disposable copy of the run worktree created at the head SHA under review (a sonnet dispatch, or your own turns on a small run). Run the reviewer from the disposable copy with `--sandbox danger-full-access`: read-only starves the suites and probes reviewing demands, and disposability, not the sandbox, keeps the reviewer's hands off the product tree. Remove the copy after the round.

A reviewer dispatch passes `--schema <install root>/skills/reviewing/references/report.schema.json`, so the out file is the schema-enforced review report itself. Before accepting it, check the echoed identity against the brief: `round`, `reviewer.family`, `reviewer.model`, and all three `target` SHAs must match what you dispatched; the schema proves shape, not identity (the mismatch rule is in `skills/run`, Review).

## The builder brief

A codex builder is one dispatch that owns the whole slice, same as a Claude worker: write the failing tests, watch them fail, implement to green, commit. The brief carries the run's commit message format, and the worker commits its own work by explicit path per `skills/implementing`. The worktree and branch are pre-created (a sonnet dispatch, or your own shell); nothing commits for the worker and nothing writes implementation code for it.

## Resuming a codex thread

Review findings go back to the builder with `--resume <thread-id>`; the id is the `thread_id` field of the `thread.started` event in the events file. Never codex's own `--resume` or `--last` selectors, which pick by cwd and grab the wrong session under parallel slices. The thread is context reuse, not a requirement: it lives only in that host's `CODEX_HOME` and dies with the worker. A dead thread means a fresh dispatch with a self-contained brief carrying the findings and the worker's prior report.
