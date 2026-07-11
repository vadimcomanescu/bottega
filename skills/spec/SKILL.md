---
name: spec
description: Write and sign the contract — spec doc, Gherkin scenarios, storyboards, gate. Reached by pointer from skills/run when the priced proof includes a signed contract.
disable-model-invocation: true
---

# Spec — the contract

The user signs product, never execution. Everything here is written for a reader who leaves. Discovery already happened in `skills/run`; you arrive with the interview settled. Judgment stays in your turns: every scenario's final text, the Direction, the shot list, arbitration, every reply in the gate's comment loop.

## The doc

1. Name it `docs/specs/<YYYY-MM-DD>-<feature-slug>.md`. The bare feature slug is the commission's identity everywhere. Pre-flight collisions: the spec path, `bottega/<feature-slug>`, `bottega/evidence-<feature-slug>`, `.bottega/gates/<feature-slug>/` — a collision means the name was under-specific; sharpen it, never number it.
2. Draft it per [references/template.md](references/template.md): Intent, Non-goals, Open questions, Direction, one section per scenario, Decisions log. Contract prose holds one page. A commission hard enough that coverage and framing decide quality is drafted by the panel (`skills/panel`) — one self-contained prompt, contract synthesized from the judge's comparison; anything smaller you draft in your own turns and cross-read (step 7). Every Open-Question default is already written into the scenarios; the doc never publishes with holes. A decision the user never spoke lands under **Our calls — veto by comment**, in their words. Every user-facing sentence is plain product English.
3. **Direction: shared understanding, never a plan.** In domain language: the `CONCEPTS.md` delta (terms the user co-signs; they land in `CONCEPTS.md` at sign), the guiding bet (one or two sentences: where the change lives, what owns what), and only the hard-to-reverse calls. Two tests bound it: every line affirmable without reading code, and expensive to undo once data or callers depend on it. A run discovery that bends it is superseded in the Decisions log and surfaced to the user, never silently.
4. **Scenarios: the definition of done.** Authored directly in `features/*.feature`, the single home of the scenario text — the doc points, never copies. Steps in the domain's own words, second person; Scenario Outlines with Examples wherever values matter. **Altitude guard:** a scenario the named actor cannot perform or watch is not acceptance — it descends to a dossier, reviewer criterion, or the test suite. Schema shapes, enforcement layers, and forged-request probes never appear in signed features. The delivery reads the scenarios back as a checklist with evidence; there is no separate done.
5. **Acceptance checks and testing lines.** A scenario section adds an **Acceptance checks** list only for promises the flow cannot show (persistence, sync, absence, timing) — each binary on the finished product and carrying its value ("appears on a second signed-in device within 30 seconds", never "syncs"). Each scenario section carries one Testing line in plain terms: what gets opened, done, seen, and the evidence that comes back. Concrete or rejected. Storyboards, when priced, follow `skills/storyboarding`: the primary scenario's strip sits under the Intent; every listed flow returns at delivery as a QA recording.
6. **Size guard:** more than ~3 independently buildable surfaces is several commissions; propose the split at the gate.

## Run start — the acceptance toolchain

Bought with the contract, installed at run start, never before: read [references/run-start.md](references/run-start.md) and dispatch it as one mechanic brief (or run it in your own turns on a small run) — toolchain pinned into `.bottega/aps.lock`, entrypoints generated from `features/*.feature`, suite proven RED, wiring committed. A host outside the kit's languages (TypeScript, Python, Go, Rust) cannot make the contract executable — say so before the gate, never at run start.

## Gate

7. **Cross-read**, only for a contract drafted in your own turns — a panel-drafted one already crossed independent minds. Dispatch codex (xhigh, read-only) with the draft, the feature files, and the repo. Its hunt: a Then no actor can observe, a Given QA cannot build, Examples without mutation-bearing values, HOW past the altitude guard, a non-goal contradicting a scenario, an *our call* one question would have retired, a zero, a many, or a failure no scenario visits. Findings are sensor data: arbitrate each; overrules land in the Decisions log.
8. Hand to `skills/signoff`: one collaborative doc, comments answered where made, `SIGNED <feature-slug>` as the go signal — the sign commit lands the status flip and `features/` together. The phase's durable state is entirely on disk (`docs/specs/`, `features/`, `.bottega/gates/<feature-slug>/`); any later session picks up cold.

## Unattended — the sign delegated

Only on the user's explicit word, usually an issue handed over; never inferred. The delegation covers the interview and the gate, nothing else — with no user reading the contract, the panel and the cross-read are the only independent eyes it gets. The interview already closed in discovery (`skills/run`, Discover: the issue is the interview); every question it would have asked lands as an our-call with its default written into the scenarios. No gate: run the SIGNED cascade yourself and open the Decisions log with the delegation, quoted and linked. From sign onward the issue thread does the gate doc's duties — status, escalations — and the delivery PR discloses the unattended sign in its first line. What delegation never buys: the real-users rail, the fable fence, and the `features/` freeze all stand.

**Done when** the feature files run as acceptance without a follow-up question, and a non-engineer reading the gate doc could say what will change for them.
