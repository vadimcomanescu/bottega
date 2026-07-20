# Delivered design must follow the delivered research

What happened: the 0.66.0 routing skill (commit a6dfdb6) shipped a per-dispatch selection predicate one hour after its own commissioned research concluded that shipped products use fixed role tables and that a predicate router "does not have a clean published example... closer to novel synthesis". The research was correct; the artifact contradicted it; nobody compared the two before merge. The predicate was replaced by a fixed table the same week.

The rule: before a spec is agreed, state in it how the chosen design follows from the research record; a design that contradicts its own research record is a review blocker until the contradiction is argued in the record.

Enforced: REVIEW.md ("a delivered design follows the spec's own research record").
