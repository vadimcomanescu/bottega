# Third-party material

Every file in this repository that came from outside it, with the revision it was taken at and how to take a newer one. Vendored text is synced as its author wrote it: the register rules in `AGENTS.md` bind bottega's own prose, never these files.

## `skills/code-review/SKILL.md` and the helpers beside it

The review engine every review runs on. The skill's `SKILL.md` is the modified upstream document itself: bottega's frontmatter and title on top, the method beneath. A wrapper page existed until 2026-07-28 and was removed because every invocation loaded the whole document anyway, so the indirection carried nothing.

- Upstream: `openclaw/agent-skills`, under `skills/autoreview`.
- Pinned at `fe588b1` (synced 2026-07-31, bottega issue #185; previously `98122a3` from the import, bottega commit 8b7d021). `scripts/`, `tests/`, and `LICENSE` (upstream's repo-root file) are upstream's bytes, re-copied unchanged on every sync. This sync brought the TruffleHog secret preflight, which requires the `trufflehog` binary on any machine that runs reviews (`bottega:setup` checks it), and the deletion-side redaction. The document took upstream's three hunks since the last pin: the prose-only exception (already backported), the P0-only default output bullet, and the TruffleHog bundle-gate bullet replacing the old heuristic-scanner one.
- Local edits to the document: openclaw material and Windows sections stripped, bottega run rules woven in, helper paths rewritten to this package. One sentence backported from upstream `575bed0` on 2026-07-21 (the exception for diffs that are prose only). The merge rule was locally scoped on 2026-07-24: upstream's "only when the user armed it" and its sensitive-path prohibition now apply to a standalone review, because in a run the recorded evidence is the merge gate and the Close phase merges on it. On 2026-07-28 the woven run rules dropped every Claude worker's effort (no subagent dispatch carries one) and restated the reviewer isolation rule as the run's own design decisions, since the run commits no spec or plan. On 2026-07-25 the run's fix builder was given its model (opus-5), because the route guard denies a dispatch that names none, and the helper path options now lead with the Claude Code plugin install shape (`${CLAUDE_PLUGIN_ROOT}/skills/code-review/scripts/autoreview`), which is what `bottega:setup` produces. On 2026-07-28 the scope governor gained a threat-model axis (bottega issue #172, ADR 0035): the frozen baseline and the review prompt carry one threat-model sentence, findings can classify out of threat model, the growth numbers are computed before each fix dispatch, and continuing past the two-cycle pause requires a narrowing series. On 2026-07-30 the scope baseline and the run's review prompt gained the design's agreed test interfaces beside the threat-model sentence, so the reviewer reports tests written off those interfaces or against implementation internals as findings.
- Sync: re-copy `scripts/`, `tests/`, and `LICENSE` whole, then apply the old-upstream-to-new-upstream diff of upstream's SKILL.md to `skills/code-review/SKILL.md` and reconcile conflicts by hand, keeping bottega's frontmatter and title. Record the new revision. A full sync takes the document and the scripts together. The fix builder's model (opus-5) is a local scoping stated in the document itself; `tests/worker-doctrine.test.ts` pins the line.

## `skills/prototype/SKILL.md`, `UI.md`, and `LOGIC.md`

The prototype method a run's discovery brainstorms with.

- Upstream: `mattpocock/skills`, under `skills/engineering/prototype`.
- Pinned at `2ab9580` (synced 2026-07-31), with upstream's `LICENSE` (MIT, Matt Pocock) beside them.
- Local edits, exactly two. In `SKILL.md` step 6, "Fold any validated decision into the real code" reads "Fold any validated decision into the spec", because a run folds decisions into the spec and the builder takes them to code from there. In `UI.md`, step 2's "Hold each one to" list carries one added bullet pointing variants at the repo's design doc when one exists.
- Sync: re-copy all three files and the license whole, reapply the two edits, and read the diff.

## `skills/domain-modeling/CONTEXT-FORMAT.md` and `ADR-FORMAT.md`

The shapes a new `CONTEXT.md` entry or ADR follows when a file does not already set its own.

- Upstream: `mattpocock/skills`, under `skills/engineering/domain-modeling`.
- Copied unchanged, with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Verified byte-identical to upstream `ed37663` on 2026-07-25, moved from `skills/architect/references/` on 2026-07-31.
- Local edits: none. The `SKILL.md` beside them is bottega's own prose, adapted from the same upstream skill: Matt's structure and session moves in the owner's voice and the house register. The grilling interview (upstream `skills/productivity/grilling`) is absorbed into `skills/discover/SKILL.md`, and the spec skill's shape follows upstream `skills/engineering/to-spec`. Adapted prose takes a sync as a re-read of upstream's diff, applied by hand where it still fits.
- Sync: re-copy both format files and the license whole, then read the diff.

## `agents/codex.md` and the codex companion runtime beside it

The mechanics every codex dispatch runs on. The codex agent forwards one task to `scripts/codex-companion.mjs`, which drives the codex app-server through a broker, keeps job state and threads on disk per workspace, and tears down with the session.

- Upstream: `openai/codex-plugin-cc`, under `plugins/codex`.
- Pinned at `db52e28f4d9ded852ab3942cea316258ae4ef346` ("Remove shell expansion for git commands (#447)"). Apache 2.0: upstream's `LICENSE` and `NOTICE` sit in `agents/`.
- Scripts, taken at upstream-relative paths: `scripts/codex-companion.mjs`, `scripts/app-server-broker.mjs`, `scripts/session-lifecycle-hook.mjs`, `scripts/stop-review-gate-hook.mjs`, `scripts/lib/`, `prompts/`, `schemas/review-output.schema.json`. All byte-identical to upstream except the three hunks recorded next. Everything else under `scripts/` (`pr-threads`) is bottega's own and is never part of a sync.
- Script modifications, exactly three hunks: in `scripts/codex-companion.mjs`, the effort validation accepts `max` and `ultra` (upstream PR #454) and `task` accepts `--full-access`, which runs the thread at the `danger-full-access` sandbox (upstream PR #147). In `scripts/lib/app-server.mjs`, the app-server spawn adds `-c notify=[]` so the machine's notify config never fires from a plugin-driven run. A hunk is dropped when upstream lands its PR.
- Prose, one file: `agents/codex.md`, adapted from upstream `agents/codex-rescue.md`. The diff against upstream is the record of the adaptation.
- Not taken: upstream `commands/`, whose slash wrappers give a person interactive control of codex jobs, a role bottega's orchestrator holds. Upstream `hooks/hooks.json` is not taken, because bottega registers SessionStart and SessionEnd in its own `hooks/hooks.json` and leaves the stop-review-gate unregistered (its script is still vendored). Upstream `skills/` is not taken at all: `codex-cli-runtime` restates the forwarding contract the agent file already carries, `gpt-5-4-prompting` is prompt guidance for a model generation the dispatch sites no longer pin, and `codex-result-handling`'s rule to stop and ask the user before applying any review fix contradicts the run's review phase, which verifies findings and dispatches the accepted ones itself. The brief a dispatch hands codex is written per `skills/use-codex`.
- Sync: re-copy the byte-identical paths whole, apply the upstream-to-upstream diff of `agents/codex-rescue.md` to `agents/codex.md` and reconcile by hand, reapply the three script hunks (fewer as upstream lands #454 and #147), rerun `tests/codex-vendor.test.ts`, and record the new revision here.

Bottega's own prose is every `SKILL.md` under `skills/` except `code-review`'s, which is the modified upstream document recorded above.
