# Bottega

The delivery method's own vocabulary: the terms every skill, brief, and doc in this repo uses with one meaning. Domain meaning only; the mechanics live in the skills the Map routes to.

## Language

**Run**:
One piece of work taken from request to a PR ready to merge, owned by one orchestrator session on its own branch and worktree; the launch decides the release.
_Avoid_: commission, pipeline, job

**Launch**:
The moment the user hands work to a run, carrying the release answer: land on green, or hold. A request that says neither gets one plain question from maestro before any PR exists.
_Avoid_: kickoff, start (say launch when the release answer is meant)

**Orchestrator**:
The session running the maestro method: it keeps design and arbitration in its own turns and dispatches everything else.
_Avoid_: maestro (the skill's name, not the actor's), coordinator

**Worker**:
A fresh context given one dispatched job and returning one report: a builder, a reviewer, the QA driver, a panel seat, the closeout seat, the codex second opinion.
_Avoid_: agent (the harness's word)

**Seat**:
A dispatched position one model occupies whole: a panel seat holding one draft, or the closeout seat running the review method to its converged head.
_Avoid_: seat for any other worker

**Builder**:
The worker that changes product code, on one slice or one repair, under the implement doctrine.
_Avoid_: building (collided with the Build phase; renamed 0.86.0)

**Dispatch**:
One worker start: a fresh context, one task, a finished answer read by the dispatcher; workers never coordinate with each other.

**Slice**:
One vertical unit of the work with named owned files, buildable and gated on its own before it merges to the run branch.

**Gate**:
A project command whose green result a change must hold: format, lint, typecheck, tests, build. The map is the commands' one home.

**Threat model**:
The sentence a check, gate, or validator ships with, naming the class of input it answers for (accidental states, adversarial input, untrusted data) and what it deliberately does not catch. The review judges each finding's reachability against it: a finding whose failure scenario needs an actor outside the model is real but not work.

**Plan**:
The run's design written down per the architect doctrine: what a builder must not decide, the interfaces the tests cross, any threat model, and the vertical slices. Posted as one comment on the run's issue, beside the spec, before any builder starts. A run with no tracker issue keeps it in the conversation.
_Avoid_: execution plan, design (design stays the activity, plan is the artifact)

**Second opinion**:
The fresh codex read of the run's spec and plan before building, held to one bar: revise only where a strong maintainer would clearly agree the revision is necessary or materially better. Otherwise the plan is ready.

**Panel**:
One open, costly decision that no cheap check settles, put as the same task to independent models, blinded, compared without a verdict; whoever ran the panel writes the decision from the drafts. The review's both-engine invocation is the vendored engine document's own word for its reviewers, not this term.
_Avoid_: panel for any critique of an existing answer

**Owner**:
The person the work is for: they give the request, settle the unknowns with the run, and receive what only a person can clear. A skill the run uses while they are in the conversation is written in their voice, so it says "I" and "me" for this same person. A skill dispatched to a fresh worker has no one in the room and names the orchestrator instead.
_Avoid_: owner for the session that claims a run (that meaning belongs to the owner file below)

**Owner file**:
The gitignored file naming the session that claims a run, a session and never a person; the route guard polices the session named there.

**Release file**:
The gitignored file beside the owner file carrying the run's launch answer, `land` or `hold`; close reads it before the PR opens.

**Landing procedure**:
The project's own answer to what lands a pull request: the brake that holds one out of the merge, what arms it (the opener, a merge queue taking every non-draft PR, or nothing), and the check that decides the merge. Open reads it from the agent map and writes back what it had to discover, close delivers under it, and no run carries a copy of one project's answer to the next.
_Avoid_: merge contract, landing rules

**Followup**:
A real finding or deferred item filed as one tracker issue before the PR opens, so the PR body links it.

**Lesson**:
A failure record in docs/lessons: what happened, the rule, and where the rule is enforced; its rule lands where the repository enforces it best.

**Spec**:
The synthesis of a closed discovery, published on the run's tracker issue: the problem, the announcement, user stories, implementation decisions, testing direction, acceptance criteria, out of scope. The issue that carries it anchors the run.
_Avoid_: PRD, plan

**Discovery artifacts**:
What discovery produces and the run keeps close while it builds: the prototypes, their screenshots, the settled decisions, the references. Briefs point at them and QA judges against them. Each validated decision lands in the spec, each prototype is captured to a throwaway branch off main with its pointer and verdict on the run's issue, and main keeps only the validated decisions.

**Harness**:
The runtime a session runs in: Claude Code. The project is the repository a run works on; the two are never the same word.
_Avoid_: host (overloaded across both meanings; banned 0.64.0)
