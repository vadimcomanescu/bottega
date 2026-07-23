---
name: codebase-design
description: Shared architecture doctrine for defining or checking a Bottega domain model, ownership, interfaces, dependencies, change scope, and the documentation architecture (one home per fact, maps route to it).
user-invocable: false
---

# Codebase design

Model the domain before arranging files.

## Domain model

- Define the concepts, states, relationships, and invariants that the change depends on. Resolve overloaded or conflicting terms with concrete scenarios and current code.
- Use one term for one concept across the spec, glossary, interfaces, implementation, errors, and tests.
- `CONTEXT.md` is the per-context glossary of the ubiquitous language: domain meaning only, never implementation. Add an `_Avoid_` synonym line only for a synonym that caused real ambiguity. `CONTEXT-MAP.md` at the root exists only for a multi-context repo, naming each bounded context and its relationships. `docs/adr/` holds append-only dated decisions, written only when the decision is hard to reverse, surprising without context, and the result of a real trade-off. Create each lazily, only when there is something to write.
- Writing any of these files, an existing file's format wins; a new file or entry follows the vendored format references: [CONTEXT-FORMAT.md](references/CONTEXT-FORMAT.md) and [ADR-FORMAT.md](references/ADR-FORMAT.md).
- Put behavior with the state and rules it protects. A file boundary or existing class is evidence, not authority, when it conflicts with the model.

## Documentation architecture

- Every normative fact has exactly one authoritative home. `CLAUDE.md` and `AGENTS.md` are maps that route to those homes and never restate their contents.
- A document's path shows its authority: living truth, decisions under `docs/adr/`, open plans, and archive. Living docs never cite archived docs.
- Read the smallest map that routes the task, then only the contexts and ADRs the task touches.
- A change to covered behavior updates the owning living doc in the same change.

## Design the current change

- An interface is everything a caller must know: operations, inputs, outputs, invariants, ordering, failure modes, side effects, configuration, and relevant performance limits. Keep it smaller than the behavior it hides.
- A seam is a place where behavior can change without editing the callers; where the seam goes is its own decision, separate from what goes behind it. Add a seam only for a present reason such as real variation, external ownership, deployment isolation, or deterministic test control. One adapter satisfying an interface means a hypothetical seam; two mean a real one. A module may keep internal seams for its own tests; they stay out of the interface.
- Prefer deep, cohesive modules: substantial behavior behind a small interface, with changeable decisions hidden from callers. If removing a wrapper makes complexity disappear instead of returning to callers, the wrapper was not useful. Depth pays twice: leverage for callers (more behavior per unit of interface a caller or test must learn, one implementation paying back across many call sites and tests) and locality for maintainers (change, bugs, knowledge, and verification concentrating in one place). Extracting pure functions for testability while the bugs stay in how they are called trades locality for coverage of the easy part.
- Keep dependencies pointed toward the code that owns the domain rule. Adapters translate at the edge; they do not redefine the domain.
- Before designing a mechanism, find how the problem is already solved: the platform, the framework, an established dependency, or current best practice. Subagents on your harness's cheap tier do the legwork as the work warrants: scan the matching installed skills, read the technology's current documentation, search online. The standard solution is the default. A custom mechanism for a solved problem carries the bugs the standard path already fixed and is unfamiliar to every future reader; building one is a consequential choice needing a reason a reviewer can inspect.
- Test across a seam by what the dependency is. Pure in-process code needs no adapter. A dependency with a standard local stand-in (an embedded database, an in-memory filesystem) runs the stand-in in tests behind an internal seam. A remote service you own gets a port, with the transport injected as an adapter and an in-memory adapter in tests. A true external service is the one case for a mock adapter. When a deepened interface's tests cover the behavior, delete the superseded tests on the old shallow modules.
- Apply YAGNI to presumptive capabilities and flexibility. Do not use it to avoid refactoring, tests, clear names, validation, security, accessibility, or data safety. Those keep evolutionary design viable.
- A current change may justify refactoring when it removes duplication, restores ownership, or makes the required behavior clear. Do not create abstractions for unrequested variants.
- A coherent unit is what one run can deliver: one bounded context and primary owner, one architectural rule or interface change, one plan, one integrated review and QA story, one truthful PR title, one safe release and rollback unit. A change that fails this test is more than one unit.
- For a consequential choice without a strong repository precedent or a standard solution, compare a credible alternative on depth, locality, and seam placement and, when reversing the choice after merge would be expensive, put it to `bottega:panel`.

## The plan

Write the shortest plan that fixes what a builder must not decide:

- domain terms, states, and invariants;
- which module owns each behavior and piece of state;
- the complete interfaces and failure behavior;
- allowed dependency, data, and control flow;
- trust boundaries and irreversible effects;
- what the builder may change freely behind each interface;
- the evidence a reviewer can inspect for conformance.

The plan is complete when a builder can implement without inventing domain meaning or moving responsibility, and an independent reviewer can tell whether the design survived. It is not a line-by-line implementation script.

## Review questions

- Does the code express the approved domain model, or translate it into primitives and synonyms?
- Is each rule next to the state it protects, with dependencies crossing only the approved interfaces?
- Did the implementation preserve caller-visible behavior, failures, and invariants without adding ambiguous states?
- Is every new abstraction earning its cost for the current requirement?
- Does the change follow the standard solution where one exists, or does it reimplement what the platform or a dependency already provides?
- Do tests cross the same interfaces as callers and survive internal refactoring?
- Would the next change to the same rule be local, or would it require scattered edits?
- Does the change keep every normative fact in its one home, and do the living docs it touches stay true?
