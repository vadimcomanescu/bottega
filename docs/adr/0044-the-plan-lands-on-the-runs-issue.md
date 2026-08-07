# 0044: The plan lands on the run's issue

Amended on 2026-08-07 by `0046-beads-is-the-tracker.md`: the plan lands as one comment on the run's bead, since beads is the tracker and every run has a bead. The clause about a run with no tracker issue keeping the plan in the conversation is gone with the case it covered.

Decision. The run's plan, written per the architect doctrine's plan section with the vertical slices beside it, is posted as one comment on the run's tracker issue, next to the spec, before any builder starts. The codex second opinion, the closeout seat, the architecture read, and any later session read it there. A run with no tracker issue keeps the plan in the conversation, as before. The improve skill picks and verifies its candidate itself, and its handoff stands as the run's discovery and spec, so an improve run starts at the plan.

Why. ADR 0033 removed plan documents from the repository, and the plan lost its artifact with them: maestro produced the design in conversation, so the second opinion reviewed an "execution plan" nothing could point at, later sessions could not recover it, and maestro restated the architect doctrine's plan content instead of routing to it. ADR 0041 already settled where a run's working record lives: the tracker issue, out of the repository. This decision extends that placement to the plan and keeps the repository free of plan files.

Trade-off. A comment on an issue is looser than a reviewed file: nothing gates its format, and a run that skips posting it fails silently until the second opinion or a resumed session reaches for it. The counterweight is the maestro text, which makes posting the comment the finish line of the plan step.
