---
name: setup
description: One-time per-repo reconciliation of a host repo with bottega's methodology: the domain-doc contract, documentation architecture, tracker conventions, and GitHub labels.
disable-model-invocation: true
---

# Setup

You bring one host repo to the shape `bottega:codebase-design` defines, once: a map that routes (`CLAUDE.md` or `AGENTS.md`), per-context `CONTEXT.md` glossaries, `docs/adr/` for qualifying decisions, and tracker conventions. Read that doctrine first; it owns the shape, this skill owns the reconciliation. Prompt-driven, not a script: discover what the repo has, propose the exact edits that close the gap, apply what the user approves.

## Method

### 1. Discover what the repo already has

Resolve symlinks first, then read; never assume, and never search by a fixed list of filenames. For each part of the shape, find where it lives today, whatever it is called and wherever it sits:

- The map: the root agent docs, whether one symlinks the other, and any existing `bottega:setup` managed block.
- Domain terms: whatever currently defines the repo's vocabulary, in any file or doc section.
- Decisions: wherever design decisions are recorded today, including prose sections of README-class docs.
- Tracker conventions, the GitHub remote, its labels, and whether `gh` is authenticated with issue and label permissions.
- The host gate command (test, lint, typecheck, build) and `.gitignore`.
- Any skill-farm contract the repo declares.

Complete when every part of the shape has either a located current home or a stated "nowhere".

### 2. Decide, one at a time

Present the findings, then walk only the decisions the repo cannot answer, one per exchange, waiting for each answer:

- **Canonical map**: which of `CLAUDE.md` and `AGENTS.md` is the map. Ask only when both exist as independent files. When one symlinks the other, its target is the map. When neither exists, default to `CLAUDE.md`, flag it for a one-read veto, and never create the competing file.
- **Tracker location**, only when no remote settles it. A single GitHub remote settles it (GitHub Issues on that remote).
- **Area labels**, only when the repo has more than one bounded context whose names the tree does not settle. A single-context repo has none.
- **Context count**, when the code suggests more than one bounded context.

### 3. Propose the edits

For every gap between the found state and the shape, show the exact edit that closes it. Content moves; nothing is invented: a term or decision you did not find is not written, and an empty glossary, a decision-free ADR scaffold, or an owner doc with nothing concrete to say is nothing to write.

- **The managed block** in the canonical map, delimited by versioned markers (`<!-- bottega:setup v1 begin -->` and `<!-- bottega:setup v1 end -->`) so a rerun updates only its own block. It routes to each fact's home and never restates it, and it records that the non-map file symlinks the map.
- **Migrations**: discovered term definitions move into the relevant `CONTEXT.md`; discovered decision records that meet the ADR bar move into `docs/adr/`; two files claiming the same authority merge into one home; every reference updates in the same change. Formats follow `bottega:codebase-design` and its references. When a source and its target both hold material, put the merge to the user before writing.
- **Owner docs** for tracker conventions, always reusing an existing equivalent home instead of creating a second one.
- **A `.bottega/` entry in `.gitignore`** when missing.
- **The `agent:working` label** through `scripts/issue-claim ensure-label`, and the approved `area:*` labels, each get-or-create with read-back; never rename or delete an existing label.

### 4. Apply

Apply only what was approved, exactly as shown. Complete when every proposed edit is applied or explicitly declined, and a rerun on the resulting repo would propose zero edits.

## Findings (the genuinely un-writable)

Report these; do not fix them here:

- `gh` lacks issue or label permissions on the remote.
- No host gate command is discoverable. A missing gate is a finding, never an invitation to invent one.
- A declared skill-farm contract has broken links. Never create or normalize a farm.

## Leaves alone

CI, hooks, gate design, technology skills, MCP config, and triage state machines.

## Idempotency

Setup reads its state from the repository; there is no installed flag. A doc setup created becomes repo-owned: a rerun validates it and proposes a diff rather than overwriting it. A rerun on a conforming repo makes zero file and zero GitHub changes, and says so.

## Done report

What was written, what was declined, and the findings that remain the user's to fix.
