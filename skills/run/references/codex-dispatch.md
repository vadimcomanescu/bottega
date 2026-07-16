# Codex dispatch

Every codex worker is launched through the plugin's dispatch script, the one place a `codex exec` invocation is assembled:

```
$CLAUDE_PLUGIN_ROOT/scripts/codex-exec --model <model> --effort <effort> \
  --sandbox <read-only|danger-full-access> --cwd <worktree> \
  --brief <brief.md> --out <msg.txt> --events <events.jsonl> \
  [--schema <schema.json>] [--resume <thread-id>]
```

(In this repo: `scripts/codex-exec`. Pass the script and every file by absolute path; the script refuses relative paths.) The script pins `--ignore-user-config` (the machine's config, model, and notify hooks are ignored; auth still resolves from `CODEX_HOME`), captures the `--json` event stream to the events file and the final message to the out file, and encodes the resume rules: a resumed thread re-enters the sandbox as config and runs from the worktree cwd, because `codex exec resume` silently drops `-s` and `-C`. The script verifies completion from the event stream and kills a run whose events file stops growing for five minutes, so exit 0 is a finished run with its final message in the out file, and anything else, a hung run or a resume of a thread that no longer exists included, exits nonzero and gets a fresh dispatch. Never assemble `codex exec` by hand; a caller that needs a flag the script lacks changes the script.

Launch it as **tracked background Bash**; the harness re-invokes you when it exits, and the script's stall watchdog guarantees even a wedged run exits instead of sitting alive forever. Never a polling loop, never an untracked shell. A failed invocation is reported with its stderr, never worked around. Directory trust never gates these runs; a fresh, never-trusted worktree under `--ignore-user-config` executes normally.

Builders take `--sandbox danger-full-access`; consultation reads take `--sandbox read-only`. Full access is a decision, not a convenience; do not "fix" it back. Claude workers run unsandboxed on the same host, so the run's trust boundary is the trusted repo plus the worktree, and sandboxing only the codex family adds no safety while breaking the worker: `workspace-write` denies every socket (no localhost bind, no dev server, no database, no integration suite) and denies shared-gitdir writes (no commits). Its one repair knob, `sandbox_workspace_write.network_access`, is silently ignored on macOS, so it cannot make a dispatch run identically on any host. If bottega ever runs on a repo the user does not trust, the sandbox comes back, for both families, and `scripts/codex-exec` starts resolving the codex binary from absolute PATH entries only, so a checkout cannot shadow it.

## What every brief carries

- The three brief lines from `skills/run` (the safety rule, no piped test commands, name every test you edit), verbatim.
- The canonical run brief verbatim and the host domain glossary by absolute path. A summary or reconstruction is a different input and is rejected before dispatch.
- Role and technology skills by absolute path. A builder gets `skills/implementing/SKILL.md` and each directly relevant technology skill. Omit an unavailable technology skill. `$CLAUDE_PLUGIN_ROOT`, slash commands, and subagents do not exist for a codex worker; a brief naming any of them stalls the worker. Bulk work a Claude worker would fan out to subagents, a codex brief chunks inline.
- The gate commands verbatim. The worker runs its own gate, including anything that binds (dev server, integration suite), and watches it pass. Green stays something the worker saw itself.
- A role-specific output contract ending in a JSON code block, so the `-o` message is parsed instead of hand-read as prose. A builder's fields mirror the report in `skills/implementing`: status, behavior implemented, RED and GREEN evidence, host gates, files and commit, and unresolved domain or architecture conflicts.

## The builder brief

A Codex builder is one dispatch that owns the whole assigned slice, same as a Claude builder: read the fixed architecture, glossary, and relevant technology skills; implement test-first inside them; commit the owned files; stop. The brief carries the run's commit message format. The worktree and branch are pre-created (a sonnet dispatch, or your own shell); nothing writes implementation code for the builder.

## Resuming a codex thread

Implementation repairs from review or QA go back to the appropriate builder with `--resume <thread-id>` when that Codex thread still owns the module; the id is the `thread_id` field of the `thread.started` event in the events file. Never codex's own `--resume` or `--last` selectors, which pick by cwd and grab the wrong session under parallel slices. The thread is context reuse, not a requirement: it lives only in that host's `CODEX_HOME` and dies with the worker. A dead thread means a fresh dispatch with a self-contained brief carrying the check IDs, evidence, canonical run brief, and prior builder report.
