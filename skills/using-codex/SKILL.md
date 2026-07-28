---
name: using-codex
description: Run one task through the codex CLI, from launch to the report read back. Use whenever a dispatch routes work to codex.
user-invocable: false
---

# Using codex

Run the given task through the codex CLI: launch it, keep it visible while it runs, and read its report back. The dispatch that sent you here names the model, effort, and sandbox. Everything below is the same for every dispatch.

## Launch

Write the brief to a file and start the run:

```bash
cat > <brief-file> <<'EOF'
<the brief>
EOF
codex exec --ignore-user-config -C <worktree> \
  -m <model> -c model_reasoning_effort="<effort>" -s <sandbox> \
  -o <out-file> - < <brief-file> 2> <log-file>
```

- Send the brief to codex through a file and stdin, never through inline shell quoting. Name the brief, out, and log files by absolute path in one directory for the run, because shell variables do not survive between your Bash calls and a recovery needs those paths again.
- `--ignore-user-config` keeps the machine's codex config out of the run, so your dispatch behaves the same on any host. Auth still resolves from `CODEX_HOME`.
- The final message lands in the out file. Everything else (the session header, the commands codex runs, its messages) streams to the log. Read the out file as the report, and open the log to debug a failure, never whole into context.
- Add `-c tools.web_search=true` when the run has to ground itself on the web. It composes with any sandbox.
- When you need a report that parses, pass `--output-schema <schema-file>`, or end the brief with an output contract demanding a final JSON code block.
- Outside a git repository, add `--skip-git-repo-check`.

All of this is verified on codex-cli 0.144. When a flag is in doubt, run `codex exec --help` and `codex exec resume --help` on the installed version and take that as the authority.

## Keep it visible

Run the launch from your own turn as tracked background Bash: the harness holds a visible row from launch to exit and re-invokes you when it finishes, and stopping that task kills the run. Use one tracked command per worker, chain the setup steps (worktree prep, installs) inside it, and set an explicit timeout above the run's expected time (`bottega:setup` raises the shell ceiling so long runs fit). Keep the call in your own turn: a subagent asked to hold a long call backgrounds it and ends with a waiting stub, whatever its brief says, and a shell forked with `&` leaves an invisible orphan nothing reports on.

Capture the session id as soon as the run starts with `grep -m1 "session id:" <log-file>`. Once you have the id saved, any recovery is deterministic.

## Liveness and recovery

Read the log file's age for liveness: codex streams every command it runs and every message it writes there, so a log that has not grown while the task is still alive is a run making no progress. Check it with the harness's monitor primitive rather than a loop of your own, and give it a window wide enough for the slowest step your brief asks for (a full test suite is minutes of silence). Stop a run you judge stalled by stopping its task, which kills the process and its children, then resume it. Resume the same way after a run cut short any other way (the shell timeout ceiling, an interrupted session, a crash).

```bash
(cd <worktree> && codex exec resume <session-id> --ignore-user-config \
  -m <model> -c model_reasoning_effort="<effort>" -c sandbox_mode="<sandbox>" \
  -o <out-file> - < <brief-file> 2> <log-file>)
```

- Resume by explicit session id, read from the log. `--last` filters by cwd and still races any parallel codex on the machine.
- The session id is `resume`'s first positional argument. It has no `-s`, and no `-C` either. Carry the model, effort, and config isolation exactly as your launch did, re-assert the sandbox as `-c sandbox_mode="..."`, and give the worktree as the process cwd. A resume that omits any of them runs at the host config's values instead of your dispatch's: measured on a session pinned to `low` effort and `read-only`, a bare resume came back at the host's `xhigh` and `danger-full-access`. Whatever the dispatch site chose is what has to survive the recovery.
- Sessions live in the machine's `CODEX_HOME` and die with it. Give a session that is gone a fresh dispatch, with a brief carrying whatever the interrupted run had already reported.
- Resume to continue the same job (a follow-up fix, a recovery). Give a new job a fresh `codex exec`: a long session fed a new work order reads it as configuration and no-ops.

## The brief

A codex worker starts from zero: no session history, no `$CLAUDE_PLUGIN_ROOT`, no slash commands, no subagents. Naming any of those stalls the worker, and bulk work you would fan out to a Claude worker gets chunked inline instead. Write every brief self-contained:

- the goal, the worktree, and every input by absolute path: the files themselves, never a summary standing in for one
- constraints and non-goals, each hard constraint paired with its sanctioned exit ("if X fails after honest attempts, stop and report the numbers"): a cornered worker satisfies the letter of a gate it cannot meet honestly, and a stop report is a successful run
- the proof expected, as the exact command to run, and the output contract from Launch

## Read the report

Exit 0 with a final message in the out file is the report. Treat anything else (nonzero, an empty out file) as a failed dispatch: report the exit code and the log's tail, then resume or redispatch. Never work around a failed invocation silently.

## Parallel workers

Run independent dispatches side by side, each with its own worktree, out file, log, and tracked background command. Explicit session ids keep every resume deterministic under parallelism.
