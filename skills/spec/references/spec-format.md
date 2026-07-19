# Spec format

The shape a spec takes, in the conversation or in a ticket body. Content drives the sections: an empty section is worse omitted than filled with placeholder prose.

## The floor

Every spec carries these four:

- **Problem and what changes.** The problem, then the behavior the work adds or alters, from the user's perspective and stated so they can picture the result.
- **Acceptance criteria.** The observable conditions that decide the work is correct.
- **Decisions.** Each choice made on the user's behalf: the decision, its default, one line of why. Flag every default so the user can veto it in one read.
- **Out of scope.** What the work deliberately excludes, so the boundary is explicit.

## Include when material

Add these when the work calls for them:

- **Definition of done.** What must be true to deliver beyond correctness: gates green, docs updated, evidence captured.
- **Domain terms.** Terms the work introduces or sharpens, in domain language, consistent with the affected `CONTEXT.md`.
- **Prototype evidence.** The screenshots of a prototype that settled a look-or-feel decision, each with the decision it supports stated in words. When nothing could render, the wireframe drawn in its place: layout and flow, never an image posing as the finished product.

## Prose rules

These govern the spec, every ticket, and every question you put to the user.

- Lead with the decision.
- One idea per sentence.
- A requirement is one sentence of intent plus at most one qualifier.
- Cut hedges and intensifiers.
- Prefer the verb to the nominalization.
- No file paths and no code snippets. One exception: a prototype-derived snippet that pins a decision more precisely than prose can (a state machine, a schema, a type shape), trimmed to the decision.
- No user-story lists.
- Product language. Write as if announcing the finished behavior to the people who will use it: the user's words for the user's actions, the domain's terms for the domain's concepts, no implementation vocabulary, no session shorthand, and never a label the text does not itself define.
