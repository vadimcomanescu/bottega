# A message sent to a workflow worker resurrects a duplicate; the answer travels as a file

What happened: probing the workflow ask channel (2026-08-01), a workflow worker sent its question to the main conversation and the orchestrator answered by messaging the worker's agent id. The runtime reported no active task and resumed a copy of the worker from its transcript outside the workflow. The copy received the answer, spent 36k tokens, and returned a report the workflow script never saw, while the real worker inside the run learned nothing. The file channel in the same probe worked: the orchestrator wrote the agreed answer file and the worker read it eight seconds after asking, then finished inside the run.

The rule: the orchestrator answers a workflow worker by writing the answer file the worker's brief names. A send to a workflow worker's id is a failed answer, not a slow one.

Enforced: skills/maestro/SKILL.md (the answer-file sentence).
