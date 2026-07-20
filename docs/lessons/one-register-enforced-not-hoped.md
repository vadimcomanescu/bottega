# A register rule binds through a test, and the reference must itself conform

What happened: the instruction "align every skill's opening; no agent-style 'You are' openers" was executed on 2026-07-20 by a sweep that used maestro, routing, and qa as the register reference and excluded them from the sweep. Maestro was the file carrying the "You are the orchestrator" opener, so the defect survived its own fix. Separately, "evaluate skills against writing-great-skills" bound nothing: the reference is silent on voice, and no test checked openings.

The rule: skill bodies open with an imperative orienting sentence and read as procedure; "You are" openings belong only to agent definitions, whose body is a system prompt. A register rule is pinned by a test the moment it is adopted, and a file used as the reference for a sweep is checked against the rule first.

Enforced: AGENTS.md, Rules ("Skill bodies open with an imperative orienting sentence"); tests/worker-doctrine.test.ts ("keeps skill openings imperative and oriented").
