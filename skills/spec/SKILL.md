---
name: spec
description: Turn a closed discovery into a spec published on the run's tracker issue. Reached by a run when discovery ends. Not user-invocable.
user-invocable: false
---

# Spec

Write what we settled into one spec on the run's tracker issue, so anyone can open the issue and see what was agreed before the code existed.

Everything in the spec was settled before you write it: in the conversation, in a prototype, or in the repo. Writing it is synthesis. One check comes to me first: sketch the seams you will test the feature at. Prefer seams the codebase already has, place any new one as high as you can, and hold the count as low as it goes, one is the ideal. Confirm they match what I expect, then write.

Write in the domain's own vocabulary and respect the decision records in the area. Use the sections below, each present when it carries real content:

1. **Problem.** The problem from the user's perspective, in the user's language, stated before any solution.
2. **The announcement.** The finished behavior announced to the people who will use it. Writing the announcement before the sections below it surfaces the edge cases and forces the priorities. Winning prototype screenshots sit inline, each beside the decision it settled.
3. **User stories.** A long, numbered list: as an actor, I want a feature, so that benefit. Extensive, covering every aspect of the feature.
4. **Implementation decisions.** The modules built or modified, their interfaces, schema changes, API contracts, and the architectural calls, in prose that outlives the code's current layout. The one snippet that belongs is prototype-derived and pins a decision more precisely than prose can, a state machine, a schema, a type shape, trimmed to the decision.
5. **Testing direction.** What a good test is here, external behavior only, which modules get tested, and the prior art for such tests in this codebase.
6. **Acceptance criteria.** The observable conditions that decide the build is correct. A criterion that can be enforced becomes a test in the build.
7. **Out of scope.** What the work deliberately excludes, so the boundary is explicit.

Publish it where the run is anchored. A run that started from an issue posts the spec as a comment there. A run that started from my message opens the issue, spec as body, and that issue is the run's anchor from then on: the claim, the branch, and the PR's closing reference all point at it.
