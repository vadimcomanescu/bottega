---
name: discover
description: A discovery method to sharpen the understanding of a task, discover the unknowns, create ADRs and reach a common understanding. 
---

# Discover

Actively discover the unknowns, understand the intent, and brainstorm and prototype how good looks like for the task at hand.

## Process

You have too ways of operating: if I asked for autonomous run, follow the same discovery process and answer yourself the questions you have along the way, looking for product strategy, high level goals and trying to make the best decisions along that direction, like the best product person and architect you know. Otherwise we go together through the process, interactively. With or without me, use bottega:bro for clear, normal english - you have a tendency to talk in fables. 

Understand the intent, exploring yourself, and in repos own words, state whats being asked for and what theoretically would change. Take note of the questions you have. If this is a trivial, small fix, just state it plainly and tell what there is to do - your discovery is done. 

If not, fan out Opus workers on medium, decide how many:
- repo exploration for: how do we already do things like this, and how is this area built? Glossary, domain modeling, ADRs (`docs/adr`), lessons (`docs/lessons`), etc.
- search online: how do others solved the same problem so we don't reinvent? Credible sources always.
- what do local agents skills relevant to this task and technology teach? 
- any other question your reading has raised so far.

When unknowns remain, do a blind spot pass, find the unknown unknowns. Using `bottega:domain-modeling`, if you run autonomously respond yourself, if not interview me relentlessly about every aspect of this until we reach a shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer, describing clearly what good looks like. Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering. If a fact can be found by exploring the environment (filesystem, tools, etc.), look it up rather than asking me. The decisions, though, are mine — put each one to me and wait for my answer. When questions are related to design - architecture, visual design use `bottega:prototype`, an image is worth a thousand words. Its how, we can get to a common understanding faster and its how you, if running autonomously can evaluate multiple directions. 

Do not act on it until I confirm we have reached a shared understanding. If you think its worth it, and see we struggle, ask me for external references, something I was inspired by or saw in the past. 

Keep all the artifacts generated along the way. Prototypes, screenshots, sources, references.
