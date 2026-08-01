# The priority threshold gagged the review gate

What happened: the 2026-07-31 vendor sync brought a reporting threshold that injects "report only P0" into every review prompt without defining P0. gpt-5.6-sol rates a confidently-found command injection P1, so under that default it suppressed every real finding and returned "patch is correct" at 0.99 confidence, saying in its own receipt that lower-priority security issues were intentionally omitted as required. The smoke harness exposed it only because its fixed assertion demanded a finding, and a simulated closeout ran two reviews through the gagged gate before a direct probe cleared the model: asked plainly, gpt-5.6-sol found every planted defect in twenty seconds at the same effort. The failure was configuration, not capability, and it survived a full green test suite because nothing exercised the engine's discrimination.

The rule: a review invocation names its priority threshold wide enough that the downstream classification does the filtering, and the smoke probe runs at that same threshold before the first clean exit of a session is trusted.

Enforced: skills/code-review/SKILL.md ("--max-priority P2", "AUTOREVIEW_MAX_PRIORITY=P2").
