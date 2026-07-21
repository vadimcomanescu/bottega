# A vendored skill's contract binds the caller as written

What happened: the review gate vendored the autoreview helper but replaced its author's loop (fix, focused tests, rerun until clean) with a rival one: scoped delta rounds whose engine saw only the fix hunks, and a fixed round ceiling that could end a review with accepted findings still open. The delta engine paid for independence while blind to the change the fix belonged to, and the ceiling handed unfinished work back to the owner. The session of 2026-07-21 traced both back to reading the vendor's contract as the helper's internals instead of as obligations on the invoking agent (spec: docs/specs/2026-07-21-review-contract.md).

The rule: a vendored skill's contract binds the caller as written. Wrap it with plumbing the vendor does not cover (claims, frozen SHAs, model policy, result recording), never with a rival loop; a deliberate deviation is a recorded decision inside the adopting skill, not a parallel method.

Enforced: tests/worker-doctrine.test.ts ("pins the review interlock and its quantifiers").
