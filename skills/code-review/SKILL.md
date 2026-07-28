---
name: code-review
description: Review a diff through the vendored review engine. Use bottega:code-review on a PR, ref range, or working diff; a run's Review phase uses the whole method.
argument-hint: "<PR, ref range, or worktree>"
---

# Code review

Review one diff and leave nothing blocking at its head. The engine is vendored in this package: [references/autoreview.md](references/autoreview.md) carries the whole method (the run's both-family panel, the blind prompt, how a finding is classified blocker or follow-up, the fix dispatch to a fresh builder, and the rerun until nothing blocking remains) and the obligations on the agent that uses it; its helper lives in `scripts/`.

Run that contract on the target: a PR, a ref range, or the working diff when used on its own, the integrated diff when a run reaches its Review phase. In a run the orchestrator keeps the verdict, so verifying each finding against the real code and accepting or rejecting the head stay its call.
