---
name: setup
description: One-time per-repo reconciliation of a project with bottega's methodology, covering the domain-doc contract, documentation architecture, tracker conventions, and GitHub labels.
disable-model-invocation: true
---

# Setup

Read `bottega:codebase-design` first: it defines the shape this skill brings the project to, once (the domain docs and the documentation architecture).

## Method

### 1. Discover what the repo already has

Resolve symlinks first, then read; never search by a fixed list of filenames. For each part of the shape, find where it lives today, whatever it is called and wherever it sits:

- The map: the root agent docs, whether one symlinks the other, and any existing `bottega:setup` managed block.
- Domain terms: whatever currently defines the repo's vocabulary, in any file or doc section.
- Decisions: wherever design decisions are recorded today, including prose sections of README-class docs.
- Tracker conventions, the GitHub remote, its labels, and whether `gh` is authenticated with issue and label permissions.
- The project's gate command (test, lint, typecheck, build) and `.gitignore`.
- Any index the repo declares for its own agent skills.

Complete when every part of the shape has either a located current home or a stated "nowhere".

### 2. Decide, one at a time

Present the findings, then walk only the decisions the repo cannot answer, one per exchange, waiting for each answer:

- **Canonical map**: which of `CLAUDE.md` and `AGENTS.md` is the map. Ask only when both exist as independent files. When one symlinks the other, its target is the map. When neither exists, default to `CLAUDE.md`, present the choice so the user can veto it in one read, and never create the competing file.
- **Tracker location**, only when no remote settles it. A single GitHub remote settles it (GitHub Issues on that remote).
- **Context count**, when the code suggests more than one bounded context.
- **Area labels**, only when the repo has more than one bounded context whose names the tree does not settle. A single-context repo has none.

### 3. Propose the edits

For every gap between the found state and the shape, show the exact edit that closes it. Content moves; nothing is invented: an empty glossary, ADR scaffold, or owner doc is nothing to write.

- **The managed block** in the canonical map, delimited by versioned markers (`<!-- bottega:setup v1 begin -->` and `<!-- bottega:setup v1 end -->`) so a rerun updates only its own block. It routes to each fact's home and never restates it, and records the symlink when the non-map file links the map.
- **Migrations**: discovered term definitions move into the relevant `CONTEXT.md`; discovered decision records that meet the ADR bar move into `docs/adr/`; two files claiming the same authority merge into one home; every reference updates in the same change. Formats follow `bottega:codebase-design` and its references. When a source and its target both hold material, put the merge to the user before writing.
- **Owner docs** for tracker conventions, always reusing an existing equivalent home instead of creating a second one.
- **A `.bottega/` entry in `.gitignore`** when missing.
- **The `agent:working` label** through `scripts/issue-claim ensure-label`, the one place that call is assembled. The approved `area:*` labels are outside that script's contract: create each with `gh` as get-or-create and read it back. Never rename or delete an existing label.

### 4. Apply

Apply only what was approved, exactly as shown. Complete when every proposed edit is applied or explicitly declined. A declined edit leaves its gap open on purpose: record it in the done report as remaining work, and expect a rerun to propose it again.

## Findings (the genuinely un-writable)

Report these; do not fix them here:

- `gh` lacks issue or label permissions on the remote.
- No project gate command is discoverable. A missing gate is a finding, never an invitation to invent one.
- An index the repo declares for its own agent skills has broken links. Never create such an index or rewrite its shape.

## Leaves alone

CI, hooks, gate design, technology skills, MCP config, and triage state machines.

## Idempotency

Setup reads its state from the repository. A doc setup created becomes repo-owned: a rerun validates it and proposes a diff rather than overwriting it. A rerun on a conforming repo makes zero file and zero GitHub changes, and says so.

## Done report

What was written, what was declined, and the findings that remain the user's to fix.
