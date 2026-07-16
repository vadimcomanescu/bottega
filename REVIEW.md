# REVIEW

Bottega-specific review guidance for changes to this repository. The general reviewer method is `skills/reviewing` and the design doctrine is `skills/codebase-design`; this file carries only the risks a cold reviewer cannot reconstruct from one of those alone.

## Plugin packaging and host neutrality

Bottega runs as an installed plugin inside arbitrary host repositories. Every path handed to a worker must resolve under the install root (`$CLAUDE_PLUGIN_ROOT` when installed, this repo when working inside it), never a path that exists only in this checkout. Never create a doc or config surface in a host that the host does not already have. Reject a change that assumes a specific host language, framework, or layout.

## Role and routing boundaries

Judgment stays with the orchestrator: design, routing, adjudication of findings, acceptance of the head. Workers receive one task and return one finished answer; they never coordinate with each other or pick their own model. Agent files never pin model or effort; routing lives in the run skill's table, enforced by the route guard. Codex routing is capped at gpt-5.6-sol, and fable is dispatched only through the panel's bundled workflow. Reject a change that moves a judgment call into a worker, pins routing in an agent file, or copies a shared skill into an agent.

## Frozen target and schema identity

The review gate fixes base, head, and tree SHAs before round 1 and rejects any report whose SHAs or reviewer identity differ from the dispatch. Both reviewer families report against `skills/reviewing/references/report.schema.json` at schema_version 2. Reject a change that lets a reviewer see a moving target or that alters one family's report shape without the other.

## Review and QA ordering

Host gates are green after every integrated slice. Documentation reconciliation happens before the final host gate and the review freeze, so the integrated review covers doc fixes. QA runs only on a head Fable accepted, and the PR publishes that exact head; no Deliver step changes a tracked file. An implementation repair takes gates, an opposite-family delta review, acceptance, and fresh QA; a changed brief reopens build and both-family review.

## GitHub thread handling

Every land review-thread action is assembled in `scripts/pr-threads`, and every codex invocation in `scripts/codex-exec`. Reject a second assembly point for either. PRs are never auto-merged; the user merges. PR bodies carry review-relevant content only, with no tool, model, or vendor attribution.

## Cleanup

A run leaves nothing in the host but the PR. Working state is the worktree, one git-private run brief, and one gitignored owner file under `.bottega/`, all removed at delivery; the evidence branch is deleted after merge. Reject a change that writes any other file into a host or drops a cleanup step.

## Harness duplication

Orchestration is the harness: tracked dispatches, tracked background Bash, workflows. A polling loop, a hand-written scheduler, or an instruction line that restates worker tracking is a defect, whichever file it lands in.
