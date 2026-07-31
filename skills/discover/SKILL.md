---
name: discover
description: The discovery method a run's Discover phase uses whole. Understand what the request means in the repository, then find its unknowns and settle them with the owner before anything is built. Use bottega:discover to run discovery on its own.
---

# Discover

Understand what I am asking for, help me find what I could not tell you, and settle all of it with me before anything is built.

The run opens with an intent: something I typed, a ticket, an issue, a feature. Before anything else, understand it yourself. Read the code it touches until you can tell me, in this repo's own words, what I am asking for and what would have to change. This reading leaves you holding the questions you still need answered.

Fan out Opus workers on medium, one per question:

- One into the repo: how do we already do things like this, and how is this area built? It starts from the agent map and follows it into the glossary, the domain material, the decision records, and the lessons.
- One into the world: how do people credibly solve this, in official docs and in the docs and source of the libraries installed here?
- One through the installed agent skills: which ones matter for this work, and what do they teach?
- One for any other question your reading has raised so far.

Now decide how much of the method below this work actually needs. A serious feature earns all of it. A small fix earns almost none: answer what remains from precedent and the standard way, record what deserves recording, and go build. Bring me in when you hit a decision the repo cannot settle and a wrong guess would cost something.

When unknowns remain, work through them with me, the blind spot pass first. Ask me where I am in my thinking and what experience I have with this problem and this part of the code. Then walk me through my unknown unknowns: name what I have not thought to ask, each in plain words, tell me what good looks like here from your side, and show me the prior work and the potholes, so that I can steer you better through the rest.

While the direction is open, lay out the options, cheapest to most ambitious, with the one you would take: my reactions set the direction. Some of the work's questions only get settled by looking at something concrete. For those, brainstorm with me in prototypes per `bottega:prototype`, several genuinely different directions I can react to: a tiny terminal app that pushes the state model through the cases we cannot reason about on paper, or radically different variants of a screen on a real route. A prototype is throwaway code that answers a question, and it stays deliberately cheap: a frame with nothing wired behind it is enough when the question is the look. My reactions tell you what I could not describe. When I would not recognize good even on sight, teach me the domain first, in as much depth as it takes for me to judge, and then show me directions. Every image I see is a screenshot of something that actually rendered, and when nothing can render yet, a wireframe of layout and flow stands in. When I cannot find words for what I want, ask me for code that already does it my way, in any repo or language.

When the brainstorming still leaves unknowns, interview me, one question at a time, waiting for my answer before the next. Ask first the questions whose answer would change the architecture. Give each question your recommended answer, so my reply can be a yes or a correction. When a question can be answered from the codebase or a tool, answer it yourself and bring me one that needs me. The decisions are mine: put each one to me and wait. When I say "I don't understand", explain more fully and ask again. A decision that is open, costly to reverse, and settled by no cheap check goes to `bottega:panel`. While we talk, keep the glossary and the decision records current per `bottega:domain-modeling`, each entry written the moment it settles.

Keep everything that settles a decision close while we work: the prototype sources, their screenshots, the references I pointed at. Briefs point at an approved render, and QA judges against it. Each validated decision lands in the spec, and the prototype that settled it is captured per `bottega:prototype`: committed to a throwaway branch off main, with the pointer and the verdict on the run's issue. Main keeps only the validated decisions.

You are done here when nothing between us is open: the direction is chosen, its edges are stated, and every decision carries my answer or a recorded settlement. Take what we settled to `bottega:spec`.

When the run is autonomous I am not there: settle each step from the repo's precedent and the standard way, and record each settlement with its reason.
