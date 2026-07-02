# bottega

An autonomous long-running agent system built for Fable to orchestrate.

A bottega is the Renaissance workshop: a maestro runs the shop, apprentices execute, and the patron appears twice — commissioning the work and receiving it. That is the whole operating model. The patron signs a one-page commission; a fleet of agents builds, reviews, and examines the work autonomously; the delivery is a PR with evidence. Nobody watches the workshop.

## Why it holds without supervision

Unsupervised runs fail by satisfying a proxy for the goal, so every gate that can be mechanical is mechanical:

- **The contract is executable.** Commissions are Gherkin feature files. The [Acceptance Pipeline](https://github.com/vadimcomanescu/acceptance-pipeline-kit) parses them to JSON IR and *generates* the test entrypoints — no hand translation between what the patron signed and what runs.
- **The contract is out of reach.** `bottega sign` freezes the feature files into `.bottega/commission.lock`; `bottega verify` fails the delivery gate on any drift (exit 0 clean, 1 drift, 2 unsigned). Builders that edit the spec commit forgery, and forgery is detected, not trusted away.
- **The wiring is proven, not assumed.** Acceptance mutation flips example values in the IR and requires the suite to fail. A surviving mutation means a handler ignores a signed value — that is a finding, killed or justified in `equivalent-mutants.json`. Source mutation covers the unit layer on core domain logic.
- **Fresh eyes are different weights.** The adversary reviews every diff cold through a different model family. Same-family review inherits the generator's blind spots.

## The cast

| Actor | Doctrine | Runs on |
| --- | --- | --- |
| **Maestro** | [`skills/bottega/SKILL.md`](skills/bottega/SKILL.md) — commission, decompose, route, arbitrate, deliver | Fable |
| **Builder** | [`agents/bottega-builder.md`](agents/bottega-builder.md) — one slice to green; red first; simplest code that could work; deep modules | cheap (sonnet / codex-low) |
| **Adversary** | [`agents/bottega-adversary.md`](agents/bottega-adversary.md) — cold diff, concrete failure scenarios, confirmed breakages only | Codex (cross-family) |
| **Simplifier** | [`agents/bottega-simplifier.md`](agents/bottega-simplifier.md) — shrink interfaces, delete speculative structure, never capability | strong |
| **Examiner** | [`agents/bottega-examiner.md`](agents/bottega-examiner.md) — drives the artifact as a user; evidence or it didn't happen | any + agent-browser |

Doctrine is saved; control flow is not. The maestro authors the orchestration fresh for every run — a stored pipeline is a plan document wearing a costume. The only invariants are the gates:

```
commission signed ──▶ acceptance RED ──▶ slices built in worktrees
      ──▶ adversary + simplifier (maestro arbitrates) ──▶ examiner drives it
      ──▶ verify: lock + acceptance + mutation, evidence archived ──▶ delivery PR
```

## The two artifacts a human ever reads

**In:** the commission (`docs/commissions/NNNN-*.md` + `features/*.feature`) — intent in two sentences, non-goals, Given/When/Then with example values, a rendered prototype screenshot for UI work. One page, signed in minutes.

**Out:** the delivery PR — scenario checklist, evidence from `.bottega/verify/<sha>/`, findings fixed, and the decisions log: every call the commission underdetermined, made and flagged, because decisions in an unsupervised run are reviewed after, not asked before.

## This repo

Bottega built through its own loop (commission 0001): the `bottega` CLI.

```
bottega sign      # hash features/**/*.feature into .bottega/commission.lock
bottega verify    # clean → 0 · drift (modified/removed/added) → 1 · unsigned → 2
```

Layout: `src/` + `bin/` the CLI · `tests/` unit · `features/` signed commission · `build/` IR · `acceptance/generated/` generated entrypoints · `handlers/` step handlers · `.bottega/` runtime (pinned toolchain in `aps.lock`, evidence in `verify/<sha>/`, worktrees in `wt/`).

```bash
npm install
npm test                                   # unit + generated acceptance
node bin/bottega.js verify                 # this repo verifies its own commission
```

Requires Node ≥ 22.18 (the bin shim runs TypeScript through native type stripping).

## Install into a host repo

1. Copy `agents/*.md` into the host's `.claude/agents/`, `skills/bottega/` into its skills directory.
2. `install.sh --version v0.1.0 --bin-dir .bottega/bin` from the [acceptance-pipeline-kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit), plus its `@aps-kit/typescript` package; pin hashes in `.bottega/aps.lock`.
3. Wire `bottega verify` into the host's delivery gate.
4. Commission work with `/bottega`.

## Provenance

The doctrine is distilled, then owned — the sources are read at build time and out of the loop at run time: [Acceptance Pipeline Specification](https://github.com/unclebob/Acceptance-Pipeline-Specification) (Robert C. Martin) and its [multi-language kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit) · *A Philosophy of Software Design* (Ousterhout) — deep modules, design it twice · [ponytail](https://github.com/DietrichGebert/ponytail) — simplicity discipline, tempered: YAGNI targets speculative complexity, never product quality · validated run mechanics from the June 2026 bottega playgrounds (slice worktrees, pinned toolchains, per-sha evidence archives).
