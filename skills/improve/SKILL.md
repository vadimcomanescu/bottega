---
name: improve
argument-hint: "<optional area or direction>"
description: Scan a codebase for deepening opportunities, present the strongest candidates, agree one, then open a tracker issue and take it through a run. Invoke bottega:improve when the user wants the codebase scanned for what to improve next. Never invoke proactively; it opens a run, which costs hours of autonomous agent work.
---

# Improve

Surface deepening opportunities: refactors that turn shallow modules into deep ones, so the codebase gets easier to test and to navigate. Agree the strongest with the user, file it, and hand it to a run.

**Read.** Start with the smallest map that routes you (root `CLAUDE.md` or `AGENTS.md`), then read only what the scan needs: the relevant `CONTEXT.md` glossaries, the `docs/adr/` decisions covering the code you will touch, the doc the repository names as its documentation authority, and the tracker's labelling conventions.

**Scope.** The user's named direction wins: scope to it. Without one, walk the commit history for hot spots (the files and modules that churn) and bias the scan there; a change scattered across the history widens the net. Deepening pays off where change keeps happening.

**Scan.** Read the scoped code and note where you experience friction, in the vocabulary of [`bottega:codebase-design`](../codebase-design/SKILL.md):

- understanding one concept requires bouncing between many small modules;
- a module's interface is nearly as complex as its implementation; apply the deletion test: would deleting it concentrate the complexity, or just move it?
- pure functions extracted for testability while the real bugs hide in how they are called;
- tightly coupled modules leaking across their seams;
- code untested, or hard to test through its current interface;
- a custom mechanism for a problem with a standard solution; read that technology's documentation or its skill in this runtime to know the standard, and expect the deepening to be deletion plus adoption;
- a migration left half-finished, so two live patterns answer one concept and every change must first pick between them;
- a test loop slow enough that every change pays it in minutes;
- rules split from the state they protect, ownership leaked across an interface, and documentation-architecture drift: facts restated outside their home, living docs citing the archive, glossary terms the code contradicts.

ADRs constrain the scan: surface a conflict with an ADR only when the friction justifies reopening it, and name the ADR.

**Collisions.** Check open issues and PRs before proposing. An improvement already tracked or already in flight is not a finding.

**Propose.** Present the strongest candidates in the conversation, each a coherent unit per [`bottega:codebase-design`](../codebase-design/SKILL.md): the files, the friction with its evidence, the change in product terms (interface design belongs to the run), the gain in leverage and locality, and a strength: strong, worth exploring, or speculative. Lead with the candidate you would take first and why. No HTML, no file report. The user picks one or rejects.

When the user rejects a candidate for a reason a future scan would need, offer to record it as an ADR so the candidate is not re-proposed. Improve writes that ADR itself: a rejected candidate never reaches a run. Skip ephemeral reasons.

**Hand off.** On the user's pick, create one tracker issue carrying that candidate, labelled for its area per the repository's conventions. Write for a reader who was not in this session: define or link every non-standard term. Then invoke `/bottega:maestro` on that issue. Improve never claims the issue; run acquires the claim itself. Report the issue and a one-line summary.
