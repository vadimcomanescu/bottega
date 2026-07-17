---
name: setup
description: One-time per-repo reconciliation of a host repo with bottega's methodology: the domain-doc contract, documentation architecture, tracker conventions, and GitHub labels.
disable-model-invocation: true
---

# Setup

You reconcile one host repo with bottega's methodology, once. This is prompt-driven, not a script: explore what the repo already has, present the findings, walk the decisions one at a time, show the exact edits, and apply only what the user approves.

## What setup installs

Setup makes the host repo conform to the domain-doc contract and documentation architecture that [`bottega:codebase-design`](../codebase-design/SKILL.md) defines: the per-context `CONTEXT.md` glossaries, a root `CONTEXT-MAP.md` for a multi-context repo, `docs/adr/` for the decisions that qualify, and the map-and-homes rule that `CLAUDE.md` and `AGENTS.md` route to each fact's one home and never restate it. Read that doctrine; setup reconciles a repo to it rather than restating it. An empty glossary, a decision-free ADR scaffold, and an owner doc with nothing concrete to say are all nothing to write, so setup creates none of them. On a repo that has none of these yet, setup writes only the map plus the docs that carry real content.

## Method

### 1. Explore

Resolve symlinks first, then read what exists; never assume:

- The root maps `CLAUDE.md` and `AGENTS.md`, whether one symlinks the other, and whether either already carries a `bottega:setup` managed block.
- `CONTEXT.md`, `CONTEXT-MAP.md`, and every per-context `CONTEXT.md`.
- `docs/adr/` and any per-context ADR directory.
- Any legacy `CONCEPTS.md`.
- Existing tracker and agent docs (for example `docs/internal/issue-tracker.md`, `docs/agents/*.md`), so a reusable home is known before a new one is proposed.
- The GitHub remote, its labels, and whether `gh` is authenticated with issue and label permissions.
- The host gate command (test, lint, typecheck, build).
- `.gitignore`.
- Any skill-farm contract the repo declares.

### 2. Decide, one at a time

Present the findings, then walk the decisions the repo cannot answer for you, one per exchange, waiting for each answer before the next. Ask only what cannot be derived:

- **Canonical map**: which of `CLAUDE.md` and `AGENTS.md` is the map. Ask only when both exist as independent files (neither symlinks the other). When one symlinks the other, its target is the map. When neither exists, default to `CLAUDE.md` (the Claude Code convention), flag it for a one-read veto, and create only that file. Never create the competing file.
- **Tracker location**, only when there is no git remote or the remote does not settle it: where issues live. A single GitHub remote settles it (GitHub Issues on that remote). The `open` to `agent:working` to `closed` state vocabulary is fixed by the `agent:working` label setup writes, so it is doctrine, never a question.
- **Area labels**, only when the repo has more than one bounded context whose names the tree does not settle: which `area:*` labels to create. A single-context repo has none; derive the set from the context decomposition and confirm only the names you could not.
- **Single vs multi context**: confirm the count when the code suggests more than one bounded context.

### 3. Show, then apply

Show the exact file edits and the exact GitHub label mutations, wait for approval, and apply only what was approved.

## Writes (only after approval)

- **One managed block in the canonical map**, delimited by versioned markers (`<!-- bottega:setup v1 begin -->` and `<!-- bottega:setup v1 end -->`) so a rerun or a later version updates only its own block in place. The block routes to the owner docs and never restates them, and it records that the non-map file (`AGENTS.md` when `CLAUDE.md` is the map) symlinks the map rather than duplicating it.
- **Owner docs** for the domain layout and the tracker conventions. Default them to `docs/agents/*.md`, but always reuse an existing equivalent home (for example `docs/internal/issue-tracker.md`) instead of creating a second one. The managed block is the authority-routing surface; write a separate documentation-authority doc only when there is a real ownership decision the map cannot express.
- **A `.bottega/` entry in `.gitignore`** when it is missing.
- **The `agent:working` label** through `scripts/issue-claim ensure-label`, the one place that call is assembled: it gets or creates the label and reads it back.
- **The approved `area:*` labels**, each through get-or-create with read-back: create only what is absent, confirm each exists afterward, and never rename or delete an existing label.
- **The legacy `CONCEPTS.md` migration**: move its content into the relevant `CONTEXT.md` atomically and update every reference in the same change. When both `CONCEPTS.md` and the target `CONTEXT.md` hold material, stop and put the merge to the user before writing. The migrated entries follow the format rule in [`bottega:codebase-design`](../codebase-design/SKILL.md): the existing target's format wins, a new file follows its vendored format references.

## Verifies (findings, never mutations)

Report each as a finding; do not fix it here.

- `gh` is authenticated with issue and label permissions on the GitHub remote.
- Exactly one authoritative map exists.
- No two files claim glossary authority.
- Every `CONTEXT-MAP.md` destination exists, and each glossary is mapped exactly once.
- No living doc cites an archived doc.
- A host gate command is discoverable. A missing gate is a finding, never an invitation to invent one.
- When the repo declares a skill-farm contract, broken links in it are findings. Never create or normalize a farm.

## Leaves alone

CI, hooks, gate design, technology skills, MCP config, triage state machines, and empty glossary or ADR scaffolds. Setup does not touch them.

## Idempotency

Setup reads its state from the repository; there is no installed flag. An owner doc setup created becomes repo-owned, so a rerun validates it and proposes a diff rather than overwriting it. A rerun on a conforming repo makes zero file and zero GitHub changes, and says so.

## Done report

Report what was written, what was verified green, and the findings that remain the user's to fix.
