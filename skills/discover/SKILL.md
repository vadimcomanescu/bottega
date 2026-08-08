---
name: discover
description: A discovery method to sharpen the understanding of a task, discover the unknowns, create ADRs and reach a common understanding. 
---

# Discover

Actively discover the unknowns, understand the intent, and brainstorm and prototype what good looks like for the task at hand.

## Process

You have two ways of operating: if I asked for autonomous run, follow the same discovery process and answer yourself the questions you have along the way, looking for product strategy, high level goals and trying to make the best decisions along that direction, like the best product person and architect you know. Otherwise we go together through the process, interactively. With or without me, use bro for clear, normal english - you have a tendency to talk in fables. 

Understand the intent, exploring yourself, and in the repo's own words, state what's being asked for and what theoretically would change. Take note of the questions you have. If this is a trivial, small fix, just state it plainly and tell what there is to do - your discovery is done. 

If not, fan out Opus workers on medium, decide how many:
- repo exploration for: how do we already do things like this, and how is this area built? Glossary, domain modeling, ADRs (`docs/adr`), lessons (`docs/lessons`), etc.
- search online: how do others solved the same problem so we don't reinvent? Credible sources always.
- what do local agents skills relevant to this task and technology teach? 
- any other question your reading has raised so far.

When unknowns remain, do a blind spot pass, find the unknown unknowns. Then run `interview-and-capture` on what is left, the relentless round-by-round interview, prototyping the design questions, capturing terms and decisions as they settle.

Do not act on it until I confirm we have reached a shared understanding. If you think it's worth it, and see we struggle, ask me for external references, something I was inspired by or saw in the past. 

Keep all the artifacts generated along the way. Prototypes, screenshots, sources, references.
