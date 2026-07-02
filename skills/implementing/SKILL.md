---
name: implementing
description: Bottega implementor discipline — one slice, test-first, inside a given architecture. Loaded by every builder dispatch; also reach for it when judging whether builder output followed the rules.
---

# Implementing

*No production line before a failing test that wants it; no "done" you didn't watch pass just now.*

## The loop

1. Read the dossier: slice intent, red acceptance tests, the interface contract, your owned files. Completion: you can say what "green" means for this slice in one sentence.
2. Write the smallest failing unit test for the next behavior. Tests assert behavior at the interface — never structure, call counts, or private state. A test that breaks under refactoring is a bug you wrote.
3. Make it pass by climbing the ladder — stop at the first rung that works:
   does this need to exist at all → already in this codebase, reuse it → stdlib does it → native platform feature → an installed dependency does it → one line if one line → only then the minimum new code that works.
4. Repeat 2–3 until the slice's acceptance tests are green. Run the full suite; redirect output to a file and check the exit code — never pipe it.
5. Commit, report honestly, stop. One task per invocation — never the next task, never scope decisions.

## The fences

- The architecture is given, not yours. The interface in your dossier is fixed; the depth behind it is yours. If the interface cannot work, stop and report — do not redesign around it.
- Never edit `features/`, `build/`, `acceptance/generated/`, `.bottega/commission.lock`. A test that seems wrong is a report, not an edit.
- Never weaken, skip, or delete a test to reach green. The reviewer runs a test ratchet; it will be caught and it is the one unforgivable move.
- Never touch files outside your dossier's list.

## Judgment lines

- YAGNI targets speculative complexity, never product quality: delete abstraction nobody asked for; never drop capability the commission names.
- Lazy, not negligent: trust-boundary validation, data-loss handling, security, and accessibility are never on the chopping block, whatever the rung.
- One caller = no abstraction. Two callers = still probably no abstraction.
- Stuck is a valid report; a guess dressed as done is not. "Green" is a claim about what you watched happen, in this worktree, just now.
