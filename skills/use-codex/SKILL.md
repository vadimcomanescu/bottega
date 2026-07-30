---
name: use-codex
description: Run one task through the codex runtime, from the dispatch to the report read back. Use whenever a dispatch routes work to codex.
user-invocable: false
---

# Use codex

Run the given task through the codex runtime: dispatch it, watch it to the end, and read its report back. The dispatch that sent you here names the model and the effort. Everything below is the same for every dispatch.

## Dispatch

In Claude Code, send the work to the `bottega:codex` subagent, naming the model the dispatch that sent you here carries for it. That subagent is a forwarder: it makes one call to `node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" task ...` and returns its stdout to you unchanged. On a harness without subagents or a plugin root, make that `task` call yourself with the same controls. Your dispatch is the brief plus the controls it forwards:

- `--model <model> --effort <effort>`, in every dispatch. The forwarder leaves both unset otherwise, which runs codex at the machine's defaults, and the route guard denies a codex dispatch that names no model. The runtime accepts `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`, and `ultra`, but the API serving the pinned model may accept fewer, and a rejected effort fails the job at start, so pin an effort the model serves. `--model spark` is the alias for `gpt-5.3-codex-spark`.
- The words "read-only" when the run must not write. The forwarder makes a run write-capable (`--write`) by default, so a cross-read that leaves this out comes back able to edit the tree.
- `--background` for anything longer than a routine command. The subagent returns in seconds with a receipt naming the job id, and you watch the job yourself. A subagent asked to hold a long call backgrounds it and ends with a waiting stub, whatever its brief says.

- `--cwd <worktree>` when the work belongs in a run's worktree. Without it codex runs at the git top level of the session's directory, and the job is stored under the workspace the working directory resolves to. Make your own status, result, and cancel calls with the same `--cwd`, or from that directory.

## Watch it to the end

The receipt names the job id. Its follow-up hints name `/codex:` commands from the runtime's upstream plugin, which bottega does not ship: use the calls below instead. Watch the job from your own turn as tracked background Bash, one call per job:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" status <job-id> --wait --timeout-ms <ms>
```

The harness holds a visible row while the wait runs and re-invokes you when it returns. Give `--timeout-ms` a window wider than the slowest step the brief asks for (a full test suite is minutes of silence), and give the Bash call a timeout above that (`bottega:setup` raises the shell ceiling so long waits fit).

When the job is done, read its report:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" result <job-id>
```

## Recovery

The wait prints the job's state whether or not the job finished, so read that rather than the exit code. Still running means the wait hit its own timeout and nothing more: run the same `status --wait` again, and do the same after a session interruption or a shell timeout, because the job and its codex thread live on disk.

A follow-up or a repair on the same work goes out as another dispatch adding `--resume`, which continues that thread instead of opening one. Unrelated work gets a `--fresh` dispatch, because a thread fed a new work order reads it as configuration and no-ops. `cancel <job-id>` kills a run you judge stalled, and the status report names the log file where you read what it was doing before you decide. Jobs belong to the session that started them and are cleaned up when it ends, so work that must continue in a later session gets a fresh dispatch whose brief carries whatever the interrupted run had already reported.

## The brief

A codex worker starts from zero: no session history, no `$CLAUDE_PLUGIN_ROOT`, no slash commands, no subagents. Naming any of those stalls the worker, and bulk work you would fan out to a Claude worker gets chunked inline instead. Write every brief self-contained:

- the goal, the worktree, and every input by absolute path: the files themselves, never a summary standing in for one
- constraints and non-goals, each hard constraint paired with its sanctioned exit ("if X fails after honest attempts, stop and report the numbers"): a worker with no way out will fake passing a gate it cannot honestly meet, so a run that stops and reports the numbers counts as a success
- the proof expected, as the exact command to run, and, when you need a report that parses, an output contract demanding a final JSON code block

## Read the report

The report is what `result` prints: codex's final message, and the id of the thread a resume continues. Treat a job that ended failed or empty as a failed dispatch: report its status and the tail of its log, then resume or redispatch. Never work around a failed invocation silently.

## Parallel workers

Run independent dispatches side by side, each with its own `--cwd` worktree, its own job id, and its own tracked `status --wait`. Separate worktrees are separate workspaces, which keeps `--resume` unambiguous: it continues the latest job of one workspace, and refuses while another job there is still running.
