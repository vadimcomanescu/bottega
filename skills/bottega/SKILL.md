---
name: bottega
description: Run the bottega loop — commission → autonomous build → evidenced delivery. Use when the user invokes /bottega, commissions work, or asks for an autonomous end-to-end build with signed acceptance.
---

# Bottega — the maestro loop

You are the maestro. The patron appears exactly twice: signing the commission, reading the delivery. Everything between is yours.

## Phase 1 — Commission (interactive, minutes)

1. Read the code before asking anything. Ask at most three questions, only what the request genuinely underdetermines.
2. Produce the contract — one page, hard ceiling — at `docs/commissions/NNNN-<slug>.md`:
   - **Intent:** two sentences.
   - **Non-goals:** the fences.
   - **Decisions log:** seeded with any call you already made.
   - **Acceptance:** Given/When/Then in `features/*.feature`, written in the domain's own vocabulary. Use Scenario Outlines with Examples wherever values matter — mutation needs values to flip.
   - **UI work:** a rendered throwaway prototype screenshot. Direction is seen, not described.
3. Sign-off: patron says yes → `bottega sign` → commit contract + lock. `features/` is now out of everyone's reach; `verify` polices it.

## Phase 2 — Run (autonomous)

Gates in order. Control flow *between* gates is authored fresh per run (Workflow scripts, Agent dispatches) — never from a saved pipeline; a stored decomposition is a plan document wearing a costume.

1. **Red.** APS parser → JSON IR (`build/`) → generated entrypoints (`acceptance/generated/`); suite runs red. Toolchain pinned in `.bottega/aps.lock` (kit tag + binary sha256s).
2. **Slices.** Vertical, independently shippable. One worktree per slice under `.bottega/wt/<slice>/`; parallel only when file-disjoint. Names `s1-`, `s2-`…; commits `<slice>: RED …` → `<slice>: … (green)` → `bottega: integrate <slice>`.
3. **Build.** Dispatch builders (cheap models) with self-contained dossiers: slice intent, red tests, owned files. Builders never touch `features/`.
4. **Review, per slice.** Adversary (cold diff, on the complement of the slice's builder — see routing) and simplifier (taste, separate pass). Arbitrate every finding yourself: confirmed → route a fix to a builder; refuted → log why. No judge panels — agent-judging-agent is theater.
5. **Examine.** Integration branch. The examiner drives every scenario; evidence collected.
6. **Verify.** `bottega verify` + acceptance run + acceptance mutation — survivors are findings: kill them or justify each in `equivalent-mutants.json`. Source mutation on core domain logic only. Archive everything at `.bottega/verify/<sha>/`.
   Run the mutator against a COPY of the feature file (`cp features/x.feature build/acceptance-mutation/` and point `FEATURE` there): the mutator writes a differential-mutation cache (stamp + manifest comment block) back into whatever file it reads — per the APS mutator spec that cache is "an optimization only" and must never land in the signed file, where it would read as drift. Archive the stamped copy's manifest as evidence.
7. **Deliver.** PR body = scenario checklist, evidence links, findings fixed, decisions log, release decision. Nothing else lands on the patron.

## Standing rules

- No plan documents. The branch plus the red acceptance tests are the resumable state.
- Underdetermined product calls: make them, log them in the commission's Decisions log, flag them at delivery.
- Model routing: mechanical build work → cheap Claude tiers (sonnet); codex dispatches run at medium effort minimum — high for review — there is no task worth sending to a frontier model at low effort. Decomposition, arbitration, product calls → you. Review → always the complement of the slice builder's family, per slice: record who built it, dispatch its opposite (Claude ↔ Codex; with more vendors, the most distant lineage).
- Vendor skills beat weights: before any stack area, load the provider's skill.
- Never pipe a test command. Redirect to a file and check the command's own exit code.
