# bottega

An autonomous agent system built for Fable to orchestrate: one command takes a task, bug, or GitHub issue to a delivered PR, unassisted.

The operating model: the maestro (Fable) discovers the intent and its unknowns, decides the execution path, dispatches a fleet to build, has every diff reviewed by the opposite model family, and delivers a PR with the evidence. The user appears at most twice — signing a contract when the work earns one, and merging the PR. A mechanical fix ships within the hour with just the basics; genuinely new product behavior gets the full contract machinery. Nothing in between carries what it doesn't need.

## The three rules

**Orchestration is the harness.** There is no bottega scheduler, pipeline, or liveness apparatus. Claude seats are tracked Agent dispatches (or a workflow the maestro authors fresh), codex seats are tracked background shells, and every wait is a call the harness re-invokes the maestro from. A doctrine line that restates or replaces a harness capability is treated as a defect — the maestro orchestrates the way Fable naturally does, and the doctrine stays out of its way.

**The execution path is a decision, stated out loud.** Every run gets: its own branch and worktree, a build, the host's own gates green, cross-family review, and a PR. Beyond that the maestro decides what the work needs: a signed Gherkin contract when the work introduces product behavior worth signing — and a contract brings its whole proof pipeline with it (executable acceptance, QA recordings of every signed scenario, feature-file mutation) — plus storyboards, a docs seat, or a cold read when the risk warrants them. Before building, the maestro tells the user the chosen path and the reasons; after that nod, the next human act is the merge. An artifact that protects bottega's narrative rather than the product doesn't ship.

**Cross-family review is the invariant.** Every diff is reviewed cold by the complement of whoever built it — a Claude-built slice gets a non-Claude adversary, a codex-built slice a non-codex one, fresh each round. Same-family review inherits the generator's blind spots and looks like verification without being it. This is the one thing never dropped, because it is what lets the user not read the diff.

## The cast

Agents say who; skills say how. Both ship in this repo — bottega assumes nothing about the host except the codex CLI (probed before any run; absent → fail loudly).

| Actor | Identity | Methodology |
| --- | --- | --- |
| **Maestro** (Fable) | architect, router, arbiter — all design authority | [`skills/run/SKILL.md`](skills/run/SKILL.md) — the whole loop |
| **Builder** | one dossier to green, deliberately simple | [`agents/bottega-builder.md`](agents/bottega-builder.md) → [`skills/implementing/SKILL.md`](skills/implementing/SKILL.md) |
| **Reviewer** | opposite family from the builder, fresh per round | [`agents/bottega-reviewer.md`](agents/bottega-reviewer.md) → [`skills/reviewing/SKILL.md`](skills/reviewing/SKILL.md) |
| **QA** | drives the artifact as a user; evidence or it didn't happen | [`agents/bottega-qa.md`](agents/bottega-qa.md) → [`skills/qa/SKILL.md`](skills/qa/SKILL.md) |
| **Documenter** | makes the host's agent-facing docs true of what shipped | [`agents/bottega-documenter.md`](agents/bottega-documenter.md) → [`skills/documenting/SKILL.md`](skills/documenting/SKILL.md) |

Models are never pinned in agent files — the maestro routes per dispatch from the table in `skills/run`, and the route guard (`hooks/route-guard.js`) enforces it at the harness: named worker seats always, and every dispatch from a session that owns a live run. Fable rides at most two seats per run — the maestro and an optional cold read.

One design discipline spans the dispatch seam: [`skills/codebase-design`](skills/codebase-design/SKILL.md) — a shared vocabulary (module, interface, depth, seam), deep-module principles, and a `CONCEPTS.md` domain glossary in the host repo. The maestro designs by it, the dossier carries it, the reviewer judges conformance against it.

## The contract, when the path includes one

Commissions that introduce product behavior worth signing get a one-page spec doc plus Gherkin feature files — executable acceptance via the [Acceptance Pipeline kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit), which generates the test entrypoints from the signed scenarios; no hand translation between what the user signed and what runs. The gate is one hosted collaborative doc: comment to change anything, comment `SIGNED` to approve. Handed an issue and told to run unattended, the issue is the interview, the contract auto-signs (disclosed in the PR's first line), and the issue thread carries status comments at every phase boundary. The delivery PR prints the `features/` diff since the sign commit — the user's tamper check, put in front of them.

## This repo

Prompts and two guards — no engine. Layout: `skills/` the doctrine · `agents/` actor identity · `hooks/` the route and entry guards · `tests/` unit tests for the guards · `docs/specs/` closed records of delivered commissions.

```bash
npm install
npm test          # guard unit tests
```

## Install

```
/plugin marketplace add vadimcomanescu/bottega
/plugin install bottega@bottega
```

Then hand it work: `/bottega:run <task, or issue URL>`. That is the whole surface — triage, discovery, the execution path, and unattended handling all live inside the one command. The maestro seat is fable-tier: run the session on the strongest model available; loaded on a lower tier, the skill says so instead of proceeding silently.

## Provenance

The doctrine in `skills/` is extracted and owned, not pointed at — read from the sources once, then self-contained; bottega never loads methodology from a host. Credits: the [Acceptance Pipeline Specification](https://github.com/unclebob/Acceptance-Pipeline-Specification) (Robert C. Martin) via its [multi-language kit](https://github.com/vadimcomanescu/acceptance-pipeline-kit) · Thariq Shihipar's unknowns framework (the blindspot pass, the interview, references) · Pocock's LANGUAGE vocabulary and skill-writing craft · [ponytail](https://github.com/DietrichGebert/ponytail)'s ladder — lazy, not negligent · Osmani's long-running-agents learnings (separate generation from evaluation; the test ratchet) · Ousterhout's deep modules · run mechanics validated in the June 2026 bottega playgrounds.
