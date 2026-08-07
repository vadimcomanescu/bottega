---
name: spec
description: Turn the current conversation into a spec and publish it on the run's bead. No interview, just synthesis of what is already settled. Use bottega:spec, or when a run's discovery ends having settled more than the request says.
---

# Spec

Turn the current conversation and your understanding of the codebase into a spec. Do not interview me, just synthesize what you already know.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the spec, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better, the ideal number is one.

Check with me that these seams match my expectations. On an autonomous run, choose them from the repo's precedent and record the choice in the spec.

3. Write the spec in the sections below, then publish it on a bead — one bead carries the run and its spec.

Inside a run, the run already has its bead: `bottega:open` created or took one before discovery started, so always write the spec into that bead's design field, `bd update <bead-id> --design-file -`, leaving the body as the request and the design as what discovery settled. Never create a second bead for the spec.

Invoked on its own, outside a run, there is no bead yet, so create one with the spec as its description, `bd create "<title>" --body-file -`, and give me its id — a later run starts from that bead.

Either way, write the spec to a file first and pipe it in, never pasting a multi-line body on the command line.

The spec works backwards from the launch: it announces a finished product, then supports the announcement. This is Amazon's working-backwards press release, and its purpose is the job this shape serves: writing the announcement first surfaces the edge cases and forces the prioritization. 

## Problem Statement

The problem that the user is facing, from the user's perspective.

## How We Measure Success

The signals after delivery that say the product worked, when the work's shape allows them. These are distinct from acceptance criteria, which say only that the build is correct. Conflating the two lets tests passing stand in for the product working.

## The Announcement

The finished behavior, announced the way you would announce it to the people who will use it. Winning prototype screenshots sit inline, each beside the decision it settled. Every section below supports this one.

## User Stories

A LONG, extremely extensive, numbered list of user stories, covering all aspects of the feature. The classic As an <actor>, I want a <feature>, so that <benefit>.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Acceptance Criteria

Write each acceptance criterion as an observable condition someone can check on the finished product, in the user's words, so that it either passes or fails with no judgment call.

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.
