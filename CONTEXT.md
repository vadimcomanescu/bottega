# Bottega

The delivery method's own vocabulary: the terms every skill, brief, and doc in this repo uses with one meaning. Domain meaning only; the mechanics live in the skills the Map routes to.

## Language

**Run**:
One piece of work taken from request to a PR ready to merge, owned by one orchestrator session on its own branch and worktree; the owner's merge is the release.
_Avoid_: commission, pipeline, job

**One-shot**:
A run whose whole diff the orchestrator can state in one sentence after discovery, built directly and taken straight to Review with no spec and no plan; it still gets its own worktree and branch, gates green, the integrated review, and a PR.

**Orchestrator**:
The session running the maestro method: it keeps design and arbitration in its own turns and dispatches everything else.
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

**Plan editor**:
The fresh GPT reader of the plan strengthen pass: it approves the plan unchanged or rewrites it whole; the rewrite is its only way to object.
_Avoid_: editor on its own (the spec's live review calls its shared document the editor); plan reviewer (a reviewer files findings; the plan editor may not)

**Panel**:
One open, costly decision that no cheap check settles, put as the same task to independent models, blinded, compared without a verdict; the caller synthesizes the decision. The review's both-engine invocation is the vendored engine document's own word for its reviewers, not this term.
_Avoid_: panel for any critique of an existing answer

**Owner**:
The person the work is for: they give the request, approve the spec, and receive what only a person can clear. Prose inside a run says "the user" for this same person; prefer that word there.
_Avoid_: owner for the session that claims a run (that meaning belongs to the owner file below)

**Owner file**:
The gitignored file naming the session that claims a run, a session and never a person; the route guard polices the session named there.

**Followup**:
A real finding or deferred item filed as one tracker issue before the PR opens, so the PR body links it.

**Lesson**:
A failure record in docs/lessons: what happened, the rule, and where the rule is enforced; its rule lands where the repository enforces it best.

**Spec**:
The agreed statement of what the work does, in product language, committed as a dated file in docs/specs on the branch that builds it; the file's own status line says whether it is agreed.

**Plan**:
The statement of what a builder must not decide (terms, ownership, interfaces, slices), committed in docs/plans on the run branch and revised as the work teaches.

**Harness**:
The runtime a session runs in: Claude Code. The project is the repository a run works on; the two are never the same word.
_Avoid_: host (overloaded across both meanings; banned 0.64.0)
