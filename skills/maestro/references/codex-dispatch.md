# Codex dispatch

Every codex worker is launched through the plugin's dispatch script, the one place a `codex exec` invocation is assembled:

```
$CLAUDE_PLUGIN_ROOT/scripts/codex-exec --model <model> --effort <effort> \
  --sandbox read-only --cwd <worktree> \
  --brief <brief.md> --out <msg.txt> --events <events.jsonl> \
  [--search] [--schema <schema.json>] [--resume <thread-id>]
```

(In this repo: `scripts/codex-exec`. Pass the script and every file by absolute path; the script refuses relative paths.) The script pins `--ignore-user-config` (the machine's config, model, and notify hooks are ignored; auth still resolves from `CODEX_HOME`), captures the `--json` event stream to the events file and the final message to the out file, and encodes the resume rules: a resumed thread re-enters the sandbox as config and runs from the worktree cwd, because `codex exec resume` silently drops `-s` and `-C`. It runs codex as its own process-group leader and kills the whole group on a stall, a write failure, or a catchable signal, so a cancelled dispatch leaves no codex subtree behind; only an uncatchable SIGKILL of the script itself can orphan the group, and the recovery is the same as any interrupted dispatch, a fresh call resuming the thread from the events file. The script verifies completion from the event stream and kills a run whose stdout stream delivers no bytes for ten minutes, so exit 0 is a finished run with its final message in the out file, and anything else, a hung run or a resume of a thread that no longer exists included, exits nonzero and gets a fresh dispatch. Never assemble `codex exec` by hand; a caller that needs a flag the script lacks changes the script. While a run is active, the script prints live progress lines to stderr, so the task's output shows the thread id, the commands run, agent messages, and a heartbeat when the stream goes quiet. An advancing heartbeat means the run is alive; the progress lines are advisory only, and the events file stays the record.

Run the script from your own turn as tracked background Bash, never from a subagent: the harness holds the task's row from launch to exit and re-invokes you when it finishes, and a subagent asked to sit on a call for tens of minutes backgrounds it and ends with a waiting stub instead, whatever its brief says (docs/lessons/no-subagent-holds-a-long-dispatch.md). Give the call an explicit timeout above the dispatch's expected runtime, and raise the shell timeout ceiling so a long read fits under it (bottega:setup writes it). A chunk the ceiling or an interruption cuts short resumes on its thread: read the thread id from the events file and dispatch again with `--resume <thread-id>` until a clean exit puts the report in the out file. Read the out file's final message as the worker's report, or the exit code and stderr on failure. The stall watchdog guarantees even a wedged run exits instead of sitting alive forever. Never a polling loop, never an untracked shell. A failed invocation is reported with its stderr, never worked around. Directory trust never gates these runs; a fresh, never-trusted worktree under `--ignore-user-config` executes normally.

Every codex dispatch is a read: `--sandbox read-only`. A dispatch that must ground itself on the web adds `--search`, which composes with the read-only sandbox.

## What every brief carries

- The inputs the dispatching phase names, each by absolute path: the plan, the spec, the files in scope, and the project's domain glossary. Pass the files themselves; a summary or reconstruction is a different input and is rejected before dispatch.
- Each directly relevant technology skill by absolute path, omitting one that is unavailable. `$CLAUDE_PLUGIN_ROOT`, slash commands, and subagents do not exist for a codex worker; a brief naming any of them stalls the worker. Bulk work a Claude worker would fan out to subagents, a codex brief chunks inline.
- A role-specific output contract ending in a JSON code block, so the final message is parsed instead of hand-read as prose.

## Resuming a codex thread

Resume with `--resume <thread-id>`, the `thread_id` field of the `thread.started` event in the events file. Never codex's own `--resume` or `--last` selectors, which pick by cwd and grab the wrong session under parallel dispatches. A thread lives only in that machine's `CODEX_HOME` and dies with the worker; when it is gone, dispatch fresh with a self-contained brief carrying the inputs above and whatever the interrupted run had already reported.
