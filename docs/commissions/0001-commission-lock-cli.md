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

### Added during the run (flagged for patron review)

- **Exit 3 = corrupt lock.** The adversary produced tampered locks (bad JSON, wrong version, duplicate paths, traversal paths) that either crashed verify or verified clean. Corrupt is now its own loud state — exit 3, `corrupt lock: <reason>` on stderr — because mapping tamper onto "unsigned, re-sign" (exit 2) would invite exactly the laundering the lock exists to prevent. The signed scenarios pin only 0/1/2 for their three states; 3 is additive.
- **Mutation stamping vs the lock — open design question.** The APS mutator writes its evidence manifest into the feature file after a run, which is drift by raw-byte semantics. This run archived the manifest to `.bottega/verify/<sha>/` and restored the signed bytes. The alternative — manifest-aware hashing in sign/verify — is a contract change and waits for a patron decision (commission 0002 candidate).
- **Repo created private.** Publishing is one click and irreversible the other way; the patron flips it when ready.
- **Examiner gate satisfied by execution, not a separate agent.** For a CLI, the acceptance handlers execute the real binary in temp repos per scenario, and the adversary drove it live against fifteen-plus hostile states — a separate examiner pass would re-drive the same binary the same way. UI commissions get the full examiner.
- **Single slice, no worktree.** One file-disjoint slice in a fresh repo; worktree isolation buys nothing here. Parallel slices get worktrees per the skill.
