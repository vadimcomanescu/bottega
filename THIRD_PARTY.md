# Third-party material

Every file in this repository that came from outside it, with the revision it was taken at and how to take a newer one. Vendored text is synced as its author wrote it: the register rules in `AGENTS.md` bind bottega's own prose, never these files.

## `skills/code-review/SKILL.md` and the helpers beside it

The review engine every review runs on. The skill's `SKILL.md` is the modified upstream document itself: bottega's frontmatter and title on top, the method beneath. A wrapper page existed until 2026-07-28 and was removed because every invocation loaded the whole document anyway, so the indirection carried nothing.

- Upstream: `openclaw/agent-skills`, under `skills/autoreview`.
- Pinned at `98122a3` (recorded by the import, bottega commit 8b7d021). `scripts/`, `tests/`, and `LICENSE` are upstream's bytes, re-copied unchanged on every sync.
- Local edits to the document: openclaw material and Windows sections stripped, bottega run rules woven in, helper paths rewritten to this package. One sentence backported from upstream `575bed0` on 2026-07-21 (the exception for diffs that are prose only). The merge rule was locally scoped on 2026-07-24: upstream's "only when the user armed it" and its sensitive-path prohibition now apply to a standalone review, because in a run the recorded evidence is the merge gate and the Close phase merges on it. On 2026-07-28 the woven run rules dropped every Claude worker's effort (no subagent dispatch carries one) and restated the reviewer isolation rule as the run's own design decisions, since the run commits no spec or plan. On 2026-07-25 the run's fix builder was given its model (opus-5), because the route guard denies a dispatch that names none, and the helper path options now lead with the Claude Code plugin install shape (`${CLAUDE_PLUGIN_ROOT}/skills/code-review/scripts/autoreview`), which is what `bottega:setup` produces. On 2026-07-28 the scope governor gained a threat-model axis (bottega issue #172, ADR 0035): the frozen baseline and the review prompt carry one threat-model sentence, findings can classify out of threat model, the growth numbers are computed before each fix dispatch, and continuing past the two-cycle pause requires a narrowing series.
- Sync: re-copy `scripts/`, `tests/`, and `LICENSE` whole, then apply the old-upstream-to-new-upstream diff of upstream's SKILL.md to `skills/code-review/SKILL.md` and reconcile conflicts by hand, keeping bottega's frontmatter and title. Record the new revision. A full sync takes the document and the scripts together. The fix builder's model (opus-5) is a local scoping stated in the document itself; `tests/worker-doctrine.test.ts` pins the line.

## `skills/architect/references/CONTEXT-FORMAT.md` and `ADR-FORMAT.md`

The shapes a new `CONTEXT.md` entry or ADR follows when a file does not already set its own.

- Upstream: `mattpocock/skills`, under `skills/engineering/domain-modeling`.
- Copied unchanged, with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Verified byte-identical to upstream `ed37663` on 2026-07-25.
- Local edits: none. The domain-model doctrine that uses them is bottega's own prose in `skills/architect/SKILL.md`.
- Sync: re-copy both files and the license whole, then read the diff.

## `agents/codex.md` and the codex companion runtime beside it

The mechanics every codex dispatch runs on. The codex agent forwards one task to `scripts/codex-companion.mjs`, which drives the codex app-server through a broker, keeps job state and threads on disk per workspace, and tears down with the session.

- Upstream: `openai/codex-plugin-cc`, under `plugins/codex`.
- Pinned at `db52e28f4d9ded852ab3942cea316258ae4ef346` ("Remove shell expansion for git commands (#447)"). Apache 2.0: upstream's `LICENSE` and `NOTICE` sit in `skills/codex-cli-runtime/`.
- Scripts, taken at upstream-relative paths: `scripts/codex-companion.mjs`, `scripts/app-server-broker.mjs`, `scripts/session-lifecycle-hook.mjs`, `scripts/stop-review-gate-hook.mjs`, `scripts/lib/`, `prompts/`, `schemas/review-output.schema.json`. All byte-identical to upstream except the two hunks recorded next. Everything else under `scripts/` (`pr-threads`) is bottega's own and is never part of a sync.
- Script modifications, exactly two hunks. In `scripts/codex-companion.mjs`, the effort validation accepts `max` and `ultra` across three lines: the set, `const VALID_REASONING_EFFORTS = new Set(["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"]);`, the usage string's `[--effort <none|minimal|low|medium|high|xhigh|max|ultra>]`, and the error message's `Use one of: none, minimal, low, medium, high, xhigh, max, ultra.`. This is tracked upstream as PR #454, so the hunk is dropped once upstream lands it. In `scripts/lib/app-server.mjs`, the app-server is spawned as `this.proc = spawn("codex", ["app-server", "-c", "notify=[]"], {`, so the machine's own notify config never fires from a plugin-driven run.
- Prose, taken with recorded local scoping: `agents/codex.md` (upstream `agents/codex-rescue.md`), `skills/codex-cli-runtime/SKILL.md`, and `skills/gpt-5-4-prompting/` (its `SKILL.md` and `references/codex-prompt-recipes.md`). The scoping edits, and nothing else: the agent file is `agents/codex.md` with `name: codex` (upstream names it `codex-rescue` for its interactive rescue role, and in bottega it is the codex dispatch vehicle), so every `codex:codex-rescue` reads `bottega:codex`; `skills/codex-cli-runtime/SKILL.md` forwards `--background` to `task` instead of stripping it (upstream strips it as Claude-side control, and bottega's watch mechanic needs the receipt a background job returns), forwards `--cwd` the same way, and lists the effort values the patched script accepts; `agents/codex.md` gains the matching one-line rule naming `--background` and `--cwd` as pass-through runtime controls.
- Not taken: upstream `commands/`, whose slash wrappers give a person interactive control of codex jobs, a role bottega's orchestrator holds. Upstream `hooks/hooks.json` is not taken, because bottega registers SessionStart and SessionEnd in its own `hooks/hooks.json` and leaves the stop-review-gate unregistered (its script is still vendored). Upstream `skills/codex-result-handling/` is not taken: nothing loads it, and its rule to stop and ask the user before applying any review fix contradicts the run's review phase, which verifies findings and dispatches the accepted ones itself.
- Sync: re-copy the byte-identical paths whole, apply the upstream-to-upstream diff of the scoped prose files and reconcile by hand, reapply the two script hunks (one, once #454 lands), rerun `tests/codex-vendor.test.ts`, and record the new revision here.

Bottega's own prose is every `SKILL.md` under `skills/` except three. `code-review`'s is the modified upstream document recorded above, and `codex-cli-runtime` and `gpt-5-4-prompting` are upstream's documents with the scoping recorded above.
