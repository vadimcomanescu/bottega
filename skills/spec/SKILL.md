---
name: spec
argument-hint: "<task, issue URL, or direction>"
description: Prepare a task or issue for delivery without building it. Explore the codebase and the field, grill the open decisions, agree a spec, then file a parent tracker issue and child tickets a run picks up. Invoke via /bottega:spec when the user wants work shaped into an agreed spec and tickets rather than delivered now. Never invoke proactively; it runs a full discovery and grilling session and files issues on the tracker.
---

# Spec

Shape a task into an agreed spec and tickets without building it. A later run picks up a ticket and does the build, review, QA, and delivery; this session stops at the tickets.

This method has two entry points: you, invoked directly, and a run's front half. Explore, propose, grill, prototype, and present are the same for both. Only the ending forks (step 6).

## 1. Explore

Read the repo facts first: the smallest map that routes the task (root `CLAUDE.md` or `AGENTS.md`), then `CONTEXT-MAP.md` if present, then only the `CONTEXT.md` glossaries and `docs/adr/` decisions the work touches. Current docs only; archived and superseded ones are history.

Then fan out a reader per job that applies, each sharply divided and under a stated budget:

- **Codebase sweep.** How the affected area works today and the precedent it sets.
- **Field pass.** Search the web for how the wider industry solves this. Run it on any product-shaped work: repository precedent answers how we already do it here, and the field pass answers what the standard way is.
- **Skills inventory.** The technology skills in this runtime that match the work.

If your harness can run reader jobs in parallel, launch one per applicable job on a cheap tier; each returns a short dossier and nothing more. If it cannot, do the same reads yourself, inline, under the same budgets.

Read the dossiers, then read directly the files any decision hinges on. Verify version-sensitive technology against the installed version and primary vendor docs before a decision relies on it. Every decision is yours. A reader returns findings, never a decision.

## 2. Propose independently

Trigger, all three together: the decision shapes what the product does or means for its users; after exploring, at least two credible product directions survive, meaning two ways the product itself could go, not two models disagreeing; and picking wrong would be expensive to undo or hard to notice later.

When it fires, put the same evidence to independent drafts from different model families through [`bottega:panel`](../panel/SKILL.md), each draft blind to the others. Ask each for three things: what this feature could be, which assumptions need the owner's confirmation, and what the owner should be asked. The panel returns the compare-only map of where the drafts agree, where they contradict, and what only one of them saw. Run the grilling from that map, and still write the spec yourself.

Do this before the grilling because the owner's answers narrow the direction, so independent proposals are worth most while the job is still making sure the right options and the right questions exist at all. Keep the panel small: a couple of seats from different companies carry nearly all the independence, because they miss different things and a draft shown another is pulled toward it.

## 3. Grill

List the unknowns the request leaves open: the risks the code, history, or domain point to but the request omits. Rank them by impact. Resolve each from a repo fact where one exists, searching the host's own precedent before you reach for the user. Put what remains to the user one question at a time, each with your recommended answer, so a reply is a yes or a correction. Keep asking until you can predict the user's acceptance decisions.

## 4. Prototype a look-or-feel decision

Trigger: a decision hinges on how something looks or feels, a preference the user cannot answer in words.

Build a rough, real, rendered artifact and screenshot it. State the settled decision in words in the spec and attach the screenshots as evidence. Prototype code is evidence, never truth: it never merges, and the build rewrites it from the agreed spec.

Where you build it depends on the entry point:

- Invoked directly: create a worktree on branch `bottega/spec-<slug>`, build there, and push the branch. Delete the local worktree when the session ends. The parent issue you file at publish links the branch.
- Inside a run: build in the run's existing worktree. Add no branch.

If nothing can render, and only then, draw a wireframe in the spec body: layout and flow, never an image posing as the finished product.

## 5. Present

The shared editor is hosted, so the spec passes through its operator's servers. Offer it to the owner first; an owner who cannot accept that declines it, and the same review happens in the conversation, the spec presented as text. The publish mechanics below are for an owner who accepts.

Present the spec as a live shared document: the owner reads it rendered, on any device, and comments on the text directly. [references/live-review.md](references/live-review.md) has the mechanics; load it here. Reply inside each comment thread, saying whether you agree and why, and make any resulting change as a tracked edit the owner accepts or rejects. Threads resolve as they settle, on the one living document, through every round. The local markdown file stays the single source of truth: mirror the agreed state back to it, and it is what the ticket carries.

The owner's approval may arrive as a comment in the document, in their own words; that is the go signal, the same as a reply in the conversation.

[references/spec-format.md](references/spec-format.md) gives the document's shape and prose rules: start from that floor and let the discussion and your findings drive the rest. It is a floor, never a template to fill.

As decisions settle, resolve the domain terms the work introduces or sharpens (the method is in [`bottega:codebase-design`](../codebase-design/SKILL.md)) and record them in the spec. Write no `CONTEXT.md` or `docs/adr/` entry from this session; the run that later builds a ticket writes those after approval.

## 6. End by entry point

- Invoked directly: ask once whether to push to tickets, then wait. On yes, publish (step 7). On no, delete any spec branch this session pushed, local and remote, before the session ends; the settled decision already lives in the spec's words.
- A run's front half: hand back to the run's sign-off rules. Do not ask about tickets.

## 7. Publish

Open one parent tracker issue carrying the spec; it links any spec branch this session pushed. Then cut a child ticket for each [coherent unit](../codebase-design/SKILL.md) one run delivers. Each ticket carries its unit's slice of the spec per [references/spec-format.md](references/spec-format.md), references the parent, states its dependencies on the other tickets, and takes the host's area label. The spec never claims a ticket; each run claims its own. Report the parent and the tickets.
