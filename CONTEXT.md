# Bottega

The delivery method's own vocabulary: the terms every skill, brief, and doc in this repo uses with one meaning. Domain meaning only; the mechanics live in the skills the Map routes to.

## Language

**Run**:
One piece of work taken from request to a delivered PR, owned by one orchestrator session on its own branch and worktree.
_Avoid_: commission, pipeline, job

**One-shot**:
A run whose work the orchestrator fully understands on reading it, built directly and taken straight to Review; the floor (isolation, gates, integrated review, PR) never drops.

**Orchestrator**:
The session running the maestro method: it keeps design, routing, and arbitration in its own turns and dispatches everything else.
_Avoid_: maestro (the skill's name, not the actor's), coordinator

**Worker**:
A fresh context given one dispatched job and returning one report: a builder, a reviewer, the QA driver, a panel seat, the plan editor.
_Avoid_: seat (panel seats only), agent (the harness's word)

**Builder**:
The worker that changes product code, on one slice or one repair, under the implementing doctrine.
_Avoid_: building (collided with the Build phase; renamed 0.86.0)

**Dispatch**:
One worker start: a fresh context, one task, a finished answer read by the dispatcher; workers never coordinate with each other.

**Slice**:
One vertical unit of the plan with named owned files, buildable and gated on its own before it merges to the run branch.

**Gate**:
A project command whose green result a change must hold: format, lint, typecheck, tests, build. The map is the commands' one home.

**Editor**:
The fresh cross-family reader of the plan strengthen pass: it approves the plan unchanged or rewrites it whole; the rewrite is its only way to object.
_Avoid_: plan reviewer (a reviewer files findings; the editor may not)

**Owner file**:
The gitignored file naming the session that owns a run; the route guard polices the session named there.

**Followup**:
A real finding or deferred item filed as one tracker issue before the PR opens, so the PR body links it.

**Lesson**:
A failure record in docs/lessons: what happened, the rule, and where the rule is enforced; its rule lands where the repository enforces it best.

**Spec**:
The agreed statement of what the work does, in product language, committed as a dated file in docs/specs on the branch that builds it; the file's own status line says whether it is agreed.

**Plan**:
The statement of what a builder must not decide (terms, ownership, interfaces, slices), committed in docs/plans on the run branch and revised as the work teaches.

**Harness**:
The runtime a session runs in: Claude Code or Codex. The project is the repository a run works on; the two are never the same word.
_Avoid_: host (overloaded across both meanings; banned 0.64.0)
