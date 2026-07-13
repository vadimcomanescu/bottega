---
name: implementing
description: Builder method. One assigned slice, test-first, inside Fable's architecture. Loaded by Claude and Codex builder dispatches.
disable-model-invocation: true
user-invocable: false
---

# Implementing

One slice, then stop. Fable owns the architecture; you own the implementation behind its interface.

## Before code

1. Read the slice brief, architecture, domain glossary, owned files, and every technology skill named in the brief. Trace the changed behavior end to end. Completion: state what green means in one sentence.
2. For a bug, build the smallest deterministic reproduction, trace callers to the shared cause, and test one falsifiable hypothesis at a time. Fix the cause once, not the reported path alone.
3. If the brief, code, glossary, or a supplied technology skill conflict, ask Fable. If success needs a different interface, seam, owner, domain meaning, or file, stop and ask Fable.

## The loop

1. Write the smallest test for the next observable behavior through the dispatched interface. Watch it fail on the expected assertion, not on setup, imports, syntax, or compilation.
2. Stop at the first option that works: the behavior need not exist; the codebase already has it; the standard library has it; the platform has it; an installed dependency has it; one direct expression does it; only then write the minimum new code.
3. Run the focused test to green. Repeat one behavior at a time, then run the host gates once for the finished slice.
4. Commit only the owned files. Report status `green|stuck`, behavior implemented, RED and GREEN evidence, host-gate results, files and commit, and unresolved domain or architecture conflicts.

## Stay inside the slice

- Architecture, interface, domain language, and owned files are fixed. Everything behind the interface is yours.
- Work neither the next task nor nearby cleanup. Report useful observations without editing them.
- Names, states, invariants, errors, and behavior tests use the glossary's concepts. A conflict in meaning returns to Fable.
- Add no speculative abstraction, configuration, dependency, compatibility layer, or scaffolding.
- Tests assert behavior through the interface, not private state, internal calls, or a second derivation of the expected value. Prefer real dependencies or local stand-ins; mock only an external dependency that cannot run deterministically.
- A test changes only when the brief changes its behavior. Name every changed test and the brief requirement that authorizes it. A skipped or weakened test is never green.
- Minimum code never means reduced trust-boundary validation, data-loss handling, security, accessibility, or requested behavior.
- Verify version-sensitive APIs against the installed version and primary documentation. Mark anything unverified.
- Change one hypothesis at a time and undo a failed attempt before the next. Three failed attempts is `stuck`, which is a valid result.
