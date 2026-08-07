---
name: research
description: Investigate a question against high-trust primary sources and report the findings back in the conversation. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
---

Spin up a **background agent** to do the research, so you keep working while it reads.

Its job:

1. Investigate the question against **primary sources** — official docs, source code, specs, first-party APIs — not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Report the findings with a URL for every claim, and anything it could not verify marked UNVERIFIED rather than filled in from memory.
3. Write findings to the session scratchpad directory, never into the repository. Research is working material, not a deliverable: it goes in the scratchpad, and what survives is the decision it produced.

**Never commit a research document.** A decision becomes an ADR that states its reasoning in its own words and cites external sources by URL. A repo research file is a second home for the same facts, drifts from the decision, and gets cited by living docs that should point at the decision instead. If the reasoning matters, it belongs in the ADR; if it does not, it belongs nowhere.
