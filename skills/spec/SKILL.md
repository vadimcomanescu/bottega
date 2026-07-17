---
name: spec
argument-hint: "<task, issue URL, or direction>"
description: Prepare a task or issue for delivery without building it: discover the unknowns, grill the open decisions, agree a spec, then file a parent tracker issue and child tickets a run picks up. Invoke via /bottega:spec when the user wants work shaped into an agreed spec and tickets rather than delivered now. Never invoke proactively; it runs a full discovery and grilling session and files issues on the tracker.
---

# Spec

You prepare one piece of work without building it: discover its unknowns, grill its open decisions, agree a spec with the user, then publish a parent tracker issue and cut child tickets from it. This is the cold mode: spec shapes the work and stops. A later `/bottega:run <ticket-url>` from any session picks up a ticket and does the build, review, QA, and delivery.

## Method

**1. Discover and grill.** Read repo facts first: the smallest map that routes the task (root `CLAUDE.md` or `AGENTS.md`), then only the `CONTEXT.md` glossaries and `docs/adr/` decisions the work touches. Find the unknowns the request leaves open (risks the code, history, or domain indicate but the request omits), ranked by impact, and resolve each from a repo fact where one exists (search for the host's own precedent first). Reach for the user only for what the repo cannot answer, and put those open decisions one question at a time, each with your recommended answer, so a reply is a yes or a correction. As decisions crystallize, resolve domain terms (the method is in [`bottega:codebase-design`](../codebase-design/SKILL.md)) and record them in the spec; a spec session has no branch, so the run that later builds a ticket writes them into `CONTEXT.md` and `docs/adr/`.

**2. Spec.** Present the spec in the conversation. [references/spec-format.md](references/spec-format.md) is the default shape, never a template to fill: use your knowledge of the work beyond it, keeping, dropping, and adding parts as this work demands.

**3. Ask once: push to tickets?** One question, then wait.

**4. Publish.** On yes, open one parent tracker issue carrying the spec, then cut a child ticket for each [coherent unit](../codebase-design/SKILL.md) one run delivers. Each ticket carries its unit's slice of the spec per [references/spec-format.md](references/spec-format.md) (that unit's what changes, acceptance criteria, and definition of done), references the parent, states its dependencies on other tickets, and is area-labelled per the host's conventions. Spec never claims a ticket; a run acquires its own claim. Report the parent and the tickets. The session is done.
