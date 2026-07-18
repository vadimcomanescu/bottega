---
name: spec
argument-hint: "<task, issue URL, or direction>"
description: Prepare a task or issue for delivery without building it: explore the codebase and the field, grill the open decisions, agree a spec, then file a parent tracker issue and child tickets a run picks up. Invoke via /bottega:spec when the user wants work shaped into an agreed spec and tickets rather than delivered now. Never invoke proactively; it runs a full discovery and grilling session and files issues on the tracker.
---

# Spec

Shape a task into an agreed spec and tickets without building it. A later run picks up a ticket and does the build, review, QA, and delivery; this session stops at the tickets.

This method has two entry points: you, invoked directly, and a run's front half. Explore, grill, and present are the same for both. Only the ending forks (step 5).

## 1. Explore

Read the repo facts first: the smallest map that routes the task (root `CLAUDE.md` or `AGENTS.md`), then `CONTEXT-MAP.md` if present, then only the `CONTEXT.md` glossaries and `docs/adr/` decisions the work touches. Current docs only; archived and superseded ones are history.

Then fan out three reader jobs, each sharply divided and under a stated budget:

- **Codebase sweep.** How the affected area works today and the precedent it sets.
- **Field pass.** How the wider industry solves this. Fire it only when the work touches a technology or domain the repo holds no precedent for.
- **Skills inventory.** The technology skills in this runtime that bear on the work.

If your harness can run reader jobs in parallel, launch one per job on a cheap tier; each returns a short dossier and nothing more. If it cannot, do the same reads yourself, inline, under the same budgets.

Read the dossiers, then read directly the files any decision hinges on. Every decision is yours. A reader returns findings, never a decision.

## 2. Grill

List the unknowns the request leaves open: the risks the code, history, or domain point to but the request omits. Rank them by impact. Resolve each from a repo fact where one exists, searching the host's own precedent before you reach for the user. Put what remains to the user one question at a time, each with your recommended answer, so a reply is a yes or a correction.

## 3. Prototype a look-or-feel decision

Trigger: a decision hinges on how something looks or feels, a preference the user cannot answer in words.

Build a rough, real, rendered artifact and screenshot it. State the settled decision in words in the spec and attach the screenshots as evidence. Prototype code is evidence, never truth: it never merges, and the build rewrites it from the agreed spec.

Where you build it depends on the entry point:

- Invoked directly: create a worktree on branch `bottega/spec-<slug>`, build there, and push the branch. Delete the local worktree when the session ends. The parent issue you file at publish links the branch.
- Inside a run: build in the run's existing worktree. Add no branch.

If nothing can render, and only then, draw a wireframe in the spec body: layout and flow, never an image posing as the finished product.

## 4. Present

Present the spec in the conversation. [references/spec-format.md](references/spec-format.md) gives its shape and prose rules: start from that floor and let the discussion and your findings drive the rest. It is a floor, never a template to fill.

As decisions settle, resolve the domain terms the work introduces or sharpens (the method is in [`bottega:codebase-design`](../codebase-design/SKILL.md)) and record them in the spec. Write no `CONTEXT.md` or `docs/adr/` entry from this session; the run that later builds a ticket writes those after approval.

## 5. End by entry point

- Invoked directly: ask once whether to push to tickets, then wait. On yes, publish (step 6).
- A run's front half: hand back to the run's sign-off rules. Do not ask about tickets.

## 6. Publish

Open one parent tracker issue carrying the spec; it links any spec branch this session pushed. Then cut a child ticket for each [coherent unit](../codebase-design/SKILL.md) one run delivers. Each ticket carries its unit's slice of the spec per [references/spec-format.md](references/spec-format.md), references the parent, states its dependencies on the other tickets, and takes the host's area label. The spec never claims a ticket; each run claims its own. Report the parent and the tickets.
