---
name: improve
argument-hint: "<optional area or direction>"
description: Find the single strongest improvement in a codebase, agree it in the conversation, then open a tracker issue and take it through a run. Invoke via /bottega:improve when the user wants the codebase scanned for what to improve next. Never invoke proactively; it opens a run, which costs hours of autonomous agent work.
---

# Improve

Find the single strongest improvement in the codebase, agree it with the user in the conversation, then file it and hand it to a run.

**Read.** Start with the smallest map that routes you (root `CLAUDE.md` or `AGENTS.md`), then read only what the scan needs: the relevant `CONTEXT.md` glossaries, the `docs/adr/` decisions covering the code you will touch, the doc the repository names as its documentation authority, and the tracker's labelling conventions.

**Scope.** Scope by evidence before you scan. The user's named direction wins: scope to it. Without one, walk the commit history for hot spots (the files and modules that churn) and bias the scan there; a change scattered across the history widens the net.

**Scan.** Read the scoped code for friction against [`bottega:codebase-design`](../codebase-design/SKILL.md): shallow modules the deletion test exposes (removing the wrapper makes the complexity disappear rather than return to callers), rules split from the state they protect, ownership that has leaked across an interface, callers that are hard to trace, and documentation-architecture drift (facts restated outside their home, living docs citing the archive, glossary terms the code contradicts). ADRs constrain the scan; do not re-litigate them. Surface a conflict with an ADR only when the friction justifies reopening it.

**Collisions.** Check open issues and PRs before proposing. An improvement already tracked or already in flight is not a finding.

**Propose.** Present one improvement in the conversation: the single strongest [coherent unit](../codebase-design/SKILL.md), at most three findings grouped inside it, each with its evidence and the gain it buys. No HTML, no file report. A finding that fails the coherent-unit test is a separate future proposal, not the fourth item in this one. Wait for the user's approval.

**Hand off.** On approval, create one tracker issue carrying the findings, labelled for its area per the repository's conventions. Write for a reader who was not in this session: define or link every non-standard term. Then invoke `/bottega:maestro` on that issue. Improve never claims the issue; run acquires the claim itself. Report the issue and a one-line summary.
