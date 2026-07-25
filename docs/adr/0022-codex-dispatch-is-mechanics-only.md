# 0022: The codex dispatch method is house-written and mechanics only

Date: 2026-07-25.

Decision: `skills/maestro/references/codex-dispatch.md` is bottega's own prose and holds only the mechanics of driving the codex CLI: the launch, the tracked run, the liveness read and resume, the brief's shape, the report, parallel dispatches. Routing (what work goes to which model), model and effort defaults, sandbox policy, environment gates, and landing workflows stay out of the file. The maestro and each phase's skill own routing, and every dispatch site pins its own model, effort, and sandbox (ADR 0018). This supersedes ADR 0021's vendoring; ADR 0020 stands unchanged (dispatch from the orchestrator's own turn as tracked background Bash, resume over rerun), and 0021's deletion of `scripts/codex-exec` also stands: the method is prose over raw `codex exec`, not a wrapper.

Why: the vendored document mixed the reusable mechanics with its author's work routing, machine-specific gates, and model defaults, so the file the phase skills point at for launch mechanics issued routing orders of its own, a second routing authority beside the orchestrator, and in the opposite direction (its default delegates implementation to codex; bottega's Claude workers build and GPT workers check). The owner directed a mechanics-only method. Its flag claims are verified against the installed CLI (codex-cli 0.144) rather than synced from an upstream whose scope is not bottega's.

Recorded limits: the upstream connection is credit, not a sync contract; codex CLI moves, so a flag dispute is settled by `codex exec --help` at the installed version, and this file follows.
