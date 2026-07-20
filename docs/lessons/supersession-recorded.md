# A reversal of an earlier verdict is recorded when it happens

What happened: on 2026-07-19 the model proxy was evaluated and declined for cause (upstream account-ban reports, no rate limiting). On 2026-07-20 it was adopted with stronger evidence (the claudex pattern running the same setup daily at scale). The adoption was the owner's call to make; what failed is that no record connected the two, so the decline survived in session history as an apparently live verdict, and the adoption looked uninformed when it was not.

The rule: when a decision reverses an earlier verdict, the record that carries the decision (the spec or the ADR) states the supersession and the evidence that changed the call, in the same delivery. Recording, not gating: the owner's decision is already made; the record is so the trail exists.

Enforced: skills/spec/SKILL.md, Grill ("names that verdict and the evidence that changed the call").
