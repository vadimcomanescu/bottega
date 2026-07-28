---
name: discover
description: The discovery method a run's Discover phase uses whole. Find the unknowns in a request, explain each one to the user in plain words, and settle them together before anything is built. Not user-invocable.
user-invocable: false
---

# Discover

Find what the user could not tell you, before anything is built: what the request does not say, what they could not put into words, what nobody thought to ask. A request followed too literally gets built as written when a different approach was better. A vague one gets the generic answer when this product needed its own. The user can only settle what they understand, so explain every unknown in plain words before asking them to decide it.

Read the request, then read what this repo already decided in its lessons and decision records (`docs/lessons`, `docs/adr`). Do not re-decide what they settled. Then send Opus workers out, one job each:

- the code this change touches, and how this repo already does things like it
- how other people have solved this problem
- the libraries and tools the work will use: what the version installed here actually does, read from its own documentation and source rather than from memory
- which agent skills this runtime has installed for work like this. A worker reads one and reports what it would change here, not that it exists.

A worker returns findings, never a decision.

Ask the user where they are in their thinking, and what experience they have with this problem and with this part of the code. Their answer decides which of the unknowns below are theirs, and how much everything later has to explain. The sweep is finished when the reading and the workers have answered everything they can and what is still open is written down. A request the user leaves fully settled skips everything below.

The user may not know what to ask, what good looks like here, or which potholes the lessons already record. Name what they have not thought to ask, and explain each one in plain words so they can steer the rest, until every one of them has been explained to them.

While the scope is still open, put the options on the table, cheapest to most ambitious, and say which one you would take. The user's reactions set the direction. Some things the user can only judge by seeing, so build those instead of asking: rough prototypes in genuinely different directions, their sources and screenshots kept with the findings. Draw a wireframe only when nothing can be rendered, keep it to layout and flow, and never show an image posing as the finished product. A decision that is open, costly to reverse, and settled by no cheap check goes to `bottega:panel`, and what it returns feeds the questions you ask next. You are through this when the direction is chosen and its edges are stated: what is in, and what is out.

Ask what is still ambiguous, one question at a time, the ones that change the architecture first, each with your recommended answer so a reply can be a yes or a correction. Every question carries its explanation in the same message, in the product's own words and with a concrete example: what happens today, what each answer would change, and what it would cost. Explain any term the user has not been given before you use it, whatever the run called it while exploring. "I don't understand" means the explanation was missing, not that the question was too long: explain more fully and ask again, never shorter. Keep asking until you can predict how the user will judge the finished work.

When the user cannot find words for what they want, ask for code that already does it their way, in any repo or language. It beats any description. Read what they point at and keep the pointer with the findings, so no decision is left waiting on words the user could not find.

You are done when nothing is left open and you hold the direction, its edges, and every decision with its answer. Keep what settled them, the approved prototype sources, the screenshots and the references, for as long as you are building: a brief that points at a render the user approved tells a builder more than prose describing it.

An autonomous run has no user: settle each step from the repo's precedent and the standard way, and record each settlement with its reason.
