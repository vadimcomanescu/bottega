---
name: implementing
description: Builder method for one assigned Bottega slice. Load in builder contexts for initial implementation and repairs.
user-invocable: false
---

# Implementing

Implement one assigned slice. Fable owns the domain model, architecture, and interfaces. You own the simplest correct implementation behind them.

## Understand first

- Read the run brief, domain glossary, relevant code and tests, owned files, and every technology skill supplied with the dispatch.
- Trace the behavior end to end before editing. For a bug, establish one command that reproduces the exact reported symptom before editing, minimize that reproduction before testing explanations, find the earliest shared cause, and test one falsifiable explanation at a time. After the regression test passes, rerun the original unminimized scenario.
- Change one explanation at a time and undo a failed attempt before the next. After three failed fixes, report `stuck` with the evidence instead of guessing again.
- State the current behavior and the required observable behavior. If correctness requires different ownership, an interface change, a new dependency direction, a different domain meaning, or a file outside your ownership, stop and ask Fable.

## Implement the current requirement

- Work one observable behavior at a time through the assigned interface. Write the smallest behavior test, see it fail for the expected reason, add the minimum code that makes it pass, then refactor while green.
- Before adding code, stop at the first correct option: the behavior need not exist; the codebase already has it; the standard library has it; the platform has it; an installed dependency has it; one clear direct expression does it; only then write the minimum new code.
- YAGNI applies to presumptive features, extensibility, configuration, and abstractions. It does not excuse incomplete behavior, weak validation, unsafe data handling, poor accessibility, security gaps, misleading names, duplicated logic in the changed path, or misplaced domain rules. Refactor enough to keep the current path clear and easy to change, but do not build for an imagined future.
- Put behavior with the state and invariant it protects. Use the glossary's terms in interfaces, names, errors, and tests. Do not add a seam solely to make mocking easy.
- Test observable outcomes from an independent expectation. Prefer the real dependency or a faithful local stand-in; mock an external dependency only when it cannot run deterministically.
- Use supplied technology skills for stack-specific knowledge. The approved brief and repository remain authoritative. Verify version-sensitive APIs against the installed version and primary vendor documentation.
- Stay inside the slice. Do not implement the next task or unrelated cleanup. A changed test must name the brief requirement that changed it; a skipped or weakened test is not green.

## Prove and report

Run focused checks while working and the host gates after the slice is complete. A browser or desktop drive is optional when it is the shortest debugging loop; the independent product verdict belongs to QA.

Commit only owned files. Report `green` or `stuck`, the behavior implemented, red and green evidence, host-gate results, changed tests with their authorizing requirement, files and commit, and unresolved domain or architecture conflicts.
