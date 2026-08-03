# Design it twice

When a consequential interface has no repository precedent and no standard solution deciding it, design it more than once before committing. The first idea is rarely the best. The method is Ousterhout's design-it-twice, run with parallel workers, in the shape of Matt Pocock's reference.

Uses the vocabulary in [SKILL.md](../SKILL.md): module, interface, seam, adapter, leverage, and the dependency categories in [deepening.md](deepening.md).

## 1. Frame the problem for the owner

Before dispatching anyone, write the owner a short explanation of the problem space: the constraints any interface must satisfy, the dependencies and their categories, and a rough code sketch that makes the constraints concrete without proposing an answer. Show it, then proceed. The owner reads while the workers draft.

## 2. Dispatch the drafts

Dispatch three or more parallel workers. Each gets a fresh context and the same technical brief: the file paths, the coupling, the dependency categories, what sits behind the seam, and the vocabulary of SKILL.md plus the project's own glossary, so every draft names things consistently. Each worker drafts under one design pressure, chosen so the drafts come out genuinely different: the smallest interface with the most leverage per entry point, the shape the most common caller wants, the most flexible shape, or a ports-and-adapters shape when a dependency crosses the seam.

Each worker returns the interface with its invariants, ordering, and error modes, a usage example, what the implementation hides, the dependency strategy with its adapters, and the trade-offs.

## 3. Compare and recommend

Present the drafts to the owner one at a time, then compare them in prose on depth, locality, and seam placement. End with your own recommendation and the reason, and propose a hybrid when elements of different drafts combine well. The owner wants a strong read, not a menu.
