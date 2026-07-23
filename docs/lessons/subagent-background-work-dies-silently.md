# A subagent that backgrounds its command dies at turn end; the report is never delivered

What happened: designing issue #78's wrapper dispatch (2026-07-21), the first shape had the wrapper subagent launch `scripts/codex-exec` as background Bash, end its turn, and relay the report when re-invoked on exit. Tested live twice under Claude Code: the wrapper's row disappeared seconds after launch while codex ran for minutes with no screen presence, and the background exit re-invoked nothing, so the finished report sat unread in the out file both times. Re-invocation on background exit holds for a live session, not for a subagent that has ended its turn. A published third-party codex agent independently recorded the identical failure the same week, five of five reproducible, and banned backgrounding in its wrapper.

The rule: a worker's shell-out runs as one foreground call inside its wrapper subagent, with an explicit timeout covering the whole run. A result reporting the command was moved to the background is a failed dispatch, reported immediately, never waited on.

Enforced: skills/routing (Dispatch mechanics), skills/maestro/references/codex-dispatch.md (the launch paragraph).
