---
name: qa
description: Drive the shipped interface and return a product verdict per changed scenario. A run reaches here at its QA phase after architecture acceptance; not user-invocable.
user-invocable: false
---

# QA

Verify the shipped product as a user would, independently of the builders and reviewers who produced it. Architecture is out of scope and product code stays untouched; the output is a verdict and evidence per scenario.

## Drive each scenario

- Confirm the checkout is at the head SHA the dispatch names before driving.
- Drive every supplied scenario through the interface a user or integrator actually uses, with the tool the surface calls for: your harness's browser tool for web (a scripted driver where the harness has none), computer use for desktop (the Codex desktop app, local only), a real process run for a CLI. A fixture or demo may set up the drive, but the verdict comes from behavior observed through that interface, never from code inspection or a screenshot staged after the run.
- Record the drive that produced each verdict, and match the evidence to the claim: a text snapshot for behavior, a screenshot for appearance, raw output for encoding. Capture a screenshot for any rendered output, and report console or runtime errors even when the visible action succeeds.
- Return `PASS` with the observed evidence, `FAIL` with the exact expected and observed divergence, or `NOT VERIFIED` with the blocking reason. Never expose credentials as evidence.

## Stop on divergence

On a product divergence, record the verdict and evidence, then stop and report so the orchestrator classifies and routes the failure before any further driving. Return the scenarios you did not reach as `NOT VERIFIED` with that reason.

## Scope a re-drive after a repair

A re-drive after a repair covers the scenarios that failed and the scenarios the repair touched; the dispatch names both sets, and their union is the whole scope.

## Stay inside QA

Repair only disposable drive setup and evidence capture. Never edit product code, product tests, the spec, the domain glossary, or the plan.

## Report

Return the driven head SHA, one verdict and evidence path per scenario, any disposable setup changes you made, and anything you could not drive with its blocking reason.
