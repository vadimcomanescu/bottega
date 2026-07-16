# REVIEW

Review guidance specific to this repository. The reviewer method is `skills/reviewing`, the design doctrine is `skills/codebase-design`, and the working agreement is `AGENTS.md`; this file adds only the risks a reviewer without prior Bottega context tends to miss.

## Dual-host packaging and host neutrality

Bottega is one installed plugin for Claude Code and Codex. `.claude-plugin/` and `.codex-plugin/` must expose the same repository-root `skills/`, `agents/`, and `scripts/` tree. Reject a copied, generated, or symlinked Codex doctrine tree. Codex marketplace source resolution must be proven by a real install, not inferred from the Claude marketplace.

Asset paths handed to a worker must resolve under the active install root: `$CLAUDE_PLUGIN_ROOT` on Claude Code, or the loaded skill path on Codex. Reject a checkout-specific hard-coded path or a host language, framework, or layout assumption.

## Role and routing boundaries

The orchestrator makes every judgment call; workers return finished answers and never coordinate with each other. `skills/run/references/host-transports.md` is the one routing authority. Claude Code enforces its table through `hooks/route-guard.js` and dispatch scripts. Codex uses the active GPT-5.6 Sol Ultra task, native subagents, and `scripts/claude-exec`; it never launches another Codex process or installs project custom agents.

Reject a change that moves a judgment call into a worker, pins a model in an agent file, adds a second routing authority, or copies a shared skill into an agent.

## Frozen target and schema identity

The review gate freezes base, head, and tree SHAs before round 1. Every reviewer reports against `skills/reviewing/references/report.schema.json`, whichever family or host dispatched it. Reject a moving target, a report whose SHAs, round, or reviewer identity differ from the dispatch, or a family-specific report contract.

On the Codex host, `scripts/claude-exec` must run reviewers only in disposable worktrees, prove Opus usage from the result envelope, preserve tracked state, and fail closed on malformed output. On the Claude host, `skills/reviewing/assets/review-dispatch.js` must remain schema-identical to the shared report contract.

## Review and QA ordering

The order in `skills/run/SKILL.md` steps 5 to 8 is fixed: gates stay green after every integrated slice, the docs sweep lands before the review freeze, QA runs only on an accepted head, and Deliver changes no tracked file. Reject any path that publishes a tracked edit without the gate and review sequence. The integrated cross-family review is never dropped.

## External boundaries

`scripts/codex-exec` is the one place a `codex exec` invocation is assembled. `scripts/claude-exec` is the one place a non-interactive Claude invocation is assembled. `scripts/pr-threads` is the one place a GitHub review-thread call is assembled. Reject a second assembly point for any of them.

Merging stays with the user. Only an explicitly armed `bottega:land` may auto-merge a converged non-risk PR under `skills/land/SKILL.md`.

## Cleanup

Run state in a host is the worktree and git-private run brief, plus the Claude-only owner file under `.bottega/`, all removed at delivery. The evidence branch is deleted after merge. Reject a new host-side artifact or a missing removal step.

## Harness duplication

Reject orchestration machinery: a polling loop, a hand-written scheduler, or an instruction line that restates a harness capability such as tracked dispatches, tracked background shell work, or workflows.
