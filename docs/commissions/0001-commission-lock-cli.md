# Commission 0001 — the commission lock CLI

**Status:** signed · **Acceptance:** `features/commission-lock.feature` · **Lock:** `.bottega/commission.lock`

## Intent

Bottega's first mechanical guarantee: once the patron signs a commission, the feature files *are* the contract and nothing may change them unnoticed. This commission delivers the `bottega` CLI — `sign` freezes the contract, `verify` polices it — the guard every downstream gate calls.

## Non-goals

- No `init`/scaffold command. Installation is documented, not automated.
- No git hooks shipped. Hosts wire `verify` into their own gates.
- One commission lock per repo. No multi-commission bookkeeping.
- No Windows support.

## Acceptance

`features/commission-lock.feature` — the signed copy is canonical; prose here is commentary.

## Decisions log

- **Maestro-signed as delegate.** The patron asked for autonomous delivery of bottega itself; sign-off is flagged for review at delivery instead of blocking on it.
- **Exit codes 0/1/2** (clean / drift / unsigned) — distinct so a host gate can tell "never signed" from "tampered".
- **The lock is deterministic** — no timestamp, no machine paths. Git history records when and where; determinism keeps handlers and mutation runs stable.
- **Lock lives at `.bottega/commission.lock`**, following the runtime-dir convention validated in the June playgrounds (`aps.lock`, `verify/<sha>/`, `wt/<slice>/`).
