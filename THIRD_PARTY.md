# Third-party material

Every file in this repository that came from outside it, with the revision it was taken at and how to take a newer one. Vendored text is synced as its author wrote it: the register rules in `AGENTS.md` bind bottega's own prose, never these files.

## `skills/code-review/references/autoreview.md` and the helpers beside it

The review engine every review runs on.

- Upstream: `openclaw/agent-skills`, under `skills/autoreview`.
- Pinned at `98122a3` (recorded by the import, bottega commit 8b7d021). `scripts/`, `tests/`, and `LICENSE` are upstream's bytes, re-copied unchanged on every sync.
- Local edits to the document: openclaw material and Windows sections stripped, bottega run rules woven in, helper paths rewritten to this package. One sentence backported from upstream `575bed0` on 2026-07-21 (the exception for diffs that are prose only). The merge rule was locally scoped on 2026-07-24: upstream's "only when the user armed it" and its sensitive-path prohibition now apply to a standalone review, because in a run the recorded evidence is the merge gate and the Close phase merges on it. On 2026-07-25 the run's fix builder was given its model (opus-5 at xhigh), matching `bottega:build`, because the route guard denies a dispatch that names none, and the helper path options now lead with the Claude Code plugin install shape (`${CLAUDE_PLUGIN_ROOT}/skills/code-review/scripts/autoreview`), which is what `bottega:setup` produces.
- Sync: re-copy `scripts/`, `tests/`, and `LICENSE` whole, then apply the old-upstream-to-new-upstream diff of upstream's SKILL.md to `references/autoreview.md` and reconcile conflicts by hand. Record the new revision. A full sync takes the document and the scripts together. The fix builder's model stays scoped to the builder row of `skills/maestro/references/workers.md`, which serves a standalone review that never reads a run's table; `tests/worker-doctrine.test.ts` fails when the two disagree.

## `skills/codebase-design/references/CONTEXT-FORMAT.md` and `ADR-FORMAT.md`

The shapes a new `CONTEXT.md` entry or ADR follows when a file does not already set its own.

- Upstream: `mattpocock/skills`, under `skills/engineering/domain-modeling`.
- Copied unchanged, with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Verified byte-identical to upstream `ed37663` on 2026-07-25.
- Local edits: none. The domain-model doctrine that uses them is bottega's own prose in `skills/codebase-design/SKILL.md`.
- Sync: re-copy both files and the license whole, then read the diff.

Each package's own `SKILL.md` is bottega's, not vendored.
