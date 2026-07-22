# Plan: the plan becomes its own method

Spec: `docs/specs/2026-07-22-plan-skill.md`. Scaled-down run: one pass, built by the orchestrator, gates and review kept.

## Decisions

- A new skill, `skills/plan/SKILL.md`, carries the whole plan method in three steps: model, commit, strengthen. Maestro step 3 reduces to invoking it plus the scale-down rule.
- The strengthen pass is verdict-gated (ready or blockers), cross-family, capped at five rounds; the reviewer's calibration states an invented blocker fails as hard as a missed one.
- Routing gains the strengthen pass rule: gpt-5.6-sol at xhigh under a Claude orchestrator, fable-5 at xhigh under a Codex orchestrator.
- The fan-out, nested-subagent, worktree-per-slice, and strengthen mechanisms did not run in this scaled-down delivery; issue #94 tracks their live verification per the adopted-equipment lesson.
- Maestro step 4 grounds parallelism on the plan's ownership map, names worktree isolation per slice, and states the Claude-side preferences: one dynamic workflow for the fan-out, review dispatch carried in it, subagents may spawn subagents.
- README and AGENTS.md follow; plugin version 0.79.0.

## Slices

1. Doctrine edits across `skills/plan/`, `skills/maestro/`, `skills/routing/`, `README.md`, `AGENTS.md`, `.claude-plugin/plugin.json`, plus this plan and its spec. Status: landed.
