# Spec format

The shape a spec takes, in the conversation, on the shared review document, or in the repo's spec file (`docs/specs/<YYYY-MM-DD>-<slug>.md`, dated the day the spec was agreed). This is a floor, not a template: the sections are named and ordered below, and each appears only when it carries essential content. Omit an empty section, never fill it with placeholder prose. Precedent for a floor over a template: the model vendor's own guidance that over-prescriptive instructions degrade the output of the models that write these documents.

## The spine

A spec works backwards from the launch: it announces a finished product, then supports the announcement. Order the sections as they read toward that end. Precedent: Amazon's working-backwards press release and the HumanLayer PRD built on it, whose stated purpose (writing the announcement first surfaces edge cases and forces prioritization) is the job this shape serves.

1. **Problem to solve.** The problem in the product's own language: who it hurts and how, stated before any solution.
2. **How we measure success.** The post-delivery signals that the feature worked, over the runs that follow. Distinct from acceptance criteria: these say the product worked, never that the build is correct. Precedent: the same PRD keeps the two apart, because conflating them lets "tests pass" stand in for "the product worked".
3. **The launch post.** The finished behavior announced the way you would announce it to the people who will use it. Prototype screenshots sit inline here, each where it carries the product story, with the decision it settled stated in words beside it. When nothing could render, the wireframe drawn in its place: layout and flow, never an image posing as the finished product. Precedent: the reference PRD embeds mockups inline in the announcement rather than in a side gallery.
4. **Decisions.** Each choice made on the user's behalf, under the precedent rule below. State the default so the user can veto any decision in one read.
5. **Details.** The specifics a builder needs that the launch post does not carry.
6. **Acceptance criteria.** The observable conditions that decide the build is correct.
7. **Out of scope.** What the work deliberately excludes, so the boundary is explicit.
8. **Deferred to the build.** What the spec hands to the build phase, handed by name: a testing strategy, an exact wording, a check left to the run. Named, never silently omitted. Precedent: the reference PRD's explicit deferral section.

Domain terms the work introduces or sharpens go where the spec first uses them, in the domain's language, consistent with the affected `CONTEXT.md`.

## The precedent rule

Every choice of approach names the standard way the field already solves the same problem: the approach, a link to where it is described, and whether the spec follows it or the one-line reason it deviates. When no standard way exists, the decision says so and shows the searches that came up empty. Why this is a required line and not a suggestion: the observed failure is a model inventing a bespoke mechanism where a well-known one exists, and only a required check per decision catches it before the direction is committed. The move is proven elsewhere: the Rust project accepts a change proposal only if a required section answers how other languages solve the same problem, and Amazon's press-release method requires naming what customers use today and why this is better.

## Prose rules

These govern the spec, every ticket, and every question you put to the user.

- Lead with the decision.
- One idea per sentence.
- Cut hedges and intensifiers.
- Prefer the verb to the nominalization.
- No file paths and no code snippets. One exception: a prototype-derived snippet that pins a decision more precisely than prose can (a state machine, a schema, a type shape), trimmed to the decision.
- A requirement names whose problem it solves when the feature serves users whose problems genuinely differ. When one kind of user is served, skip persona phrasing. No story grammar is required, and none is banned.
- Product language. Write as if announcing the finished behavior to the people who will use it: the user's words for the user's actions, the domain's terms for the domain's concepts, no implementation vocabulary, no session shorthand, and never a label the text does not itself define.

Anchors: lead-with-the-decision follows Google's change-description guidance, product language follows Amazon's working-backwards method, and the no-paths-and-no-snippets rule with its prototype exception follows Matt Pocock's published spec skill. The remaining rules are house rules, each kept because its absence produced an observed failure: one idea per sentence, cut hedges, prefer the verb, and the actor rule guard against skimmed decisions, filler prose, and specs that read as insider shorthand; and the scope rule at the top of this section (the prose rules govern the spec, every ticket, and every question you put to the user) is kept because rules confined to the spec body let the tickets and questions drift back into shorthand.
