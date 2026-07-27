# Delivered design must follow what the reading concluded

What happened: the 0.66.0 routing skill (commit a6dfdb6) shipped a per-dispatch selection predicate one hour after its own commissioned reading concluded that shipped products use fixed role tables and that a predicate router "does not have a clean published example... closer to novel synthesis". The reading was correct; the artifact contradicted it; nobody compared the two before merge. The predicate was replaced by a fixed table the same week.

The rule: state in the spec, or in the ADR when there is no spec, how the chosen design follows from what the reading concluded; a design that contradicts its own reading is a review blocker until the contradiction is argued in the record that carries the decision.

Enforced: REVIEW.md ("a delivered design does not contradict what its own reading concluded").
