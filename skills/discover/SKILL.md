---
name: discover
description: The discovery method a run's Discover phase uses whole. Find the unknowns in a request and settle them with the user before any spec is written. Not user-invocable.
user-invocable: false
---

# Discover

Discover the unknowns in the request before any spec is written: what it does not say, what the user could not write down, what nobody thought to ask. Too specific a request gets followed where a pivot was better; too vague gets the standard answer where this product needed its own; and each step below is a cheap way to find one kind of unknown before it is expensive in code.

## 1. Explore

Read what the request settles and what the repo records about the code and the problem it touches, then dispatch workers on the explorer's row of [the worker table](../maestro/references/workers.md), one per job that applies: the affected code and its precedent, how others solve this today, the technology skills in this runtime. A worker returns findings, never a decision; verify version-sensitive technology against the installed version before a decision relies on it. Ask the user what the looking cannot show: where they are in their thinking, and their experience with the problem and this part of the code; their answer tells you which kinds of unknowns below they have. A request this step shows fully settled runs none of the steps below. Complete when everything the looking can answer is answered, and what remains open is listed.

## 2. Blind spot pass

When the user starts work in a new part of the codebase or on an unfamiliar kind of work, they may not know what questions to ask, what good looks like, what historical work has been done, or what potholes to avoid. Find their unknown unknowns and explain them, so they can steer the rest. Complete when every one found is explained to the user.

## 3. Brainstorms and prototypes

When the scope is still open, brainstorm: ways to intervene, cheapest to most ambitious, with your recommendation; the user's reactions set it. When a criterion is one the user only knows when they see it, prototype instead of asking: rough, rendered, several directions, through a worker on the prototyper's row; the sources and screenshots are kept and travel with the findings. If nothing can render, and only then, a wireframe: layout and flow, never an image posing as the finished product. A decision that is open, costly, and settled by no cheap check goes to `bottega:panel`; its map feeds the interview. Complete when the direction is chosen and its edges stated: what is in, what is out.

## 4. Interviews

After brainstorming, ambiguities the user can name likely remain: ask about them one question at a time, in plain words, the architecture-changing ones first, each with your recommended answer so a reply is a yes or a correction. Complete when you can predict the user's acceptance decisions.

## 5. References

When the user cannot describe what they want, ask for source code that does it their way, in any repo or language; it beats any description. Read what they point at; the pointer travels with the findings. Complete when no decision rests on words the user could not find.

When no kind of unknown is left unaddressed, hand the caller the direction, its edges, and each decision with its answer.

An autonomous run has no user: resolve each step from the repo's precedent and the standard way, recording each resolution with its reason.
