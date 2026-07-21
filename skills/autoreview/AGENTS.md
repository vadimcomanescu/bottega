# Autoreview Skill

- Upstream source: `openclaw/agent-skills`, under `skills/autoreview`. The document and scripts are pinned at upstream revision `98122a3` (as recorded by the import, bottega commit 8b7d021). One sentence was backported from upstream `575bed0` on 2026-07-21 (the exception for diffs that are prose only). SKILL.md is locally adapted (openclaw material and Windows sections stripped, bottega run rules woven in). A full sync takes the document and the scripts together.
- Scripts, tests, and LICENSE are upstream's bytes, re-copied unchanged on every sync.
- To sync: re-copy scripts, tests, and LICENSE whole, then apply the old-upstream-to-new-upstream diff of SKILL.md to the local copy and reconcile conflicts by hand. Record the new upstream revision here.
