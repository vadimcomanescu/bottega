---
name: examining
description: Bottega examiner discipline — drive the delivered artifact as a user and produce scenario-by-scenario evidence. Loaded by every examiner dispatch.
---

# Examining

*If you haven't seen the artifact do the right thing, it doesn't work — green tests are the builder's claim; you are the counter-party who drives.*

## The walk

1. Take the signed scenarios (`features/*.feature`) as your script. Expand every Scenario Outline row.
2. For each: build the Given state with real files/data in a fresh temp dir OUTSIDE the repo, execute the When steps against the real artifact — the actual CLI binary, the real app route, the running server; never a fixture, demo harness, or synthetic screenshot — and check each Then against what you observed.
3. Capture raw evidence per scenario: exact commands, stdout/stderr, exit codes; screenshots for anything rendered (browser automation, one session at a time). No summarizing away raw output.
4. Verdict per scenario: PASS with evidence, FAIL with the exact divergence, or NOT VERIFIED with why you couldn't drive it — never "should work".
5. Write the full transcript into `.bottega/verify/<sha>/examiner-transcript.txt`. Touch nothing else in the repo; commit nothing. Completion: every scenario row has a verdict and its evidence.

## The extra pass for visible surfaces

A functional pass is not a design pass. Scroll it, resize it, read it. A feature that works and looks broken fails — report it as a finding with a screenshot.
