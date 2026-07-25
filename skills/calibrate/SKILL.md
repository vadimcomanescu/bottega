---
name: calibrate
description: Audit a repo's agent docs (the root map, skills, rules files) against the Claude 5 calibration bar and propose the cuts. Use bottega:calibrate on a repo or one doc when the user wants agent instructions pruned, rightsized, or checked against what current models need told.
argument-hint: "<repo root, or one doc>"
---

# Calibrate

Hold every sentence of a repo's agent docs to what a Claude 5 model actually needs told, and deliver the diff that removes the rest. The bar below is distilled from Anthropic's own guidance for this model generation; sources and derivation are in [the research note](../../docs/research/2026-07-25-claude5-context-doctrine.md).

## 1. Read

Read the target whole: the named doc, or the repo's agent surface (the root `CLAUDE.md` or `AGENTS.md`, and the skills and rules files it routes to), together with what else loads for the same reader, because a fact's second home only shows when both homes are in view. Vendored and third-party text is out of scope. Complete when everything in scope is read.

## 2. Judge

Every sentence gets one of three outcomes, and every cut names the test that fired:

- **Cut** when it fails one of: the model does it unprompted (no-op); the repo, plan, or artifact already carries it (derivable); an adjacent sentence already says it (restatement); another file loaded by the same reader states it (second home); it dictates keystrokes where the outcome would do (mechanism-scripting).
- **Keep** when it is a decision made (a model, a gate, a path, an ownership), a contract (a report shape, a verdict set, CLI mechanics), or a constraint pinning an observed failure or a costly mistake. An always/never survives only on that last ground.
- **Convert** when the form is wrong: prose describing an artifact becomes the artifact kept and pointed at; an example teaching a format becomes the schema or enum that enforces it; detail only some readers need moves behind a loaded-on-demand file.

Doubt splits by kind: a constraint in doubt stays, because cutting a failure-pin re-runs the failure; a restatement in doubt is checkable against its neighbor, so check it.

## 3. Propose

Present the whole diff, each change naming its test, and name what was audited clean, so an absence of edits reads as a verdict and not a skip. Apply nothing silently.

## 4. Apply

Apply exactly what was accepted, move any test pins quoting edited lines in the same change, and end with the repo's own checks green.
