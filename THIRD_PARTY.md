# Third-party material

Every file in this repository that came from outside it, with the revision it was taken at and how to take a newer one. Vendored text is synced as its author wrote it: the register rules in `AGENTS.md` bind bottega's own prose, never these files. Each entry records only what a diff against the pin cannot compute: which files are foreign, where they came from, what is deliberately not taken, and the intent behind each local edit. The edits themselves are read by diffing against the pin, and git history holds when and why each one landed.

## `skills/autoreview/` (`SKILL.md`, `scripts/`, `tests/`, `references/`)

The review engine every review runs on. `SKILL.md` is the modified upstream document: bottega's frontmatter and title on top, the author's method beneath, and bottega's additions standing beside it with no caller named anywhere.

- Upstream: `openclaw/agent-skills`, under `skills/autoreview`. Pinned at `a504fd8`.
- `scripts/`, `tests/`, and `LICENSE` (upstream's repo-root file) are upstream's bytes, re-copied whole on every sync. TruffleHog must be on PATH wherever reviews run (`bottega:setup` checks it).
- The rules the document's local edits carry, each visible in the diff against the pin:
  - Upstream's platform material is out: the openclaw approval-routing, behavior-validator, automation-blame, and gitcrawl passages, the Windows sections, and the Kimi engine's document rows (the scripts keep the engine, and no bottega seat uses it).
  - Helper paths lead with the Claude Code plugin install shape (`${CLAUDE_PLUGIN_ROOT}/...`), which is what `bottega:setup` produces, and the example thinking levels read `xhigh`.
  - The prompt is caller-blind: it carries the reviewed repository's `REVIEW.md` and invoker-handed instructions, and nothing else about the caller's design. A prompt never lives inside the reviewed repository.
  - The scope baseline carries the agreed test interfaces and one sentence of threat model, a finding can classify out of threat model (ADR 0035), and the cycle series past the two-cycle pause must be narrowing.
  - Verifying a finding extends to running the check that settles it, the session's first trusted clean exit needs the smoke-harness probe, and an unverifiable gate marks the head unverified, which outranks clean.
  - The Standards and Spec lens reads run beside the engine passes per `references/lenses.md`, with their models named in the document.
  - A panel set at invocation stays the panel on every rerun. A clean review posts the `bottega/review` commit status, standalone merging is gated by the user's own arming words, and under an orchestrator merging belongs to the caller.
  - A PR by number is reviewed in its own worktree against its base SHA with a helper resolved from a trusted checkout, and its unresolved review threads are claimed findings, resolved in bottega repos through `scripts/pr-threads`.
- `references/lenses.md` and `references/smell-baseline.md` are bottega's own prose, adapted from `mattpocock/skills` under `skills/engineering/code-review`. Their sync is a re-read of that upstream's diff, applied by hand where it still fits. `tests/worker-doctrine.test.ts` pins the lens seats' models.
- Sync: re-copy `scripts/`, `tests/`, and `LICENSE` whole, apply upstream's `SKILL.md` diff to the document and reconcile by hand keeping the rules above, run `npm test`, and record the new pin here.

## `skills/prototype/` (`SKILL.md`, `UI.md`, `LOGIC.md`)

The prototype method a run's discovery brainstorms with.

- Upstream: `mattpocock/skills`, under `skills/engineering/prototype`. Pinned at `84fdeff`, with upstream's `LICENSE` (MIT, Matt Pocock) beside them.
- Local edits: `UI.md`'s "Hold each one to" list carries one added bullet pointing variants at the repo's design doc when one exists. `SKILL.md` and `LOGIC.md` are upstream's bytes.
- Sync: re-copy the files and the license whole, reapply the edits above, and read the diff.

## `skills/domain-modeling/` (`SKILL.md`, `CONTEXT-FORMAT.md`, `ADR-FORMAT.md`)

The domain modeling method a run's design and discovery keep the glossary and decision records current with, and the shapes a new `CONTEXT.md` entry or ADR follows when a file does not already set its own.

- Upstream: `mattpocock/skills`, under `skills/engineering/domain-modeling`. Pinned at `84fdeff`, every file upstream's bytes, with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Upstream's `agents/` registration file is not taken.
- Local edits: none. The grilling interview (upstream `skills/productivity/grilling`) is absorbed into `skills/interview-and-capture/SKILL.md`, and the spec skill's shape follows upstream `skills/engineering/to-spec`. That adapted prose takes a sync as a re-read of upstream's diff, applied by hand where it still fits.
- Sync: re-copy the files and the license whole, then read the diff.

## `skills/setup/` (`SKILL.md`, the tracker templates, `triage-labels.md`, `domain.md`)

The setup skill `/bottega:setup` runs whole: the repo's issue tracker, triage label vocabulary, and domain doc layout, configured once per repository.

- Upstream: `mattpocock/skills`, under `skills/engineering/setup-matt-pocock-skills`. Pinned at `84fdeff`, with upstream's `LICENSE` (MIT, Matt Pocock) beside them.
- Not taken: upstream's `agents/` registration file, and `issue-tracker-gitlab.md`, because bottega-managed repos track on GitHub or in local markdown, never GitLab.
- Local edits, as rules. In `SKILL.md`: bottega's frontmatter and H1, the skill-family references read this plugin's skills, one bullet and Section D carry the branch claim, step 4 creates every named label on the remote (get-or-create, read the list back), Section B's gate runs when `triage` or `to-tickets` is installed, the triage-labels write conditions key on Section B having run, the tracker explainer names `spec` and keeps `qa` (upstream dropped its own qa skill, bottega ships one), and GitLab is stripped from the tracker offer, the template list, and the label-creation step. In `issue-tracker-github.md`: the "Claiming an issue" section (the atomic branch-push claim, assignment as the human-visible signal), and the wayfinder route reads `bottega:wayfinder`. In `issue-tracker-local.md`: the same wayfinder route. In `triage-labels.md`: the first column header reads "Canonical role" where upstream names its own repo. In `domain.md`: the routes read `bottega:domain-modeling`, `bottega:interview-and-capture`, and `bottega:improve-codebase-architecture`.
- Sync: re-copy the files and the license whole (`issue-tracker-gitlab.md` stays untaken), reapply the edits above, and read the diff.

## `skills/to-tickets/SKILL.md`

The tickets skill `/bottega:to-tickets` runs whole: break a plan, spec, or conversation into tracer-bullet tickets, each declaring its blocking edges, published to the configured tracker. A ticket it publishes is launchable as its own bottega run, with the tracker owner's claim procedure covering collisions between sessions. Working the frontier and closing the parent issue stay the user's acts, as upstream designs them.

- Upstream: `mattpocock/skills`, under `skills/engineering/to-tickets`. Pinned at `84fdeff`, with upstream's `LICENSE` (MIT, Matt Pocock) beside it. Upstream's `agents/` registration file is not taken.
- Local edits: the setup pointers read `bottega:setup` where upstream names its own setup skill.
- Sync: re-copy the file and the license whole, reapply the edits above, and read the diff.

## `skills/improve-codebase-architecture/` (`SKILL.md`, `HTML-REPORT.md`)

The interactive architecture review: scan for deepening candidates, render them as a visual HTML report, then walk the picked one through its decisions. `bottega:auto-improve` runs it headless and takes the strongest candidate through a run.

- Upstream: `mattpocock/skills`, under `skills/engineering/improve-codebase-architecture`. Pinned at `84fdeff`, with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Upstream's `agents/` registration file is not taken.
- Local edits, as rules. In `SKILL.md`: the frontmatter drops `disable-model-invocation` and the description gains the reach clause, so `bottega:auto-improve` can invoke it, the routes read this plugin's names (`bottega:codebase-design`, `bottega:domain-modeling`), the grilling route is inlined as the round-by-round interview, and a passage restating a routed skill's contents is cut where the route already stands: the vocabulary and principles parentheticals, the domain-modeling side-effect bullets, and the platform enumeration for writing and opening the report. In `HTML-REPORT.md`: the codebase-design routes read `bottega:codebase-design`, and the use-exactly and never-substitute lists are cut because that skill's glossary carries them.
- Sync: re-copy both files and the license whole, reapply the edits above, and read the diff.

## `skills/triage/` (`SKILL.md`, `AGENT-BRIEF.md`, `OUT-OF-SCOPE.md`)

The triage skill `/bottega:triage` runs whole: move issues and external PRs through the five-role state machine, verify claims, and write agent-ready briefs.

- Upstream: `mattpocock/skills`, under `skills/engineering/triage`. Pinned at `84fdeff`, with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Upstream's `agents/` registration file is not taken.
- Local edits, in `SKILL.md` only: the setup pointer reads `bottega:setup`, and the grilling route reads `bottega:interview-and-capture`, which carries the grilling-plus-domain-modeling composition upstream names as two skills. `AGENT-BRIEF.md` and `OUT-OF-SCOPE.md` are upstream's bytes.
- Sync: re-copy the files and the license whole, reapply the edits above, and read the diff.

## `skills/wayfinder/SKILL.md`

The wayfinder skill `/bottega:wayfinder` runs whole: chart work too big for one session as a shared map of decision tickets on the tracker, then resolve them one at a time until the way is clear.

- Upstream: `mattpocock/skills`, under `skills/engineering/wayfinder`. Pinned at `84fdeff`, with upstream's `LICENSE` (MIT, Matt Pocock) beside it. Upstream's `agents/` registration file is not taken.
- Local edits: the setup pointer reads `bottega:setup`, the grilling-plus-domain-modeling routes read `bottega:interview-and-capture`, the prototype route reads `bottega:prototype`, and the research-ticket routes read plain "a research subagent", because wayfinder captures findings on a throwaway branch with a pointer from the ticket, and `bottega:research` keeps findings out of the repository.
- Sync: re-copy the file and the license whole, reapply the edits above, and read the diff.

## `skills/research/SKILL.md`

The research skill `/bottega:research` runs whole: a background agent investigates a question against primary sources while the caller keeps working, then reports back.

- Upstream: `mattpocock/skills`, under `skills/engineering/research`. Pinned at `84fdeff`, with upstream's `LICENSE` (MIT, Matt Pocock) beside it. Upstream's `agents/` registration file is not taken.
- Local edits: the findings report to the conversation with a URL for every claim and an UNVERIFIED mark on what the agent could not verify, and they land in the session scratchpad, never in the repository, where upstream saves a Markdown file among the repo's notes. Research is working material: the decision it produces becomes an ADR that cites its sources, and a committed research file would be a second home for the same facts.
- Sync: re-copy the file and the license whole, reapply the edits above, and read the diff.

## `skills/diagnosing-bugs/` (`SKILL.md`, `scripts/hitl-loop.template.sh`)

The diagnosis method `/bottega:diagnosing-bugs` runs whole: build a feedback loop that goes red on the bug before any hypothesis, minimise the repro, test ranked falsifiable hypotheses one variable at a time, and land the fix with a regression test.

- Upstream: `mattpocock/skills`, under `skills/engineering/diagnosing-bugs`. Pinned at `84fdeff`, with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Upstream's `agents/` registration file is not taken.
- Local edits: the post-mortem's architecture handoff reads `bottega:improve-codebase-architecture`.
- Sync: re-copy the files and the license whole, reapply the edit above, and read the diff.

## `skills/handoff/SKILL.md`

The handoff skill `/bottega:handoff` runs whole: compact the current conversation into a document a fresh agent continues from, saved in the OS temporary directory.

- Upstream: `mattpocock/skills`, under `skills/productivity/handoff`. Pinned at `84fdeff`, with upstream's `LICENSE` (MIT, Matt Pocock) beside it. Upstream's `agents/` registration file is not taken.
- Local edits: none.
- Sync: re-copy the file and the license whole, then read the diff.

## `skills/teach/` (`SKILL.md`, the format files)

The teaching skill `/bottega:teach` runs whole: a stateful teaching workspace in the current directory, holding the mission, resources, lessons, reference documents, and learning records.

- Upstream: `mattpocock/skills`, under `skills/productivity/teach`. Pinned at `84fdeff`, with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Upstream's `agents/` registration file is not taken.
- Local edits: none.
- Sync: re-copy the files and the license whole, then read the diff.

## `skills/writing-for-agents/` (`SKILL.md`, `SKILL-MECHANICS.md`)

The reference for writing documents agents consume, served to the repositories the plugin installs into. Bottega's own prose keeps its stricter doctrine in `skills-internal/write-bottega-skills`, which never ships.

- Upstream: `mattpocock/skills`, under `skills/productivity/writing-for-agents`. Pinned at `84fdeff`, with upstream's `LICENSE` (MIT, Matt Pocock) beside them. Upstream's `agents/` registration file is not taken.
- Local edits: none.
- Sync: re-copy the files and the license whole, then read the diff.

## `vendor/codex/`, the codex agent and the companion runtime

The mechanics every codex dispatch runs on. The codex agent forwards one task to `vendor/codex/scripts/codex-companion.mjs`, which drives the codex app-server through a broker, keeps job state and threads on disk per workspace, and tears down with the session.

- Upstream: `openai/codex-plugin-cc`, under `plugins/codex`. Pinned at `db52e28f4d9ded852ab3942cea316258ae4ef346`. Apache 2.0: upstream's `LICENSE` and `NOTICE` sit in `vendor/codex/`.
- `vendor/codex/` mirrors upstream's `plugins/codex/` path for path, because the scripts find their neighbours by walking up from themselves: `codex-companion.mjs` resolves the directory above `scripts/`, and `lib/app-server.mjs` reads `../../.claude-plugin/plugin.json` at import, so upstream's manifest is vendored with them and a dispatch reports codex's version rather than bottega's. Split the directory and dispatches fail at load, which `tests/codex-vendor.test.ts` pins.
- Taken, byte-identical to upstream except the hunks recorded next: `.claude-plugin/plugin.json`, `agents/codex.md` (adapted, see below), `scripts/codex-companion.mjs`, `scripts/app-server-broker.mjs`, `scripts/session-lifecycle-hook.mjs`, `scripts/lib/`, `LICENSE`, `NOTICE`.
- Everything under `scripts/` at the repository root (`pr-threads`) is bottega's own and is never part of a sync.
- Script modifications: in `vendor/codex/scripts/codex-companion.mjs`, the effort validation accepts `max` and `ultra` (upstream PR #454) and `task` accepts `--full-access`, which runs the thread at the `danger-full-access` sandbox (upstream PR #147). In `vendor/codex/scripts/lib/app-server.mjs`, the app-server spawn adds `-c notify=[]` so the machine's notify config never fires from a plugin-driven run. A hunk is dropped when upstream lands its PR.
- Prose, one file: `vendor/codex/agents/codex.md`, adapted from upstream `agents/codex-rescue.md`. The diff against upstream is the record of the adaptation.
- Not taken, because a dispatch reaches none of it. Upstream `commands/` holds slash wrappers giving a person interactive control of codex jobs, a role bottega's orchestrator holds. Upstream `hooks/hooks.json` would register a stop-time review gate, where bottega registers SessionStart and SessionEnd in its own `hooks/hooks.json` and gates review through `skills/autoreview`, so `scripts/stop-review-gate-hook.mjs` and its prompt stay out with it. `prompts/` and `schemas/` serve only the `review` and `adversarial-review` subcommands, which `agents/codex.md` forbids and no wrapper exposes. The companion reads both inside those handlers rather than at import, so leaving them out costs no edit to upstream's bytes. Upstream `skills/` is not taken at all: `codex-cli-runtime` restates the forwarding contract the agent file already carries, `gpt-5-4-prompting` is prompt guidance for a model generation the dispatch sites no longer pin, and `codex-result-handling`'s rule to stop and ask the user before applying any review fix contradicts the run's review phase, which verifies findings and dispatches the accepted ones itself. The brief a dispatch hands codex is written per `skills/use-codex`.
- Sync: copy upstream's `plugins/codex/` over `vendor/codex/`, delete the paths listed above as not taken, apply the upstream-to-upstream diff of `agents/codex-rescue.md` to `vendor/codex/agents/codex.md` and reconcile by hand, reapply the script hunks (fewer as upstream lands #454 and #147), rerun `tests/codex-vendor.test.ts`, and record the new revision here.

Bottega's own prose is every skill under `skills/` without an entry above.
