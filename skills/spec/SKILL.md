---
name: spec
argument-hint: "<task, issue URL, or direction>"
description: Prepare a task or issue for delivery without building it. Explore the codebase and the field, grill the open decisions, agree a spec, then file a parent tracker issue and child tickets a run picks up. Invoke via /bottega:spec when the user wants work shaped into an agreed spec and tickets rather than delivered now. Never invoke proactively; it runs a full discovery and grilling session and files issues on the tracker.
---

# Spec

Produce a spec the owner approves, without implementing the task. Whether the user invoked `/bottega:spec` directly or a run is using this skill to prepare its spec ahead of the run's own sign-off, you explore the task, gather independent proposals when needed, grill the open decisions, prototype what hinges on look or feel, and present the spec to the owner. After a direct invocation, ask once whether to file tracker tickets; if the owner says yes, file them, and a later run builds the work from them. Inside a run, hand the spec back to the run's sign-off and leave the tracker unchanged.

## 1. Explore

Read the repo facts first: the smallest map that routes the task (root `CLAUDE.md` or `AGENTS.md`), then `CONTEXT-MAP.md` if present, then only the `CONTEXT.md` glossaries and `docs/adr/` decisions the work touches. Current docs only; archived and superseded ones are history.

Then, on cheaper tiers, launch a subagent per job that applies: explore how the affected area of the codebase works today and the precedent it sets; research how the field solves this problem and where it is heading; and read the technology skills in this runtime that match the work. Run the field job on any product-shaped work: the codebase answers how we already do it here, the field answers the standard way.

Read what comes back, then read directly the files any decision hinges on. Verify version-sensitive technology against the installed version and primary vendor docs before a decision relies on it. Every decision is yours; a subagent returns findings, never a decision.

## 2. Propose independently

Run this step only when all three hold: the decision shapes what the product does or means for its users; after exploring, at least two credible product directions survive (two ways the product could go, not two models disagreeing); and picking wrong would be expensive to undo or hard to notice later.

When they hold, put the same evidence to independent drafts from different model families by invoking [`bottega:panel`](../panel/SKILL.md), each draft blind to the others. Ask each draft for three things: what this feature could be, which assumptions need the owner's confirmation, and what the owner should be asked. The panel returns a compare-only map: where the drafts agree, where they contradict, what only one saw. Grill from that map, and write the spec yourself.

Run this before the grilling, because the owner's answers narrow the direction: independent proposals are worth most while the job is still finding the right options and the right questions. Keep the panel small; two seats from different companies carry nearly all the independence, because different companies miss different things.

## 3. Grill

List the unknowns the request leaves open: the risks the code, history, or domain point to but the request omits. Then sweep for blind spots: the questions neither you nor the request thought to ask, strongest where the owner is furthest from the domain. Rank everything by impact, and ask earliest where the answer would change the architecture. Resolve each unknown from a repo fact where one exists, searching the project's own precedent before you reach for the user. Put what remains to the user one question at a time, each with your recommended answer, so a reply is a yes or a correction. Keep asking until you can predict the user's acceptance decisions.

## 4. Prototype a look-or-feel decision

Trigger: a decision hinges on how something looks or feels, a preference the user cannot answer in words.

Build rough, real, rendered artifacts and screenshot them. When the choice is open, build several directions the user can react to, and show the user flow, not one frame. The user reacts before anything is wired up. State the settled decision in words in the spec and attach the screenshots as evidence. Prototype code is evidence, never truth: it never merges, and the build rewrites it from the agreed spec.

Where you build it depends on the entry point:

- Invoked directly: create a worktree on branch `bottega/spec-<slug>`, build there, and push the branch. Delete the local worktree when the session ends. The parent issue you file at publish links the branch.
- Inside a run: build in the run's existing worktree. Add no branch.

If nothing can render, and only then, draw a wireframe in the spec body: layout and flow, never an image posing as the finished product.

## 5. Present

The shared editor is hosted, so the spec passes through its operator's servers. Offer it to the owner first; an owner who cannot accept that declines it, and the same review happens in the conversation, the spec presented as text. The publish mechanics below are for an owner who accepts.

Present the spec as a live shared document: the owner reads it rendered, on any device, and comments on the text directly. [references/live-review.md](references/live-review.md) has the mechanics; load it here. Reply inside each comment thread, saying whether you agree and why, and make any resulting change as a tracked edit the owner accepts or rejects. Threads resolve as they settle, on the one living document, through every round. The local markdown file stays the single source of truth: mirror the agreed state back to it; it is the file publish commits.

The owner's approval may arrive as a comment in the document, in their own words; that is the go signal, the same as a reply in the conversation.

[references/spec-format.md](references/spec-format.md) gives the document's shape and prose rules: start from that floor and let the discussion and your findings drive the rest. It is a floor, never a template to fill.

As decisions settle, resolve the domain terms the work introduces or sharpens (the method is in [`bottega:codebase-design`](../codebase-design/SKILL.md)) and record them in the spec. Write no `CONTEXT.md` or `docs/adr/` entry from this session; the run that later builds a ticket writes those after approval.

## 6. End by entry point

- Invoked directly: ask once whether to push to tickets, then wait. On yes, publish (step 7). On no, delete any spec branch this session pushed, local and remote, before the session ends; the settled decision already lives in the spec's words.
- A run's front half: hand back to the run's sign-off rules. Do not ask about tickets.

## 7. Publish

Commit the spec as `docs/specs/<slug>.md` on branch `bottega/spec-<slug>` (the branch the prototype used, created now when none exists) and push it. The branch is permanent and never merges itself: the run that delivers the first child ticket carries the file into its own branch, so the spec lands on trunk with the code it describes and grounds later runs (`docs/adr/0004-specs-in-the-repo.md`).

Open one parent tracker issue that links the spec file on that branch. Then cut a child ticket for each [coherent unit](../codebase-design/SKILL.md) one run delivers. A ticket is queue state, never the spec's home: it states its unit's scope in the spec's language under the prose rules of [references/spec-format.md](references/spec-format.md), references the parent, states its dependencies on the other tickets, and takes the project's area label. The spec never claims a ticket; each run claims its own. Report the parent and the tickets.
