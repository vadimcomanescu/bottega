---
name: code-review
description: Review a diff through the vendored review engine. Use bottega:code-review on a PR, ref range, or working diff. A run's Review phase uses the whole method.
argument-hint: "<PR, ref range, or worktree>"
---

# Code review

Review one diff and leave nothing blocking at its head. The engine is vendored in this package: [references/autoreview.md](references/autoreview.md) carries the whole method, the run's both-family panel, the blind prompt, how a finding is classified blocker or follow-up, the fix dispatch to a fresh builder, and the rerun until nothing blocking remains, along with the obligations it puts on you. Its helper lives in `scripts/`.

Run [references/autoreview.md](references/autoreview.md) against your target. Invoked on its own, that target is a PR, a ref range, or the working diff. In a run it is the integrated diff you reach at the Review phase, and there you keep the verdict: verifying each finding against the real code and accepting or rejecting the head stay your call.
