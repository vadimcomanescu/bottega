---
name: use-codex
description: Run one task through codex, from the dispatch to the report read back. Use whenever a dispatch routes work to codex.
user-invocable: false
---

# Use codex

Run the given task through codex: dispatch it, watch it to the end, and read its report back. The dispatch that sent you here names the model and the effort. The tool is `scripts/codex-task` in this skill's directory, a wrapper around `codex exec`: one detached codex process per job, job state on disk per workspace, no daemon. Its header states the full interface. It needs the codex CLI on PATH and logged in.

## Dispatch

Send the work out as one subagent pinned to sonnet, its only job one Bash call. Give it these instructions, with your values filled in:

> Make exactly one Bash call: `node "<this skill's directory>/scripts/codex-task" task <controls> "<brief>"`. Return the stdout of the command exactly as-is as your final message, and nothing else: a `--background` call prints a one-line receipt, and that one line is your whole answer. If the call fails, return its error output as-is. Make no other tool call of any kind.

On a harness without subagents, make the call yourself. Your dispatch is the brief plus the controls it forwards:

- `--model <model> --effort <effort>`, in every dispatch. The wrapper refuses a dispatch missing either, because an unpinned run falls back to the machine's defaults. The runtime accepts efforts up to `ultra`, but the API serving the pinned model may accept fewer, and a rejected effort fails the job at start, so pin an effort the model serves.
- `--read-only` when the run must not write, the contract a review seat carries: a read-only job provably left the tree untouched. Every other job runs unsandboxed, filesystem, git, and network included.
- `--background` for anything longer than a routine command. The call returns in seconds with a receipt naming the job id, and you watch the job yourself. A subagent asked to hold a long call backgrounds it and ends with a waiting stub, whatever its brief says.
- `--cwd <worktree>` when the work belongs in a run's worktree. Jobs are stored per workspace, so make your status, result, and cancel calls with the same `--cwd`, or from that directory.

## Watch it to the end

The receipt names the job id. Watch the job from your own turn as tracked background Bash, one call per job:

```bash
node "<this skill's directory>/scripts/codex-task" status <job-id> --wait --timeout-ms <ms>
```

The harness holds a visible row while the wait runs and re-invokes you when it returns. Give `--timeout-ms` a window wider than the slowest step the brief asks for (a full test suite is minutes of silence), and give the Bash call a timeout above that.

When the job is done, read its report:

```bash
node "<this skill's directory>/scripts/codex-task" result <job-id>
```

## Recovery

The wait prints the job's state whether or not the job finished, so read that rather than the exit code. Still running means the wait hit its own timeout and nothing more: run the same `status --wait` again, and do the same after a session interruption or a shell timeout. Jobs and their codex threads live on disk under the workspace and survive the session that started them, so a later session continues with the same status, result, and resume calls.

A follow-up or a repair on the same work goes out as another dispatch adding `--resume <session id>`, which continues that codex thread with the model, effort, and sandbox pins replayed. The receipt, the status, and the report each name the session id, and `--resume-last` takes the workspace's most recent one. Unrelated work gets a fresh dispatch, because a thread fed a new work order reads it as configuration and no-ops. `cancel <job-id>` kills a run you judge stalled, and the status report names the log file where you read what it was doing before you decide. Cancel every receipt you stop watching: a running job outlives your session, and nothing else stops it.

## The brief

A codex worker starts from zero: no session history, no slash commands, no subagents. Naming any of those stalls the worker, and bulk work you would fan out to a Claude worker gets chunked inline instead. Write every brief self-contained:

- the goal, the worktree, and every input by absolute path: the files themselves, never a summary standing in for one
- constraints and non-goals, each hard constraint paired with its sanctioned exit ("if X fails after honest attempts, stop and report the numbers"): a worker with no way out will fake passing a gate it cannot honestly meet, so a run that stops and reports the numbers counts as a success
- the proof expected, as the exact command to run, and, when you need a report that parses, an output contract demanding a final JSON code block

## Read the report

The report is what `result` prints: codex's final message, and the session id a resume continues. Treat a job that ended failed or empty as a failed dispatch: report its status and the tail of its log, then resume or redispatch. Never work around a failed invocation silently.

## Parallel workers

Run independent dispatches side by side, each with its own `--cwd` worktree, its own job id, and its own tracked `status --wait`. Separate worktrees are separate workspaces, which keeps `--resume-last` unambiguous: it takes the most recent session of one workspace only.
