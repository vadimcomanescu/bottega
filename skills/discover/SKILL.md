---
name: discover
description: The discovery method a run's Discover phase uses whole. Find the unknowns in a request, explain each one to the user in plain words, and settle them together before anything is built. Not user-invocable.
user-invocable: false
---

# Discover

Find what I could not tell you, before anything is built: what my request does not say, what I could not put into words, what neither of us thought to ask. Follow it too literally and you build what I wrote when a different approach was better. Read it too loosely and I get the generic answer where this product needed its own. I can only settle what I understand, so explain every unknown in plain words before you ask me to decide it.

Read my request, then read what this repo already decided in its lessons and decision records (`docs/lessons`, `docs/adr`). Then send Opus workers out, one job each, to return findings on:

- the code this change touches, and how this repo already does things like it
- online search how other people have solved this problem - we wanna follow proven patterns instead of reinventing the wheel
- the libraries and tools the work will use: what the version installed here actually does, read from its own documentation and source rather than from memory
- what relevant installed agent skills teach

Ask me where I am in my thinking, and what experience I have with this problem and with this part of the code. My answer decides which of the unknowns below are mine, and how much everything later has to explain. The sweep is finished when the reading and the workers have answered everything they can and what is still open is written down. A request I leave fully settled skips everything below.

I may not know what to ask, what good looks like here, or which potholes the lessons already record. Name what I have not thought to ask, and explain each one in plain words so I can steer the rest, until you have explained every one of them to me.

While the scope is still open, put the options on the table, cheapest to most ambitious, and say which one you would take. My reactions set the direction. Some things I can only judge by seeing, so build those instead of asking: rough prototypes in genuinely different directions, their sources and screenshots kept with the findings. Draw a wireframe only when nothing can be rendered, keep it to layout and flow, and never show me an image posing as the finished product. A decision that is open, costly to reverse, and settled by no cheap check goes to `bottega:panel`, and what it returns feeds the questions you ask next. You are through this when the direction is chosen and its edges are stated: what is in, and what is out.

Ask me what is still ambiguous, one question at a time, the ones that change the architecture first, each with your recommended answer so my reply can be a yes or a correction. Every question carries its explanation in the same message, in the product's own words and with a concrete example: what happens today, what each answer would change, and what it would cost. Explain any term I have not been given before you use it, whatever the run called it while exploring. "I don't understand" means the explanation was missing, not that the question was too long: explain more fully and ask again, never shorter. Keep asking until you can predict how I will judge the finished work.

When I cannot find words for what I want, ask me for code that already does it my way, in any repo or language. It beats any description. Read what I point at and keep the pointer with the findings, so no decision is left waiting on words I could not find.

You are done when nothing is left open and you hold the direction, its edges, and every decision with its answer. Keep what settled them, the approved prototype sources, the screenshots and the references, for as long as you are building: a brief that points at a render I approved tells a builder more than prose describing it.

When the run is autonomous I am not there: settle each step from the repo's precedent and the standard way, and record each settlement with its reason.
