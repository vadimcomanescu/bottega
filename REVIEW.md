# REVIEW

Review guidance specific to this repository. The review gate is `skills/review`, which invokes the vendored `skills/autoreview` helper; the design doctrine is `skills/codebase-design`, and the working agreement is `AGENTS.md`. This file adds only the risks a reviewer without prior Bottega context tends to miss.

## Plugin packaging and host neutrality

Bottega runs as an installed plugin inside arbitrary host repositories. Bottega asset paths handed to a worker (skills, scripts, schemas) must resolve under the install root (`$CLAUDE_PLUGIN_ROOT` when installed, this repo when working inside it); a hard-coded path that exists only in this checkout breaks every installed host. Reject a change that assumes a specific host language, framework, or layout.

## Role and routing boundaries

The orchestrator makes every judgment call; workers return finished answers and never coordinate with each other. Routing lives in one place, the table in `skills/run/SKILL.md`, enforced by `hooks/route-guard.js`. Reject a change that moves a judgment call into a worker, pins a model or effort in an agent file, adds a second routing authority, or copies a shared skill into an agent.

## Frozen target and the vendored helper

The review gate (`skills/review`) freezes base, head, and tree SHAs before the panel round, then invokes the vendored autoreview helper against the frozen base; the helper runs both families and returns one JSON report, the report contract for both. Reject a change that lets the review see a moving target, writes the helper's `--json-output` or `--output` inside the reviewed repo, alters the fixed invocation flags, wraps the helper instead of calling it, or restates the helper's own method in the gate rather than deferring to `skills/autoreview/SKILL.md` by path.

## Review and QA ordering

The order in `skills/run/SKILL.md` steps 5 to 8 is load-bearing: gates green after every integrated slice, the docs sweep before the review freeze, QA only on an accepted head, and a Deliver step that changes no tracked file, so the PR publishes the accepted reviewed head. Reject a change that lets any tracked edit reach the PR without passing the gate and review path first. The integrated cross-family review is the one step never dropped.

## GitHub thread handling

`scripts/pr-threads` is the one place a review-thread call is assembled, `scripts/pr-claim` the one place a PR's session-claim comment call is assembled, and `scripts/codex-exec` the one place a codex invocation is assembled. Reject a second assembly point for any of them. Merging stays with the user; only an explicitly armed `/bottega:land` may auto-merge a converged non-risk PR, per `skills/land/SKILL.md`.

## Cleanup

Run state in a host is the git-private run brief and the gitignored owner file under `.bottega/`; the worktree and run state are removed at delivery. The evidence branch `bottega/evidence-<slug>` is permanent: it never merges and is never deleted. Reject a change that adds any other host-side artifact or drops one of the remaining removal steps.

## Harness duplication

Reject orchestration machinery: a polling loop, a hand-written scheduler, or an instruction line that restates a harness capability (tracked dispatches, tracked background Bash, workflows), whichever file it lands in.
