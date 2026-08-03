---
name: auto-improve
description: Scan the codebase and take the strongest deepening candidate to a reviewed PR. Use bottega:auto-improve when the user wants the codebase improved without picking the candidate themselves. Never use proactively. It opens a run, which costs hours of autonomous agent work.
argument-hint: "<optional area or direction>"
---

# Auto-improve

Run the improvement scan, choose the strongest candidate yourself, and take it through a run.

1. Run `bottega:improve-codebase-architecture`, scoped to the direction I named when I gave one. Write and open its report as it says: the report is the evidence trail. Its closing question and its interview are mine to answer, and I am not in this loop, so skip them and make the choice yourself.
2. Check open issues and PRs. A candidate already tracked or already in flight is not a finding.
3. Take the strongest candidate and verify it on the real code before spending a run on it: apply the deletion test and say what complexity concentrates where, name a test the current interface makes hard to write, and check the change against the ADRs covering the area. When a candidate fails verification, take the next one, and record the failure as an ADR when a future scan would rediscover the same dead end. When every candidate fails, report what the scan found and stop.
4. Take the verified candidate through `bottega:maestro`, handing over the problem with its proof, the change in product terms, and measurable acceptance criteria. The handoff stands as the run's discovery and spec, and the run starts at the plan.
