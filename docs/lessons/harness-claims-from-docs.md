# Harness claims come from harness docs

What happened: on 2026-07-20 the assistant asserted that the `user-invocable` skill frontmatter key "does not exist in the harness" and was "silently ignored", and built a defect narrative on it. The key is real and documented (hide from the `/` menu, keep model-invocable), and the tree's use of it implemented an explicit owner instruction from PR #41. The claim came from another skill's prose and memory, not from the harness docs.

The rule: a claim about harness behavior (frontmatter keys, hooks, dispatch mechanics, model resolution) is read from the harness documentation at claim time. Another skill's text, a vendored reference, or memory of the docs is not a source.

Enforced: AGENTS.md, Rules ("read from the harness documentation at claim time").
