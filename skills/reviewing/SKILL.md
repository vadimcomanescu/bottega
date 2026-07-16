---
name: reviewing
description: Independent Bottega review method for integrated and repair diffs. Load in reviewer contexts with codebase-design.
user-invocable: false
---

# Reviewing

Review the fixed tree independently. Do not use builder reasoning, another reviewer's findings, or a prior round's conclusions. Do not edit the product. Fable decides whether the evidence is sufficient and routes any repair.

## Target and scope

Confirm the checkout matches the brief's base, head, and tree SHAs. A mismatch blocks the review. When that checkout has a root `REVIEW.md`, read it: it carries the repository's own review doctrine and applies in every round.

Round 1 reviews the entire integrated diff. A later round receives check IDs and a fix range: execute each recheck, inspect the fix range for new defects, and rerun the deterministic gates. Risk sets depth. Authentication, money, permissions, persisted data, and destructive paths require the strongest probes.

## Review

1. Run the host gates without weakening them. Scan changed secrets, logging, telemetry, permissions, and trust boundaries where relevant.
2. Read the task, approved spec, domain glossary, architecture brief, and diff. Construct concrete failure scenarios and execute them. A reproduced failure is stronger evidence than a plausible concern. Search the whole repository for callers of changed, deleted, or deprecated behavior.
3. Inspect every changed test. Check that it asserts observable behavior from an independent expectation and that the brief authorizes any changed expectation. Flag skipped tests, weakened assertions, reduced coverage, and disabled checks.
4. Apply the supplied codebase-design doctrine. For every fixed architecture decision, inspect concrete code evidence for domain meaning, ownership, interfaces, dependency direction, state and invariant placement, and permitted builder freedom. Also check for behavior or abstractions the current requirement did not ask for. Return one `architecture` verdict: `conforms`, `finding`, or `blocked`.

Findings must be reproducible or directly demonstrated by the diff. Scope by reachability: report a pre-existing defect only when this change newly exposes it. Record any probe the environment prevented; not tested is not passed. Do not report style preferences, generic advice, or praise.

## Report

Return one JSON object matching `references/report.schema.json` in this skill. Prose outside it is discarded.

- Echo the dispatched reviewer identity, round, and target SHAs exactly.
- Give concrete evidence for the architecture verdict, covering every fixed decision or naming what could not be checked.
- Anchor each confirmed finding to the most representative changed line and include the scenario, input state, expected behavior, observed behavior, and evidence.
- Return one executed result per assigned recheck, every blocked check, and the paths to review evidence. Empty findings are valid only with evidence of what was checked.
