# The harness-engineering study, recorded for the next session

Status: agreed 2026-07-22

## Problem to solve

Bottega is built on harness engineering, and the practice now has a published corpus: twelve developed arguments, two playbooks, an evaluation method, and a set of worked cases. A session read that corpus in full and worked out which parts bottega already implements, which parts are worth adopting, and which are wrong for this repository and why. That reading exists only in one conversation. The next session that asks the same question pays the same reading cost, and reaches a different answer, because nothing in the repository records the first one. The rejected options are the most expensive part to lose: without the reasons, a later session re-proposes them and someone re-argues them from scratch.

## How we measure success

A session that opens the repository months from now can find this reading without being told it exists, can tell a recommendation from a decision the repository has actually taken, and can check any claim in it against the source it came from. The signal it worked is a later run that picks up one of the recommendations and does not first re-read the corpus, or one that drops a rejected idea by pointing at the record instead of re-litigating it.

## The launch post

The repository keeps a shelf of research notes: what an outside body of work says, what bottega concluded from it, and the date the reading happened. The harness-engineering study joins that shelf.

The note separates three things a reader must not confuse. What the corpus argues, attributed to the corpus and pinned to the exact revision that was read. What bottega already does, each claim naming the part of the method that does it. What bottega should consider changing, each item marked as a proposal that no one has agreed to yet, with the place it would land and the evidence from the corpus that motivates it. Items considered and rejected carry their reasons, so the record closes the question rather than reopening it.

The shelf itself becomes findable. The repository's map already routes a reader to its decisions, its failure records, its specs, and its plans. It gains a row for its research, so the map answers "where is the reading behind this" the way it already answers "where is the decision behind this".

## Decisions

**The recommendations ship as proposals, not as doctrine.** The user asked for the study recorded, not for it to be implemented. The repository already separates these two registers: decision records carry choices the repository has made, and failure records carry rules it enforces. A finding that has not been agreed belongs in neither, so each recommendation states plainly that it is proposed and not agreed. The standard way this is done elsewhere is the architecture-decision-record convention of an explicit status field, described at adr.github.io; this spec follows it, in prose rather than a field, because a research note carries many findings at one status rather than one decision at its own.

**The source is pinned to the revision that was read.** An outside repository moves; a claim about "what it says" stops being checkable the moment it does. The note names the commit it was read at. This follows the repository's own rule that an excerpt of a live document is quoted with its revision so it reads as history, recorded after a copied file drifted from its original within hours.

**The map gains a research row.** Two notes now sit in a directory the map does not mention, which makes them unreachable by the route a session is told to follow. The standard way this is solved is matklad's architecture-document convention of a short codemap that answers "where is the thing that does X", which this repository already follows for its other document kinds; the row extends it to one more.

**The study's own scope is the reading, not the changes it proposes.** None of the recommendations are implemented here. Each names where it would land so a later run can pick it up as its own work.

**Attribution stays inside the note.** The corpus is published under a Creative Commons attribution licence, so the note carries the attribution the licence asks for. This does not change the repository's rule that delivery artifacts stay free of tool and vendor attribution, which governs pull requests and commits rather than a document's citations.

## Details

The note dates the reading, because a reading of a moving corpus is true as of a day.

Claims about bottega's current behavior are written against the method as it stands in this release, each naming the part of the method it describes, so a reader can check the claim rather than trust it.

The note's recommendations are ordered by the value the reading assigned them, strongest first, and each states what it would change and where.

## Acceptance criteria

- The repository carries one research note on the harness-engineering corpus, dated, and naming the exact revision of the source it was read at.
- The note states what the corpus argues, what bottega already implements, six proposed adoptions, the items named but deliberately not built, and the items rejected with their reasons.
- Every proposed adoption is marked as proposed and not agreed, and names where it would land.
- The repository's map routes a reader to its research notes.
- The repository's verification gate passes.

## Out of scope

- Implementing any proposed adoption. Each is a later run's work.
- Changing any skill, hook, or test to enforce a proposal.
- Recording any proposal as a decision record or a failure record.
- Vendoring any part of the source corpus into this repository. The note points at it.

## Deferred to the build

- The note's exact section order and headings, within the shape the existing research note sets.
- The wording of the map's research row.
- The release version number and its headline.
