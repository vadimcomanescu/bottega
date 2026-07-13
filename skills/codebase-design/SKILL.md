---
name: codebase-design
description: Shared architecture doctrine. Deep modules follow the domain model; Fable designs by it and reviewers judge against it.
disable-model-invocation: true
user-invocable: false
---

# Codebase design

## Vocabulary

Use these terms exactly; never "component", "service", "API", or "boundary".

- **Module**: anything with an interface and an implementation (a function, class, package, or slice). Scale-agnostic.
- **Interface**: everything a caller must know to use the module correctly: signature, invariants, ordering constraints, error modes, required configuration, performance traits. Never just the type surface.
- **Depth**: behavior per unit of interface a caller must learn. Deep = much behavior behind a small interface. Shallow = interface nearly as complex as the implementation.
- **Seam**: a place behavior can change without editing in place; where a module's interface lives. Where the seam goes is its own design decision, distinct from what goes behind it.
- **Adapter**: a concrete thing satisfying an interface at a seam. A role, not a substance.

## Principles

- **Design deep modules.** For every interface ask: fewer methods? simpler parameters? more complexity hidden inside? A module that stays shallow (interface as complex as its implementation) gets inlined.
- **Depth is a property of the interface, not the implementation.** A deep module may be built of small swappable parts inside; they just aren't part of the interface.
- **The deletion test.** Delete the module mentally. If complexity just vanishes, it was hiding nothing: negative code. If complexity reappears across callers, it earns its place. Run it on every new module or wrapper.
- **A seam needs a reason.** Actual variation, deployment isolation, or deterministic test control can justify one. One implementation alone does not.
- **The interface is the test surface.** Callers and tests cross the same seam; wanting to test past it means the module is the wrong shape. Dependencies and intentional side effects stay behind explicit interfaces. Tests describe behavior and survive internal refactors; a test that must change when the implementation does was testing past the seam. Deepening replaces shallow tests rather than layering a second suite over them.
- **The dependency picks the test strategy.** Test pure computation directly. Use a local stand-in when it faithfully exercises the required behavior. Use a port when external ownership, deployment, nondeterminism, or test control creates real variation. Mock a third party only when it cannot run deterministically.
- **Sunk cost is not a design argument.** Existing code keeps its shape only when that shape remains the best end state.
- **A bridge that must remain is tiny, named as compatibility, and carries a removal condition.** Anything less is the compatibility sediment reviewers flag. There is no third kind.

## Domain model first

- The model is the concepts, states, relationships, and invariants of the domain. Behavior belongs with the state and rules it protects; architecture follows that model, not the current file tree.
- A vague, overloaded, or conflicting term stays unresolved until concrete scenarios, code, and definition agree.
- The same domain terms appear in the spec, interfaces, implementation, and tests. Primitive obsession and synonyms are signs that the model has not reached the code.
- `CONCEPTS.md` contains one definition per concept and no implementation details.

## Architecture brief

The brief fixes the decisions a builder must not make: which module owns each behavior, state, and invariant; the complete interfaces callers depend on; the seams and permitted dependencies; the data and control flow; the domain terms; and what remains free behind each interface. A shared invariant makes slices overlap even when their file lists do not. The brief is complete when a builder can stay inside one slice and a reviewer can tell whether the implementation preserved the design.

## Smells

Sweep every pass for the classic smells (duplication, data clumps, primitive obsession, repeated switches, feature envy, message chains); each is a judgment call, the architecture brief overrides, and anything tooling already enforces is skipped. Three house-specific ones by name:

- **Re-derived oracle**: a test or second consumer recomputes a value the code already owns, and the two drift. Export the owner's computed value; have the check consume that.
- **Shotgun surgery / divergent change**: one logical change forcing scattered edits, or one module edited for unrelated reasons. The seam is misplaced; report it as evidence for a re-cut, not as the builder's defect.
- **Extraction for testability**: pure fragments split out so units are easy to test while the bugs live in how they're called, and the composition itself has no test. Deepen instead: assert the behavior through the module's interface.
