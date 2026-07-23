# 0014: The spec is a product document reviewed live; the acceptance machinery it replaced stays dead

Date: 2026-07-23 (recording the arc from release 0.20.0 through 0.63.0, 2026-07-19)

The user-facing acceptance surface went through three shapes before the current one. Signed Gherkin feature files were the contract (through 0.19.0). A walkthrough gate rendered them to plain-English documents with a renderer-equality check and an anti-forgery layer (0.20.0); it was deleted one release later on principle: honesty-policing mechanisms are a treadmill that model progress obsoletes, while artifact-equality mechanisms stay, and the renderer was machinery for an unobserved problem. The ceremony deletions of 0.25.0 and the strips that followed removed the signed-Gherkin apparatus entirely.

The current shape landed in 0.63.0: the spec is a product document with a fixed floor ([`skills/spec/references/spec-format.md`](../../skills/spec/references/spec-format.md)), written in product language, presented as a live shared document the owner reviews in comment threads, with the local markdown file as the single source of truth. Three observed failures drove it: delivered specs read as insider shorthand, models built custom solutions where standard ones existed (the format now demands the standard-solution citation), and owners skimmed specs presented as long chat messages.

Recorded so the dead shapes are not re-proposed: a renderer between the owner and the artifact, an anti-forgery layer on the acceptance surface, and raw Gherkin as the thing a non-engineer signs were each tried and removed for reasons that still hold.
