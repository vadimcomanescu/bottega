# bottega

An autonomous long-running agent system built for Fable to orchestrate.

A bottega is the Renaissance workshop: a maestro runs the shop, apprentices execute, and the patron appears twice — commissioning the work and receiving it. That is the whole operating model. The patron signs a one-page commission; a fleet of agents builds, reviews, and examines the work autonomously; the delivery is a PR with evidence. Nobody watches the workshop.

## Why it holds without supervision

Unsupervised runs fail by satisfying a proxy for the goal, so every gate that can be mechanical is mechanical:

- **The contract is executable.** Commissions are Gherkin feature files. The [Acceptance Pipeline](https://github.com/vadimcomanescu/acceptance-pipeline-kit) parses them to JSON IR and *generates* the test entrypoints — no hand translation between what the patron signed and what runs.
- **The contract is out of reach.** `bottega sign` freezes the feature files into `.bottega/commission.lock` (the lock keeps the older "commission" name deliberately — it names the signed thing); `bottega verify` fails the delivery gate on any drift (exit 0 clean, 1 drift, 2 unsigned). Builders that edit the spec commit forgery, and forgery is detected, not trusted away.
- **The wiring is proven, not assumed.** Acceptance mutation flips example values in the IR and requires the suite to fail. A surviving mutation means a handler ignores a signed value — that is a finding, killed or justified in `equivalent-mutants.json`. Source mutation covers the unit layer on core domain logic. Honest ceiling: mutation proves the tests read the signed values, not that the scenarios cover intent — that judgment stays human, made once, at sign-off.
- **Fresh eyes are different weights.** Every diff is reviewed cold by the *complement* of whoever built it — a Claude-built slice gets a non-Claude adversary, a Codex-built slice a non-Codex one, never its own family. Same-family review inherits the generator's blind spots and looks like verification without being it.

None of this gets less necessary as models get smarter — the opposite. With generation nearly free, the system's throughput is bounded by verification you can trust *without reading*; the maestro is both orchestrator and arbiter, so its own reading of the code would be circular ground truth; and a stronger builder under gate pressure fails subtler — tests that survive review while checking nothing. Mechanical gates are what let the patron actually leave: trust here is structural, not reputational — the maestro's authority is bounded by what it cannot touch (the signed acceptance) and checked by what does not share its weights.

## The cast

Agents say who; skills say how. Both ship in this repo — bottega assumes nothing about the host except the codex plugin (checked before any run; absent → fail loudly).

| Actor | Identity | Methodology |
| --- | --- | --- |
| **Maestro** (Fable) | architect, planner, router, arbiter — all design authority | [`skills/bottega/SKILL.md`](skills/bottega/SKILL.md) |
| **Implementor** | one dossier to green, deliberately simple | [`agents/bottega-builder.md`](agents/bottega-builder.md) → [`skills/implementing/SKILL.md`](skills/implementing/SKILL.md) — test-first loop, the ladder, the fences |
| **Reviewer** | the sophisticated one; opposite family from the builder, fresh per round | [`agents/bottega-reviewer.md`](agents/bottega-reviewer.md) → [`skills/reviewing/SKILL.md`](skills/reviewing/SKILL.md) — break it, test ratchet, architectural conformance |
|  **QA** | drives the artifact as a user; evidence or it didn't happen | [`agents/bottega-qa.md`](agents/bottega-qa.md) → [`skills/qa/SKILL.md`](skills/qa/SKILL.md) |

Models are never pinned in agent files — the maestro routes per dispatch from the axis table in its skill (intelligence > taste > cost; bulk to codex, never below medium; user-facing needs taste ≥ 7; review always the opposite family; never Haiku; standing permission to escalate).

Doctrine is saved; control flow is authored fresh per run — a stored pipeline is a plan document wearing a costume. The invariant gates:

```
commission signed (HTML gate → bottega sign) ─▶ acceptance RED
  ─▶ maestro designs the architecture ─▶ slices built in worktrees (one task per invocation)
  ─▶ reviewer rounds: fresh opposite-family reviewer ×≤8, persistent worker, maestro arbitrates
  ─▶ QA drives it ─▶ verify: lock + acceptance + mutation, evidence archived ─▶ delivery PR
```

Human gates are clickable HTML pages (approve / request changes), never walls of markdown. The entire run is isolated: branch `bottega/<spec-id>` in its own worktree, every commit lands there, and the PR is the only path to trunk — the patron's merge click is the only act that lands it. After delivery, the spec is rewritten into a closed, durable record pointing at code and evidence.

## The two artifacts a human ever reads

**In:** the commission (`docs/specs/NNNN-*.md` + `features/*.feature`) — intent in two sentences, non-goals, Given/When/Then with example values, a rendered prototype screenshot for UI work. One page, signed in minutes.

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

## Install

```
/plugin marketplace add vadimcomanescu/bottega
/plugin install bottega@bottega
```

That is the whole install. The plugin carries everything: the maestro skill, the three actor skills, the agents, the sign/verify CLI (dependency-free — it runs straight from the plugin root, no npm install), and the sign-off template. Two requirements the run checks itself and fails loudly without: Node ≥ 22.18 and the codex plugin (cross-family dispatch). On a host's first run the maestro bootstraps the [acceptance-pipeline-kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit) toolchain into `.bottega/` and pins its hashes in `aps.lock` — never a manual step. Wiring `bottega verify` into the host's delivery gate is part of the first delivery, not setup.

Then commission work with `/bottega <task>`. The maestro seat is fable-tier: run the session on the strongest model available — loaded on a lower tier, the skill says so instead of proceeding silently.

## Provenance

The doctrine in `skills/` is extracted and owned, not pointed at — a doctrine file that says "follow X" is a reference an agent must dereference every run and can never be held accountable to; owned sentences are a contract. Read from the sources once, then self-contained; bottega never loads methodology from a host. Credits: the [Acceptance Pipeline Specification](https://github.com/unclebob/Acceptance-Pipeline-Specification) (Robert C. Martin) via its [multi-language kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit) for the executable-acceptance layer · Pocock's LANGUAGE vocabulary (module / interface / depth / seam / deletion test) and skill-writing craft · [ponytail](https://github.com/DietrichGebert/ponytail)'s ladder — lazy, not negligent · Osmani's long-running-agents learnings (separate generation from evaluation; the test ratchet) · Ousterhout's deep modules · run mechanics validated in the June 2026 bottega playgrounds (worktrees, pinned toolchains, per-sha evidence archives).
