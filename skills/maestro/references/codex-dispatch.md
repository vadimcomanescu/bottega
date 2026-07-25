# Codex dispatch

Launch a codex worker with the codex CLI, keep it visible while it runs, and read its report back. The dispatch site names the model, effort, and sandbox; the mechanics here are the same for every seat.

## Launch

Write the brief to a file and start the run:

```bash
BRIEF=$(mktemp); cat >"$BRIEF" <<'EOF'
<the brief>
EOF
codex exec --ignore-user-config -C <worktree> \
  -m <model> -c model_reasoning_effort="<effort>" -s <sandbox> \
  -o <out-file> - <"$BRIEF" 2><log-file>
```

- The brief reaches codex through a file and stdin, never inline shell quoting.
- `--ignore-user-config` keeps the machine's codex config out of the run, so a dispatch behaves the same on any host; auth still resolves from `CODEX_HOME`.
- The final message lands in the out file; everything else (thinking, commands, the session id) streams to the log. Read the out file as the report; open the log to debug a failure, never whole into context.
- A dispatch that grounds itself on the web adds `-c tools.web_search=true`, which composes with a read-only sandbox.
- A report that must parse: pass `--output-schema <schema-file>`, or end the brief with an output contract demanding a final JSON code block.
- Outside a git repository, add `--skip-git-repo-check`.

Verified on codex-cli 0.144; when a flag is in doubt, `codex exec --help` on the installed version is the authority.

## Keep it visible

Run the launch from your own turn as tracked background Bash: the harness holds a visible row from launch to exit and re-invokes you when it finishes. One tracked command per worker, setup steps (worktree prep, installs) chained inside it, and an explicit timeout above the run's expected time (`bottega:setup` raises the shell ceiling so long runs fit). A subagent asked to hold a long call backgrounds it and ends with a waiting stub, whatever its brief says, and a shell forked with `&` leaves an invisible orphan nothing reports on ([no-subagent-holds-a-long-dispatch](../../../docs/lessons/no-subagent-holds-a-long-dispatch.md), [subagent-background-work-dies-silently](../../../docs/lessons/subagent-background-work-dies-silently.md)).

Capture the session id as soon as the run starts: `grep -m1 "session id:" <log-file>`. With the id saved, any recovery is deterministic.

## Liveness and recovery

The log file's age is the liveness read. The thinking stream keeps it fresh, so a log untouched for five minutes while the process lives is a hang, not a long thought: kill the codex process and its children, then resume the session. A run cut short any other way (the shell timeout ceiling, an interrupted session, a crash) recovers the same way.

```bash
(cd <worktree> && codex exec resume <session-id> \
  -c model_reasoning_effort="<effort>" -c sandbox_mode="<sandbox>" \
  -o <out-file> - <"$BRIEF2" 2><log-file>)
```

- Resume by explicit session id, from the log. `--last` filters by cwd and still races any parallel codex on the machine.
- `resume` reads `-s` as the session id and has no `-C`: re-assert the sandbox as `-c sandbox_mode="..."` and the worktree as the process cwd, on every resume.
- Sessions live in the machine's `CODEX_HOME` and die with it. A session that is gone gets a fresh dispatch whose brief carries whatever the interrupted run had already reported.
- Resume continues the same job (a follow-up fix, a recovery). A new job gets a fresh `codex exec`: a long session fed a new work order reads it as configuration and no-ops.

## The brief

A codex worker starts from zero: no session history, no `$CLAUDE_PLUGIN_ROOT`, no slash commands, no subagents. A brief naming any of those stalls the worker, and bulk work a Claude worker would fan out is chunked inline instead. Every brief is self-contained:

- the goal, the worktree, and every input by absolute path: the files themselves, never a summary standing in for one
- constraints and non-goals, each hard constraint paired with its sanctioned exit ("if X fails after honest attempts, stop and report the numbers"): a cornered worker satisfies the letter of a gate it cannot meet honestly, and a stop report is a successful run
- the proof expected, as the exact command to run, and the output contract from Launch

## Read the report

Exit 0 with a final message in the out file is the report. Anything else (nonzero, an empty out file) is a failed dispatch: report the exit code and the log's tail, then resume or redispatch. Never work around a failed invocation silently.

## Parallel workers

Independent dispatches run side by side: each gets its own worktree, out file, log, and tracked background command. Explicit session ids keep every resume deterministic under parallelism.
