# The panel is fusion: identical task, independent answers, compare-only judge

The panel exists for one hard question whose answer is expensive to get wrong. Its mechanism is fusion (OpenRouter, https://openrouter.ai/blog/announcements/fusion-beats-frontier/): the same task text verbatim to independent models from different companies, each grounding itself in the repository and the web, drafts blinded, a judge that only compares (consensus points, contradictions, partial coverage, unique insights, blind spots), and synthesis by the caller, who holds the context the judge never sees.

Why the briefs are identical: the gain is measured on that configuration and comes from model diversity over the same question. On DRACO (100 deep-research tasks), fable-5 fused with gpt-5.5 scored 69.0 against 65.3 for fable-5 solo; even two runs of the same model fused gained 6.7 points, from different reasoning paths, tool calls, and source selections. Differentiating the briefs per seat destroys the mechanism: no seat answers the whole question, the judge cannot mark consensus or contradiction between drafts of different questions, and the measured result no longer applies.

Rejected, and stays rejected without new evidence:

- Per-seat angle or constraint briefs (one seat told to minimize, another to flex). That is an interface-exploration instrument, not a panel; it trades away the independence the fusion numbers rest on.
- Cross-review as a substitute for the panel. Critique is bounded by the one answer under review; it can find defects in a frame but never supplies the alternative frame. Fusion fused independent answers; it did not have one model review another.
- A judge that writes or votes the answer. The judge compares; the decision stays with the caller. This is bottega's one deviation from the source, because the caller holds context no seat has.

The measured evidence, the source readings, and what bottega concluded from each are recorded in `docs/research/2026-07-25-fusion-panels.md`. The rule itself lives in `skills/panel/SKILL.md` (same `task.md` verbatim to every seat, no preferred answer stated, compare-only judge). This record is why the rule is shaped that way, so a session proposing to "improve" the panel by differentiating the seats reads the refutation instead of rediscovering it.
