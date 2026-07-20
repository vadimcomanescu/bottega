# A copy of a live file drifts; point at the file

What happened: docs/specs/cross-harness.md embedded the full text of skills/maestro/SKILL.md under the heading "exact text". Within hours, three later commits edited the skill and not the copy; the spec then asserted a routing rule, a reach table, and a concurrency rule that the shipped skill no longer contained. The copy was replaced with a pointer on 2026-07-20.

The rule: a document never embeds the body of a live file; it links the file. An agreed excerpt is quoted with its commit SHA so it reads as history, not as the current state.

Enforced: skills/codebase-design/SKILL.md ("one home per fact"); REVIEW.md points reviewers here.

Related: [rewrites-keep-quantifiers](rewrites-keep-quantifiers.md).
