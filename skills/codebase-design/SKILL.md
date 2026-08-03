---
name: codebase-design
description: Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary.
---

# Codebase Design

Design **deep modules**: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface. We want to avoid **shallow modules** = large interface + little implementation. 

Use this language and these principles wherever code is being designed or restructured. The aim is leverage for callers, locality for maintainers, and testability for everyone.

## Glossary

Use these terms exactly. Never substitute "component," "service," "API," or "boundary." Consistent language is the whole point.

**Module**: anything with an interface and an implementation. Deliberately scale-agnostic: a function, class, package, or tier-spanning slice. _Avoid_: unit, component, service.

**Interface**: everything a caller must know to use the module correctly: the type signature, but also invariants, ordering constraints, error modes, required configuration, and performance characteristics. _Avoid_: API, signature (too narrow, they name only the type-level surface).

**Implementation**: what's inside a module, its body of code. Distinct from **Adapter**: a thing can be a small adapter with a large implementation (a Postgres repo) or a large adapter with a small implementation (an in-memory fake). Reach for "adapter" when the seam is the topic, "implementation" otherwise.

**Depth**: leverage at the interface: the amount of behaviour a caller (or test) can exercise per unit of interface they have to learn. A module is **deep** when a large amount of behaviour sits behind a small interface, **shallow** when the interface is nearly as complex as the implementation.

**Seam** _(Michael Feathers)_: a place where you can alter behaviour without editing in that place. It is the *location* at which a module's interface lives. Where to put the seam is its own design decision, distinct from what goes behind it. _Avoid_: boundary (overloaded with DDD's bounded context).

**Adapter**: a concrete thing that satisfies an interface at a seam. Describes *role* (what slot it fills), not substance (what's inside).

**Leverage**: what callers get from depth: more capability per unit of interface they learn. One implementation pays back across N call sites and M tests.

**Locality**: what maintainers get from depth: change, bugs, knowledge, and verification concentrate in one place rather than spreading across callers. Fix once, fixed everywhere.

## Principles 
- Behavior lives with the state and rules it protects. Split modules by what each one knows, not by when it runs. A file boundary or class that fights the model is information about the current code, not a reason to keep the model wrong.
- Draw the boundary around the invariant: what must change together lives inside, one entry point guards it, outside code holds an ID.
- Dependencies point at the module that owns the domain rule. Adapters translate at the edge and never redefine the domain.
- Contexts never share domain types. The seam between two contexts is an adapter that translates.
- One folder per concept, its rules, storage, endpoints, and tests inside. The top of the repo names what the system does, not the framework.
- A module hides a decision likely to change: the format, the vendor, the algorithm. When it changes and no caller notices, the module did its job.
- Depth belongs to the interface, not the implementation. Inside, a deep module can be small swappable parts with internal seams for its own tests. Neither one shows at the interface.
- Pull complexity downward. Absorb the hard cases inside the module. A config knob that makes the caller decide what the module could decide itself pushes the complexity up, times every call site.
- Keep the rules pure: they compute decisions, the shell does the I/O. A pure core tests with inputs and outputs, no mocks.
- The deletion test. Delete the module in your head. If the complexity vanishes, it was a pass-through. If it lands back on the callers, it earned its keep.
- The interface is the test surface. Callers and tests cross the same seam. Needing to test past it means the shape is wrong.
- One adapter is a hypothetical seam. Two are real. Cut a seam only where something varies.
- A testable interface takes its dependencies and returns its results, through few operations with few parameters.

## Going deeper
If you think its needed:
- deepen a cluster given its dependencies using [references/deepening.md](references/deepening.md): dependency categories and replace-don't-layer testing.
- explore alternative interfaces using [references/design-it-twice.md](references/design-it-twice.md): parallel workers design the interface several radically different ways, then compare on depth, locality, and seam placement.
