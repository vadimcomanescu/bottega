# Spec format

The shape a spec takes, in the conversation, on the shared review document, or in the repo's spec file. The file opens with one status line: `Status: draft` while under review, `Status: agreed YYYY-MM-DD` once the owner approves. This is a floor, not a template: the sections are named and ordered below, and each appears only when it carries essential content. Omit an empty section, never fill it with placeholder prose.

## The spine

A spec works backwards from the launch: it announces a finished product, then supports the announcement, because writing the announcement first surfaces edge cases and forces prioritization. Order the sections as they read toward that end.

1. **Problem to solve.** The problem in the product's own language: who it hurts and how, stated before any solution.
2. **How we measure success.** The post-delivery signals that the feature worked, over the runs that follow. Distinct from acceptance criteria: these say the product worked, never that the build is correct; conflating them lets "tests pass" stand in for "the product worked".
3. **The launch post.** The finished behavior announced the way you would announce it to the people who will use it. Prototype screenshots sit inline here, each where it carries the product story, with the decision it settled stated in words beside it. When nothing could render, the wireframe drawn in its place: layout and flow, never an image posing as the finished product.
4. **Decisions.** Each choice made on the user's behalf, under the precedent rule below. State the default so the user can veto any decision in one read.
5. **Details.** The specifics a builder needs that the launch post does not carry.
6. **Acceptance criteria.** The observable conditions that decide the build is correct.
7. **Out of scope.** What the work deliberately excludes, so the boundary is explicit.
8. **Deferred to the build.** What the spec hands to the build phase, handed by name: a testing strategy, an exact wording, a check left to the run. Named, never silently omitted.

Domain terms the work introduces or sharpens go where the spec first uses them, in the domain's language, consistent with the affected `CONTEXT.md`.

## The precedent rule

Every choice of approach names the standard way the same problem is already solved elsewhere: the approach, a link to where it is described, and whether the spec follows it or the one-line reason it deviates. When no standard way exists, the decision says so and shows the searches that came up empty. Required per decision because the observed failure is a model inventing a bespoke mechanism where a well-known one exists; only a required check catches it before the direction is committed.

## Prose rules

These govern the spec, every ticket, and every question you put to the user.

- Lead with the decision.
- One idea per sentence.
- Cut hedges and intensifiers.
- Prefer the verb to the nominalization.
- No file paths and no code snippets. One exception: a prototype-derived snippet that pins a decision more precisely than prose can (a state machine, a schema, a type shape), trimmed to the decision.
- A requirement names whose problem it solves when the feature serves users whose problems genuinely differ. When one kind of user is served, skip persona phrasing. No story grammar is required, and none is banned.
- Product language. Write as if announcing the finished behavior to the people who will use it: the user's words for the user's actions, the domain's terms for the domain's concepts, no implementation vocabulary, no session shorthand, and never a label the text does not itself define.
