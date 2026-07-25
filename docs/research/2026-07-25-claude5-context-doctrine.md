# The Claude 5 context doctrine, read against bottega

Snapshot: 2026-07-25. Sources, read in full:

- [The new rules of context engineering for Claude 5 generation models](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models) (Anthropic)
- [A field guide to Claude Fable: finding your unknowns](https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns) (Anthropic)

## What the sources argue

The context-engineering post reports that Anthropic removed over 80% of Claude Code's system prompt for the Claude 5 models with no measurable loss on coding evaluations, and draws the rules from that result: replace rigid rules with judgment guidance ("write code that reads like the surrounding code" instead of comment-count rules); design expressive interfaces instead of giving examples (an enum teaches usage better than a sample); move detail behind progressive disclosure instead of front-loading it; keep instruction in one home (tool descriptions, not the system prompt too); keep CLAUDE.md to purpose plus gotchas and never the obvious; and prefer rich references, real artifacts the model can read (an HTML mockup, a test suite, working code), over prose descriptions of them, with an explicit ranking: a readable mockup beats both a description and a screenshot.

The field guide frames agent work as closing the gap between the map (what the prompt carries) and the territory (the code and its constraints), and names the four kinds of unknowns to hunt: what you stated, what you know you left open, what you would never think to write down, and what you never considered. Its techniques: a blind spot pass before work, prototypes in several directions for taste decisions, interviews one question at a time ordered by architectural impact, references over retellings, plans that lead with the decisions most likely to change, a deviations log during the work, and explainers after. Its stated failure mode is two-sided: over-specification makes the model follow orders when pivoting is better; under-specification makes it assume the industry standard.

## What bottega concluded

Most of the doctrine was already load-tested here (the two-tests rule in AGENTS.md, the over-specification defect in REVIEW.md, the grill and blind-spot sweep in `skills/spec`, maps that route without restating). The 0.108.0 calibration pass applied the remainder and fixed the one structural violation: prototype sources are now kept beside the spec as a builder reference instead of destroyed, because the sources rank a readable mockup above the screenshot and description the method used to keep.

The calibration bar distilled from the two posts, applied sentence by sentence:

1. **No-op**: the line changes nothing a Claude 5 model does unprompted.
2. **Derivable**: the repo, the plan, or the artifact itself already carries it.
3. **Restatement**: an adjacent sentence already says it; restatements get no doubt-protection.
4. **Second home**: the fact lives in another file loaded by the same reader.
5. **Mechanism-scripting**: it dictates keystrokes where the outcome would do.
6. **Rules to judgment**: an always/never survives only when it pins an observed failure or a costly mistake.
7. **Rich references**: a real artifact is kept and pointed at, never retold or destroyed.

A cut needs a positive case under one of these; a constraint pinning an observed failure survives doubt. The 80% headline does not transfer to a tree already pruned under review: the pass over bottega's 11,462-word skills tree touched about 3% of sentences, and what remains is decisions, contracts, and pinned failures, the three categories the sources say to keep.

`skills/calibrate` carries this bar as a user-invocable audit for host repos. The field guide's discovery method lives in `skills/discover`, the run's opening phase.
