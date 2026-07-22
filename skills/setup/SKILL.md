---
name: setup
description: One-time reconciliation of a machine and a repo with bottega, covering the harness CLIs and worker families, skill discovery, the route guard, the dispatch timeout ceiling, then the repo's domain-doc contract, documentation architecture, tracker conventions, and GitHub labels.
disable-model-invocation: true
---

# Setup

Reconcile a machine and a repo with bottega, once. Configure the harness you invoke this from and the worker families it will dispatch, then bring the project to the shape `bottega:codebase-design` defines (the domain docs and documentation architecture); read that skill before the repo work.

## Harness

Configure the harness you invoke setup from, and report anything missing rather than installing it silently.

- **Requirements.** `git`, `node`, and `gh`.
- **Worker families.** Verify the CLI for every other family you will dispatch: `claude` for a Codex-hosted maestro, `codex` for GPT workers under a Claude Code maestro. Confirm each is logged in with its own status command (`codex login status`).
- **Skill discovery.** Both harnesses install the plugin from this repo's marketplace (the README's install commands). Confirm the harness lists the bottega skills; when it does not, walk the user through the install commands rather than symlinking anything.
- **Route guard.** Register the guard for the current harness from `hooks/`.
- **Dispatch timeout ceiling**, Claude Code only. A wrapper subagent runs a codex worker as one foreground shell call, so the shell timeout ceiling must exceed the longest expected run. Read the current variable from the harness's environment-variable documentation (`BASH_MAX_TIMEOUT_MS` at last claim), set it in the settings `env` block to a few hours, leave the default timeout alone so ordinary commands keep their short limit, and verify with one live call whose requested timeout exceeds ten minutes.

## Repo reconciliation

### 1. Discover what the repo already has

Resolve symlinks first, then read; never search by a fixed list of filenames. For each part of the shape, find where it lives today, whatever it is called and wherever it sits:

- The map: the root agent docs, whether one symlinks the other, and any existing `bottega:setup` managed block.
- Domain terms: whatever currently defines the repo's vocabulary, in any file or doc section.
- Decisions: wherever design decisions are recorded today, including prose sections of README-class docs.
- Tracker conventions, the GitHub remote, its labels, and whether `gh` is authenticated with issue and label permissions.
- The project's commands (test, lint, format, typecheck, build, run), whether the canonical map states them, and `.gitignore`.
- Any index the repo declares for its own agent skills.

Complete when every part of the shape has either a located current home or a stated "nowhere".

### 2. Decide, one at a time

Present the findings, then walk only the decisions the repo cannot answer, one per exchange, waiting for each answer:

- **Canonical map**: which of `CLAUDE.md` and `AGENTS.md` is the map. Ask only when both exist as independent files. When one symlinks the other, its target is the map. When neither exists, default to `CLAUDE.md` and present the choice so the user can veto it in one read. The non-map filename only ever exists as a symlink to the map, so both harnesses load the one copy.
- **Tracker location**, only when no remote settles it. A single GitHub remote settles it (GitHub Issues on that remote).
- **Context count**, when the code suggests more than one bounded context.
- **Area labels**, only when the repo has more than one bounded context whose names the tree does not settle. A single-context repo has none.

### 3. Propose the edits

For every gap between the found state and the shape, show the exact edit that closes it. Content moves; nothing is invented: an empty glossary, ADR scaffold, or owner doc is nothing to write.

- **The managed block** in the canonical map, delimited by versioned markers (`<!-- bottega:setup v1 begin -->` and `<!-- bottega:setup v1 end -->`) so a rerun updates only its own block. It routes to each fact's home and never restates it, and records the symlink when the non-map file links the map.
- **A commands section** in the canonical map when the map does not already state them: the project's test, lint, format, typecheck, build, and run commands. Verify each by running it once before it is written. The run command is verified from a disposable worktree: start it, watch for readiness, stop it. The map is the commands' one home; runs read them from it and fix them there when one breaks.
- **The map symlink** when only one of `CLAUDE.md` and `AGENTS.md` exists: create the other as a symlink to it.
- **Migrations**: discovered term definitions move into the relevant `CONTEXT.md`; discovered decision records that meet the ADR bar move into `docs/adr/`; two files claiming the same authority merge into one home; every reference updates in the same change. Formats follow `bottega:codebase-design` and its references. When a source and its target both hold material, put the merge to the user before writing.
- **A critical-journeys doc** when the repo ships a user-facing surface and no doc names its journeys: draft the inventory from the code, one journey per user-visible capability, for the owner to correct before it lands, and route to it from the managed block. Runs read it at spec and QA, and a slice that changes a journey owns updating it.
- **Owner docs** for tracker conventions, always reusing an existing equivalent home instead of creating a second one.
- **A `.bottega/` entry in `.gitignore`** when missing.
- **The approved `area:*` labels**, each created with `gh` as get-or-create and read back. Labels organize the backlog for people; the method never reads them. Never rename or delete an existing label.

### 4. Apply

Apply only what was approved, exactly as shown. Complete when every proposed edit is applied or explicitly declined. A declined edit leaves its gap open on purpose: record it in the done report as remaining work, and expect a rerun to propose it again.

## Findings (the genuinely un-writable)

Report these; do not fix them here:

- `gh` lacks issue or label permissions on the remote.
- No project gate command is discoverable. A missing gate is a finding, never an invitation to invent one.
- The app does not boot from a fresh worktree. QA drives the shipped interface from the run's worktree, so every run inherits this gap until the project fixes it.
- An index the repo declares for its own agent skills has broken links. Never create such an index or rewrite its shape.

## Leaves alone

CI, the project's own hooks, gate design, technology skills, MCP config, and triage state machines.

## Idempotency

Setup reads its state from the repository. A doc setup created becomes repo-owned: a rerun validates it and proposes a diff rather than overwriting it. A rerun on a conforming repo makes zero file and zero GitHub changes, and says so.

## Done report

What was written, what was declined, and the findings that remain the user's to fix.
