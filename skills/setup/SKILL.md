---
name: setup
description: One-time reconciliation of a machine and a repo with bottega, covering Claude Code and the codex CLI, skill discovery, the route guard, the dispatch timeout ceiling, then the repo's domain-doc contract, documentation architecture, tracker conventions, and GitHub labels.
disable-model-invocation: true
---

# Setup

Reconcile a machine and a repo with bottega, once. Configure Claude Code and the codex CLI the run's GPT cross-reads go through, then bring the project to the shape `bottega:codebase-design` defines, its domain docs and its documentation architecture. Read that skill before you start the repo work.

## 1. Configure the harness

Configure Claude Code. Anything missing, report it rather than installing it silently.

- **Requirements.** `git`, `node`, and `gh`.
- **Codex CLI.** Verify `codex` is installed and logged in (`codex login status`). The run's GPT cross-reads go through it.
- **Skill discovery.** Claude Code installs the plugin from this repo's marketplace (the README's install commands). Confirm it lists the bottega skills. When it does not, walk me through the install commands rather than symlinking anything.
- **Route guard.** Confirm the guard from `hooks/` is registered.
- **Dispatch timeout ceiling.** The orchestrator runs a codex worker as one tracked background shell call, so the shell timeout ceiling must exceed the longest expected run. Read the current variable from the harness's environment-variable documentation (`BASH_MAX_TIMEOUT_MS` at last claim), set it in the settings `env` block to a few hours, and leave the default timeout alone so ordinary commands keep their short limit. Verify it with one live call whose requested timeout exceeds ten minutes.

## 2. Discover what the repo already has

Resolve symlinks first, then read. Never search by a fixed list of filenames. For each part of the shape below, find where it lives today, whatever it is called and wherever it sits, and finish with every part carrying either a located current home or a stated "nowhere":

- The map: the root agent docs, whether one symlinks the other, and any existing `bottega:setup` managed block.
- Domain terms: whatever currently defines the repo's vocabulary, in any file or doc section.
- Decisions: wherever design decisions are recorded today, including prose sections of README-class docs.
- Tracker conventions, the GitHub remote, its labels, and whether `gh` is authenticated with issue and label permissions.
- The project's commands (test, lint, format, typecheck, build, run), whether the canonical map states them, and `.gitignore`.
- The end-to-end suite where the repo ships a user-facing surface: which flows it drives, and how a subset of them is named to its runner.
- The default branch's merge governance: rulesets or branch protection, the auto-merge setting, and any automation that merges or arms auto-merge.
- Any index the repo declares for its own agent skills.

## 3. Decide, one at a time

Present the findings, then walk only the decisions the repo cannot answer, one per exchange, waiting for each answer:

- **Canonical map**: which of `CLAUDE.md` and `AGENTS.md` is the map. Ask only when both exist as independent files. When one symlinks the other, its target is the map. When neither exists, default to `CLAUDE.md` and present the choice so I can veto it in one read. The non-map filename only ever exists as a symlink to the map, so both harnesses load the one copy.
- **Tracker location**, only when no remote settles it. A single GitHub remote settles it (GitHub Issues on that remote).
- **Context count**, when the code suggests more than one bounded context.
- **Area labels**, only when the repo has more than one bounded context whose names the tree does not settle. A single-context repo has none.

## 4. Propose the edits

For every gap between the found state and the shape, show me the exact edit that closes it. Move content that already exists and invent none, so never create an empty glossary, ADR scaffold, or owner doc.

- **The managed block** in the canonical map, delimited by versioned markers (`<!-- bottega:setup v1 begin -->` and `<!-- bottega:setup v1 end -->`) so a rerun updates only its own block. It routes to each fact's home and never restates it, and it records the symlink when the non-map file links the map.
- **A commands section** in the canonical map when the map does not already state them: the project's test, lint, format, typecheck, build, and run commands. Verify each by running it once before you write it. Verify the run command from a disposable worktree: start it, watch for readiness, stop it. The map is the commands' one home, so runs read them from it and fix them there when one breaks.
- **The map symlink** when only one of `CLAUDE.md` and `AGENTS.md` exists: create the other as a symlink to it.
- **Migrations.** Move discovered term definitions into the relevant `CONTEXT.md`. Move discovered decision records that meet the ADR bar into `docs/adr/`. A committed research, findings, or reading note is not a record at all, so the decision it reached becomes one ADR paragraph and the note goes. Two files claiming the same authority merge into one home. Every reference updates in the same change. Formats follow `bottega:codebase-design` and its references. When a source and its target both hold material, put the merge to me before you write.
- **The missing end-to-end specs** when a flow the product cannot ship broken has no check the suite runs and names on its own (a tag, or whatever naming its runner offers). Draft them in the suite's own conventions for me to correct before they land, and where the harness cannot run that suite, file one issue naming the uncovered flows instead. Runs scope QA from that named set, so the suite is where these flows are named and you write no prose inventory of them.
- **Owner docs** for tracker conventions, always reusing an existing equivalent home instead of creating a second one.
- **A merge-governance proposal** when the default branch has none, where the platform's plan supports it. GitHub's merge queue is the platform's own mechanism for landing green PRs, and it needs an organization-owned public repository or GitHub Enterprise Cloud (https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue), so where it is unavailable the shape below stands in for it. A ruleset carries the project's gates as required checks, squash merges, and no bypass actors. Auto-merge is allowed, and the account that opens the PR arms it in the same breath as `gh pr create`, never a workflow holding a long-lived token. Two things rule out arming from a workflow: a merge made with `GITHUB_TOKEN` starts no workflow run on the default branch (https://docs.github.com/en/actions/concepts/security/github_token), and a token the owner has to mint by hand leaves the arming step skipping green until someone notices. What stops a PR landing is a `hold` label enforced by its own cheap required check, its workflow triggered on `pull_request` types `opened, reopened, synchronize, labeled, unlabeled` and reporting a conclusion on every one, never a skip. Those last two types have to be in the list, because the default trigger set omits `labeled` and `unlabeled`, so removing the label would never re-run the check, and a skipped required check satisfies no ruleset. Adding the label then blocks the merge and removing it lands the PR. The strict up-to-date requirement stays off, since auto-merge cannot update a branch: with it on, the first merge leaves every other armed PR behind and waiting on a person, and the default branch's own CI run is what catches a base that moved incompatibly under a green PR. Required approvals stay zero while the owner authors the PRs, because an author cannot approve their own PR. How a green PR lands is then the repository's own decision, written in its own documented procedure that runs read from its map, so propose the shape and keep no second copy of the procedure. Automation you find merging a PR directly is shown as an edit that removes it.
- **A `.bottega/` entry in `.gitignore`** when missing.
- **The approved `area:*` labels, plus the `hold` label a held PR carries**, each created with `gh` as get-or-create and read back. The `area:*` labels organize the backlog for people, and the method never reads them. Never rename or delete an existing label.

## 5. Apply

Apply only what was approved, exactly as shown, and finish when every proposed edit is either applied or explicitly declined. A declined edit leaves its gap open on purpose, so record it in the report as remaining work and expect a rerun to propose it again.

## 6. Report

Report what you wrote, what was declined, and the findings that remain mine to fix.

## Findings (the genuinely un-writable)

Report these and leave the fix to me:

- `gh` lacks issue or label permissions on the remote.
- No project gate command is discoverable. Report that and never invent one.
- The app does not boot from a fresh worktree. QA drives the shipped interface from the run's worktree, so every run inherits this gap until the project fixes it.
- An index the repo declares for its own agent skills has broken links. Never create such an index or rewrite its shape.

## Leaves alone

Leave CI, the project's own hooks, gate design, technology skills, MCP config, and triage state machines exactly as you found them.

## Idempotency

Read your state from the repository. A doc setup created becomes repo-owned, so a rerun validates it and proposes a diff rather than overwriting it. A rerun on a conforming repo makes zero file and zero GitHub changes, and says so.
