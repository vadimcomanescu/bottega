---
name: run
description: Run the whole bottega loop in one sitting — commission → autonomous build → evidenced delivery. User-invoked via /bottega:run, never auto-triggered — a run costs hours of autonomous fleet work and starts with a sign-off gate. To do the halves separately, /bottega:spec signs without running and /bottega:execute runs what is signed.
disable-model-invocation: true
---

# Run — commission, then execute

One command, two skills in sequence; this file owns only the seam between them.

1. **Commission** — follow `skills/spec`: the interview, the contract, the storyboards, the gate via `skills/signoff`, through `SIGNED <feature-slug>` and its cascade. Pointed at a commission that is already signed and unexecuted, skip straight to 2 — a signed commission is never re-opened.
2. **Execute** — on SIGNED, follow `skills/execute` from its entry check: the run, the delivery PR, the spec close-out.

Everything binding — the maestro-tier seat rule, the routing table, the fences — lives in those two skills; nothing here overrides them.
