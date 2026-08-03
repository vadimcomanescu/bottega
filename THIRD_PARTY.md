# Third-party material

Every file in this repository that came from outside it, with the revision it was taken at and how to take a newer one. Vendored text is synced as its author wrote it: the register rules in `AGENTS.md` bind bottega's own prose, never these files.

## `skills/autoreview/SKILL.md` and the helpers beside it

The review engine every review runs on. The skill's `SKILL.md` is the modified upstream document itself: bottega's frontmatter and title on top, the method beneath. A wrapper page existed until 2026-07-28 and was removed because every invocation loaded the whole document anyway, so the indirection carried nothing.

- Upstream: `openclaw/agent-skills`, under `skills/autoreview`.
- Pinned at `a504fd8` (synced 2026-08-02; previously `fe588b1` from 2026-07-31, bottega issue #185, and `98122a3` from the import, bottega commit 8b7d021). The 2026-08-02 sync brought the Kimi review engine (scripts, isolation contract, and doc rows), upstream's reworked scope governor (scope defined by the authorized invariant and its owner, with file counts and LOC multipliers retired as automatic stop conditions, which also retires the local growth-numbers clause that qualified the old 2x rule), the root-cause contract bullets, and the Java launcher test skips. `scripts/`, `tests/`, and `LICENSE` (upstream's repo-root file) are upstream's bytes, re-copied unchanged on every sync. This sync brought the TruffleHog secret preflight, which requires the `trufflehog` binary on any machine that runs reviews (`bottega:setup` checks it), and the deletion-side redaction. The document took upstream's three hunks since the last pin: the prose-only exception (already backported), the P0-only default output bullet, and the TruffleHog bundle-gate bullet replacing the old heuristic-scanner one.
- Local edits to the document: openclaw material and Windows sections stripped, helper paths rewritten to this package (leading with the Claude Code plugin install shape `${CLAUDE_PLUGIN_ROOT}/skills/autoreview/scripts/autoreview`, which is what `bottega:setup` produces), and bottega's additions standing beside the author's method with no caller named anywhere: the prompt checks the reviewed repository's root for `REVIEW.md` itself and carries invoker-handed instructions and nothing else about the caller's design, the Standards and Spec lens reads run beside the engine passes per `references/lenses.md` with their models named in the document, a panel set at invocation stays the panel on every rerun, the commit-status and standalone merge rules close the review at the accepted head with merging under an orchestrator left to the caller, and the scope governor keeps the threat-model axis (bottega issue #172, ADR 0035) and the design's agreed test interfaces (2026-07-30). Additions from the 2026-08-01 simulated closeout: the trusted-helper rule reworded to its achievable reading (the helper reviews the repository it runs in), the smoke-harness probe before the first trusted clean exit, and the unverifiable-gate report rule. More from the same day's end-to-end test of the shipped method: the receipt tiebreak (an ambiguous reasoning-token receipt defers to the session's smoke probe), unverified outranking the clean-head label, the prompt-location precedence over the repo-relative example, the codex-serve detection note in the Lenses section, and test-support helpers counting as test in the baseline's LOC. Same day, upstream's P0-only reporting default was overridden at every invocation, and on 2026-08-02 the override was removed: the contract carries upstream's P0 default again, with upstream's unmerged PR #107 reworking the same surface. The scripts stay upstream's bytes. A sentence backported from upstream `575bed0` on 2026-07-21 (the exception for diffs that are prose only). Older local edits recorded late (present since 3bff936, 2026-07-28): the example commands' thinking levels read `xhigh` where upstream shows `high` and `max`, the PR-thread paragraph (unresolved review threads treated as claimed findings, resolved in bottega repos through `scripts/pr-threads`), the PR-by-number paragraph (PR head checked out in its own worktree, base pinned to its SHA, the trusted-helper rule), and the scope governor's growth-numbers clause (compute against the frozen baseline, never judge growth by feel) with the narrowing-series rule beside it. The run rules woven in between 2026-07-24 and 2026-07-30 (the maestro's fix dispatch and its builder model, the always-panel on the integrated diff, the rerun engine alternation, the run-scoped merge gate) were unwoven on 2026-08-01 (ADR 0042): the run now dispatches a fresh seat that runs the method whole, so the document carries no run. Another edit from 2026-08-01: the contract's verify line extends to running the check that settles a finding when one exists.
- `references/lenses.md` and `references/smell-baseline.md` are bottega's own prose in the house register, adapted from `mattpocock/skills` under `skills/engineering/code-review` (the two-axis method and its Fowler smell baseline). A sync of those two is a re-read of that upstream's diff, applied by hand where it still fits.
- Sync: re-copy `scripts/`, `tests/`, and `LICENSE` whole, then apply the old-upstream-to-new-upstream diff of upstream's SKILL.md to `skills/autoreview/SKILL.md` and reconcile conflicts by hand, keeping bottega's frontmatter and title. Record the new revision. A full sync takes the document and the scripts together. The lens seats' models are a local scoping stated in the document itself; `tests/worker-doctrine.test.ts` pins the lines.

## `skills/prototype/SKILL.md`, `UI.md`, and `LOGIC.md`

The prototype method a run's discovery brainstorms with.

- Upstream: `mattpocock/skills`, under `skills/engineering/prototype`.
- Pinned at `2ab9580` (synced 2026-07-31), with upstream's `LICENSE` (MIT, Matt Pocock) beside them.
- Local edits. In `UI.md`, step 2's "Hold each one to" list carries one added bullet pointing variants at the repo's design doc when one exists. `SKILL.md` and `LOGIC.md` are upstream's bytes.
- Sync: re-copy the files and the license whole, reapply the edits above, and read the diff.

## `skills/domain-modeling/` (`SKILL.md`, `CONTEXT-FORMAT.md`, `ADR-FORMAT.md`)

The domain modeling method a run's design and discovery keep the glossary and decision records current with, and the shapes a new `CONTEXT.md` entry or ADR follows when a file does not already set its own.

- Upstream: `mattpocock/skills`, under `skills/engineering/domain-modeling`.
- Pinned at `2ab9580` (synced 2026-08-01), every file upstream's bytes, with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Upstream's `agents/` registration file is not taken. The `SKILL.md` replaces the house rewrite that stood here through 0.179.0; the format files were first verified byte-identical at `ed37663` on 2026-07-25.
- Local edits: none. The grilling interview (upstream `skills/productivity/grilling`) stays absorbed into `skills/interview-and-capture/SKILL.md`, and the spec skill's shape follows upstream `skills/engineering/to-spec`; that adapted prose takes a sync as a re-read of upstream's diff, applied by hand where it still fits.
- Sync: re-copy the files and the license whole, then read the diff.

## `skills/setup/` (`SKILL.md`, the tracker templates, `triage-labels.md`, `domain.md`)

The setup skill `/bottega:setup` runs whole: the repo's issue tracker, triage label vocabulary, and domain doc layout, configured once per repository.

- Upstream: `mattpocock/skills`, under `skills/engineering/setup-matt-pocock-skills`.
- Pinned at `2ab9580` (synced 2026-08-02), with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Upstream's `agents/` registration file and `issue-tracker-gitlab.md` are not taken: bottega-managed repos track on GitHub or in local markdown, never GitLab. This replaces the house setup skill that stood here through 0.181.0, whose harness checks, command verification, and merge-governance discovery retired because a run performs each at the moment it needs it (ADR 0045); `references/merge-governance.md` retired with them.
- Local edits. In `SKILL.md`: the frontmatter (`name: setup`, the description), the H1, the spots where "the engineering skills" named upstream's own skill family, one bullet and Section D for the branch claim, step 4's label creation on the remote, Section B's gate (with its exploration bullet) widened to run when `triage` or `to-tickets` is installed, because both ship with this plugin and read the labels (get-or-create every label named in `docs/agents/triage-labels.md`, read the list back), step 4's write conditions keyed to Section B having run rather than to the `triage` skill, the tracker explainer naming `spec` where upstream says `to-spec`, and GitLab stripped from the tracker offer, the template list, and the label-creation step, with the untaken template above. In `issue-tracker-github.md`: the "Claiming an issue" section, the atomic branch-push claim with assignment as the human-visible signal, and the Wayfinding section's route reading `bottega:wayfinder`. In `issue-tracker-local.md`: the same wayfinder route. In `triage-labels.md`: the first column header reads "Canonical role" where upstream names its own repo. In `domain.md`: the routes read `bottega:domain-modeling`, `bottega:interview-and-capture`, and `bottega:improve-codebase-architecture` where upstream names its own commands.
- Sync: re-copy the files and the license whole (`issue-tracker-gitlab.md` stays untaken), reapply the edits above, and read the diff.

## `skills/to-tickets/SKILL.md`

The tickets skill `/bottega:to-tickets` runs whole: break a plan, spec, or conversation into tracer-bullet tickets, each declaring its blocking edges, published to the configured tracker.

- Upstream: `mattpocock/skills`, under `skills/engineering/to-tickets`.
- Pinned at `2ab9580` (synced 2026-08-02), with upstream's `LICENSE` (MIT, Matt Pocock) beside it. Upstream's `agents/` registration file is not taken.
- Local edits: the setup pointers read `bottega:setup` where upstream names its own setup skill. A ticket the skill publishes is launchable as its own bottega run: maestro takes the issue URL, and the tracker owner's claim procedure covers the collision between sessions. Working the frontier (launching only tickets whose blockers are closed) and closing the parent issue stay the user's acts, as upstream designs them.
- Sync: re-copy the file and the license whole, reapply the edits above, and read the diff.

## `skills/improve-codebase-architecture/` (`SKILL.md`, `HTML-REPORT.md`)

The interactive architecture review: scan for deepening candidates, render them as a visual HTML report, then walk the picked one through its decisions. `bottega:auto-improve` runs it headless and takes the strongest candidate through a run.

- Upstream: `mattpocock/skills`, under `skills/engineering/improve-codebase-architecture`.
- Pinned at `2ab9580` (synced 2026-08-03), with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Upstream's `agents/` registration file is not taken.
- Local edits. In `SKILL.md`: the frontmatter drops `disable-model-invocation` and the description gains the reach clause, so `bottega:auto-improve` can invoke it, the routes read this plugin's names (`bottega:codebase-design`, `bottega:domain-modeling`), the grilling route is inlined as the one-question-at-a-time interview, and a passage restating a routed skill's contents is cut where the route already stands: the vocabulary and principles parentheticals, the domain-modeling side-effect bullets, and the platform enumeration for writing and opening the report. In `HTML-REPORT.md`: the codebase-design routes read `bottega:codebase-design`, and the use-exactly and never-substitute lists are cut because that skill's glossary carries them.
- Sync: re-copy both files and the license whole, reapply the edits above, and read the diff.

## `skills/triage/` (`SKILL.md`, `AGENT-BRIEF.md`, `OUT-OF-SCOPE.md`)

The triage skill `/bottega:triage` runs whole: move issues and external PRs through the five-role state machine, verify claims, and write agent-ready briefs.

- Upstream: `mattpocock/skills`, under `skills/engineering/triage`.
- Pinned at `2ab9580` (synced 2026-08-03), with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Upstream's `agents/` registration file is not taken.
- Local edits, in `SKILL.md` only: the setup pointer reads `bottega:setup`, and the grilling route reads `bottega:interview-and-capture`, which carries the grilling-plus-domain-modeling composition upstream names as two skills. `AGENT-BRIEF.md` and `OUT-OF-SCOPE.md` are upstream's bytes.
- Sync: re-copy the files and the license whole, reapply the edits above, and read the diff.

## `skills/wayfinder/SKILL.md`

The wayfinder skill `/bottega:wayfinder` runs whole: chart work too big for one session as a shared map of decision tickets on the tracker, then resolve them one at a time until the way is clear.

- Upstream: `mattpocock/skills`, under `skills/engineering/wayfinder`.
- Pinned at `2ab9580` (synced 2026-08-03), with upstream's `LICENSE` (MIT, Matt Pocock) beside it. Upstream's `agents/` registration file is not taken.
- Local edits: the setup pointer reads `bottega:setup`, the grilling-plus-domain-modeling routes read `bottega:interview-and-capture`, the prototype route reads `bottega:prototype`, and the research-ticket routes read plain "a research subagent" because this plugin ships no research skill.
- Sync: re-copy the file and the license whole, reapply the edits above, and read the diff.

## `vendor/codex/`, the codex agent and the companion runtime

The mechanics every codex dispatch runs on. The codex agent forwards one task to `vendor/codex/scripts/codex-companion.mjs`, which drives the codex app-server through a broker, keeps job state and threads on disk per workspace, and tears down with the session.

- Upstream: `openai/codex-plugin-cc`, under `plugins/codex`.
- Pinned at `db52e28f4d9ded852ab3942cea316258ae4ef346` ("Remove shell expansion for git commands (#447)"). Apache 2.0: upstream's `LICENSE` and `NOTICE` sit in `vendor/codex/`.
- `vendor/codex/` mirrors upstream's `plugins/codex/` path for path, because the scripts find their neighbours by walking up from themselves: `codex-companion.mjs` resolves the directory above `scripts/`, and `lib/app-server.mjs` reads `../../.claude-plugin/plugin.json` at import, so upstream's manifest is vendored with them and a dispatch reports codex's version rather than bottega's. Split the directory and dispatches fail at load, which `tests/codex-vendor.test.ts` pins.
- Taken, all byte-identical to upstream except the hunks recorded next: `.claude-plugin/plugin.json`, `agents/codex.md` (adapted, see below), `scripts/codex-companion.mjs`, `scripts/app-server-broker.mjs`, `scripts/session-lifecycle-hook.mjs`, `scripts/lib/`, `LICENSE`, `NOTICE`.
- Everything under `scripts/` at the repository root (`pr-threads`) is bottega's own and is never part of a sync.
- Script modifications: in `vendor/codex/scripts/codex-companion.mjs`, the effort validation accepts `max` and `ultra` (upstream PR #454) and `task` accepts `--full-access`, which runs the thread at the `danger-full-access` sandbox (upstream PR #147). In `vendor/codex/scripts/lib/app-server.mjs`, the app-server spawn adds `-c notify=[]` so the machine's notify config never fires from a plugin-driven run. A hunk is dropped when upstream lands its PR.
- Prose, one file: `vendor/codex/agents/codex.md`, adapted from upstream `agents/codex-rescue.md`. The diff against upstream is the record of the adaptation.
- Not taken, because a dispatch reaches none of it. Upstream `commands/` holds slash wrappers giving a person interactive control of codex jobs, a role bottega's orchestrator holds. Upstream `hooks/hooks.json` would register a stop-time review gate, where bottega registers SessionStart and SessionEnd in its own `hooks/hooks.json` and gates review through `skills/autoreview`, so `scripts/stop-review-gate-hook.mjs` and its prompt stay out with it. `prompts/` and `schemas/` serve only the `review` and `adversarial-review` subcommands, which `agents/codex.md` forbids and no wrapper exposes. The companion reads both inside those handlers rather than at import, so leaving them out costs no edit to upstream's bytes: run `adversarial-review` by hand and it fails on the missing prompt, which is the only reachable consequence. Upstream `skills/` is not taken at all: `codex-cli-runtime` restates the forwarding contract the agent file already carries, `gpt-5-4-prompting` is prompt guidance for a model generation the dispatch sites no longer pin, and `codex-result-handling`'s rule to stop and ask the user before applying any review fix contradicts the run's review phase, which verifies findings and dispatches the accepted ones itself. The brief a dispatch hands codex is written per `skills/use-codex`.
- Sync: copy upstream's `plugins/codex/` over `vendor/codex/`, delete the paths listed above as not taken, apply the upstream-to-upstream diff of `agents/codex-rescue.md` to `vendor/codex/agents/codex.md` and reconcile by hand, reapply the script hunks (fewer as upstream lands #454 and #147), rerun `tests/codex-vendor.test.ts`, and record the new revision here.

Bottega's own prose is every skill under `skills/` without an entry above.
