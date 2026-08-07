# The two lenses

A change can follow every standard and build the wrong thing, and it can build exactly what was asked while breaking the project's conventions. The two lenses read the same frozen diff along those two axes, in parallel, and their reports stay apart so one axis cannot mask the other.

Both lenses receive the same frozen diff the engine reviews (`git diff <base>...HEAD` for committed work, the working diff for dirty work), the commit list when one exists, and nothing about each other.

## Standards

Sources: everything the repository documents about how code should be written (a standards file, a contributing guide, the root `REVIEW.md`), plus the smell baseline ([smell-baseline.md](smell-baseline.md)), which applies even when the repository documents nothing. A documented repo standard always wins over the baseline, and anything tooling already enforces is skipped.

The brief: report, per file or hunk where relevant, every place the diff violates a documented standard, citing the file and the rule, and any baseline smell, naming it and quoting the hunk. Keep hard violations apart from judgment calls: a documented-standard breach can be hard, a baseline smell is always a judgment call. Under 400 words.

## Spec

Source: the spec the invoker handed in (an issue, a spec file). When none came, report "no spec available" and stop.

The brief: report what the spec asked for that is missing or partial, what the diff does that nobody asked for, and what looks implemented but wrong, each finding quoting the spec line it judges against. Under 400 words.

## Aggregation

Present the two reports under their own headings, unmerged and unreranked. End with one line per axis: the finding count and the worst issue inside that axis. Never pick a winner across axes. That reranking is what the separation exists to prevent.
