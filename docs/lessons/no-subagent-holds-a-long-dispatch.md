# No subagent holds a long dispatch

What happened: run #524 (nadicodeai, 2026-07-23) launched codex workers through wrapper subagents per ADR 0008: one foreground `scripts/codex-exec` call, backgrounding banned in the brief, report returned verbatim. Both wrappers backgrounded the call anyway and ended with a waiting stub ("I'll wait for the monitor/background task notification before proceeding"), leaving an empty out file beside a growing events log. The second failed with a hardened brief that spelled out the full resume procedure, so instruction text is not the fix: a subagent asked to block on a call for tens of minutes backgrounds it, whatever its instructions say. The orchestrator then drove the same commands from its own turn as tracked background Bash, chaining `--resume <thread-id>` from the events file, and every dispatch delivered.

The rule: a shell-out dispatch runs from the orchestrator's own turn, as tracked background Bash with a resume chain. A subagent never holds a shell-out longer than a routine command.

Enforced: skills/maestro/references/codex-dispatch.md (the launch contract).

Related: [subagent-background-work-dies-silently](subagent-background-work-dies-silently.md), docs/adr/0020-dispatch-from-the-orchestrators-turn.md.
