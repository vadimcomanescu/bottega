# QA of an integration drives the integration

What happened: 0.66.0's QA evidence for the model proxy was `test -e` path checks and greps over README text. It passed while the proxy had never been installed or run. The QA skill already required behavior observed through the real interface; the scenario was written so that the "interface" became the documentation.

The rule: the QA scenario for an adopted integration sends a real request through it and records the response; a check that only reads the integration's description verifies the description. Scenario design is where this fails, so the orchestrator checks the scenario names the mechanism, not its docs.

Enforced: skills/qa/SKILL.md ("the verdict comes from behavior observed through that interface"); REVIEW.md.
