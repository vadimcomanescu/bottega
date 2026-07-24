# Claude Code is the one orchestrator

ADR 0018 kept both orchestrator harnesses. This reverses that: a run is orchestrated from Claude Code on fable-5 at xhigh (opus-5 at xhigh offered when fable is unavailable, with the user's approval), and the Codex packaging, hook registration, and install path are removed. GPT models keep every checking job on every run (plan cold read, one of the two review engines, the review rerun, the spec conformance check, a panel seat), dispatched through `scripts/codex-exec`.

Why: the Codex CLI's own tracker shows subagent lifecycle failures being re-filed at a higher rate after GPT-5.6 shipped than before it (openai/codex #19197, #34061, #34518, #34653), the CLI has no browser so the QA phase cannot drive a web product from that side, no one in the field orchestrates from Codex (OpenAI's own plugin drives Claude Code with Codex as the delegate), and carrying a second orchestrator doubled every model rule in the corpus with per-harness conditionals for a path not driven. The one operational argument for the second orchestrator, fable's weekly rationing, is served by the opus-5 fallback inside Claude Code instead.

The removal is cheap to reverse: codex-exec runs on every single run as the checking path, so the integration stays exercised; re-adding a Codex orchestrator later is a prose change. In the same change, the Build phase moved from maestro's body to `skills/build`, so every phase reads as one line in maestro and carries its method in its own skill.

Supersedes the both-harnesses decision of ADR 0018; its dissolution of the routing skill, native builders, cross-family checks, and removal of sonnet all stand.
