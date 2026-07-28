---
name: discover
description: The discovery method a run's Discover phase uses whole. Find the unknowns in a request, explain each one to the user in plain words, and settle them together before anything is built. Not user-invocable.
user-invocable: false
---

# Discover

Find what the user couldn't tell you before anything is built: what the request doesn't say, what they couldn't write down, what nobody thought to ask. Too specific a request gets followed where a pivot was better; too vague gets the standard answer where this product needed its own. The user can only settle what they understand, so every unknown found here reaches them as a plain-words explanation before any question rests on it.

## 1. Explore

Read the request, then read what the repo already decided: its lessons and decision records (`docs/lessons`, `docs/adr`). Do not re-decide what they settled.

Then send Opus workers out, one job each, web search on:

- the code this touches, and how this repo already does things like it;
- how other people solved this;
- what the installed versions actually do, read from their own docs and source, never from memory;
- which agent skills this runtime has installed for this work. A worker reads the skill and says what it would change here, not that it exists.

A worker returns findings, never a decision.

Ask the user where they are in their thinking and what experience they have with this problem and this part of the code. Their answer sets which unknowns below they have, and how much every later step has to explain.

A request this reading and sweeping shows fully settled runs none of the steps below. Complete when everything reading and sweeping can answer is answered and what stays open is listed.

## 2. Blind spot pass

The user may not know what questions to ask, what good looks like, or what potholes the lessons record. Find their unknown unknowns and explain each one in plain words, so they can steer the rest. Complete when every one found is explained to the user.

## 3. Brainstorms and prototypes

When the scope is still open, brainstorm: ways to intervene, cheapest to most ambitious, with your recommendation; the user's reactions set the direction. A criterion the user only knows when they see it gets built instead of asked: rough prototypes in wildly different directions, sources and screenshots kept with the findings, and a wireframe only when nothing can render, layout and flow, never an image posing as the finished product. A decision that is open, costly, and settled by no cheap check goes to `bottega:panel`; its comparison of the drafts feeds the interview. Complete when the direction is chosen and its edges stated: what is in, what is out.

## 4. Interviews

Ask about the ambiguities that remain, one question at a time, architecture-changing first, each with your recommended answer so a reply is a yes or a correction. Every question stands on an explanation given in the same message, in the product's own words with a concrete example: what exists today, what each answer would change, and what it would cost. A term the user hasn't been given, whatever the run called it while exploring, is explained before it is used. "I don't understand" means the explanation was missing, not that the question was too long: explain fuller and ask again, never shorter. Complete when you can predict the user's acceptance decisions.

## 5. References

When the user can't find words for what they want, ask for source code that does it their way, in any repo or language; it beats any description. Read what they point at; the pointer travels with the findings. Complete when no decision rests on words the user could not find.

When no unknown is left unaddressed, hand the caller the direction, its edges, and each decision with its answer, together with the artifacts that settled them: the approved prototype sources, the screenshots, the references. The caller keeps them while the work is built; a brief that points at an approved render tells a builder more than prose describing it.

An autonomous run has no user: resolve each step from the repo's precedent and the standard way, recording each resolution with its reason.
