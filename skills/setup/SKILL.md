---
name: setup
description: Configure this repo — check its beads tracker, triage label vocabulary, and domain doc layout. Run once per repository.
disable-model-invocation: true
---

# Setup

Scaffold the per-repo configuration that the skills that read and write this repo's tracker and domain docs assume:

- **The tracker** — beads (`bd`), always. Setup checks it works here and writes the repo's tracker doc if it has none
- **Triage labels** — the strings used for the five canonical triage roles, created on the remote
- **Domain docs** — where `CONTEXT.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `command -v bd` and `.beads/` at the repo root — is the tracker installed and initialised here? `bd status` if both are there
- `bd hooks list` — are bd's own git hooks installed here?
- `git remote -v` and `.git/config` — is this a GitHub repo? Which one? (PRs and the merge land there; the work graph does not)
- `AGENTS.md` and `CLAUDE.md` at the repo root — does either exist? Is there already an `## Agent skills` section in either?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `docs/adr/` and any `src/*/docs/adr/` directories
- `docs/agents/` — does this skill's prior output already exist?
- Is the `triage` skill installed? (a skill folder alongside this one, or that name in your available skills.) It is the only skill that applies these labels, so this decides whether Section B runs at all.
- Monorepo signals — a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. Present only in a genuinely large multi-package repo; their absence means single-context, which is almost every repo.

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order — one section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when the choice genuinely branches; skip the section entirely when exploration already settled it (Section B when `triage` isn't installed, Section C when there's no monorepo).

**Section A — The tracker.** Nothing to ask: the tracker is beads (`bd`). Every skill that reads or writes work reads and writes the bead graph, and GitHub carries delivery only — PRs, the merge, and the branch that claims a bead.

Report what exploration found and act on it:

- `bd` on PATH and a `.beads/` here — say so and move on.
- `bd` on PATH, no `.beads/` — tell the user this repo has no bead database yet and that `bd init` creates one, then let them run it or say go. Don't init a repo behind the user's back.
- No `bd` — stop this section, tell the user bd must be installed first, and say the rest of setup still runs.

Then verify bd's own git hooks are installed, since the graph syncs through them. `bd init` installs and manages them, and setup writes no hook body of its own. Report what `bd hooks list` says and act on it:

- Every hook installed — say so and move on.
- Any hook missing — tell the user `bd hooks install` puts it back, then run it on their go.

The bead prefix, where CI files its alarms, and any label convention are facts of this repo, not of bottega: they live in `docs/agents/issue-tracker.md`, which the repo's agent map routes to.

**Section B — Triage label vocabulary.** Skip this section entirely if the `triage` skill isn't installed (exploration told you) — nothing else applies a triage label, and an uninstalled skill needs no vocabulary.

If it is installed, ask exactly one question:

> Do you want to keep the default triage labels? (recommended: **yes**)

The defaults are the five canonical roles, each label string equal to its name: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. On **yes**, write them as-is. Only if the user says no — usually because their tracker already uses other names (e.g. `bug:triage` for `needs-triage`) — collect the overrides so `triage` applies existing labels instead of creating duplicates.

**Section C — Domain docs.** Default to **single-context** — one `CONTEXT.md` + `docs/adr/` at the repo root. This fits almost every repo; write it without asking.

Offer **multi-context** — a root `CONTEXT-MAP.md` pointing to per-context `CONTEXT.md` files — only when exploration found monorepo signals. Then confirm which layout they want.

There is no section for the branch claim. Claiming a bead is the create-only push of `issue/<bead-id>` on origin, and it is not configurable — the tracker doc's "Claiming a bead" section ships as-is.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited (see step 4 for selection rules)
- The contents of `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, and `docs/agents/triage-labels.md` (the last only when `triage` is installed)

Let them edit before writing.

### 4. Write

**Pick the file to edit:**

- If `CLAUDE.md` exists, edit it.
- Else if `AGENTS.md` exists, edit it.
- If neither exists, ask the user which one to create — don't pick for them.

Never create `AGENTS.md` when `CLAUDE.md` already exists (or vice versa) — always edit the one that's already there.

If an `## Agent skills` block already exists in the chosen file, update its contents in-place rather than appending a duplicate. Don't overwrite user edits to the surrounding sections.

The block:

```markdown
## Agent skills

### Issue tracker

Work is tracked in beads (`bd`); GitHub carries the PR and the merge. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout — "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

Include the `### Triage labels` sub-block, and write `docs/agents/triage-labels.md`, only when Section B ran. When it didn't, both are omitted.

Then write the docs files using the seed templates in this skill folder as a starting point:

- [issue-tracker-beads.md](./issue-tracker-beads.md) — the bd command set, the claim, the close, and sync (only when the repo has no tracker doc of its own; a repo that already documents its bead conventions keeps its own, and this skill points at it instead of restating it)
- [triage-labels.md](./triage-labels.md) — label mapping (only if Section B ran)
- [domain.md](./domain.md) — domain doc consumer rules + layout

Then, when Section B ran, create every label named in `docs/agents/triage-labels.md`, get-or-create, and read the list back to confirm. Existing labels stay exactly as they are.

```bash
gh label list --json name --jq '.[].name'
gh label create <label> --description "<meaning>" || true
```

### 5. Done

Tell the user the setup is complete and which skills will now read from these files. Mention they can edit `docs/agents/*.md` directly later — re-running this skill is only necessary to restart from scratch.
