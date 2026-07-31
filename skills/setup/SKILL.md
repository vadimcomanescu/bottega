---
name: setup
description: Reconcile a machine and repository with bottega by finding its existing maps and owners, filling only actual gaps, and proposing GitHub conventions and labels for approval.
disable-model-invocation: true
---

# Setup

Reconcile a machine and repository with bottega, keeping the repository's own documentation architecture and filling only actual gaps. A conforming repository receives no file or GitHub changes.

## 1. Configure the harness

Report anything missing rather than installing it silently.

- Requirements: `git`, `node`, `gh`, and `trufflehog` (the review engine's secret preflight needs the binary and never installs it).
- The codex CLI installed and logged in (`codex login status`). The run's GPT cross-reads go through it.
- The route guard from `hooks/` registered.
- The dispatch timeout ceiling: the orchestrator watches a codex job with one tracked background shell call that waits for the whole run. Read the ceiling variable from the harness's environment-variable documentation (`BASH_MAX_TIMEOUT_MS` at last claim), set it to a few hours in the settings `env` block, leave the default timeout alone, and verify with one live call requesting more than ten minutes.

## 2. Find the existing owners

Resolve symlinks, then find the repository's equivalent owners by what they govern, not by a prescribed path. An existing map route or owner doc wins wherever it lives. Finish with a named owner or nowhere for each:

- The canonical agent map: root `AGENTS.md` and `CLAUDE.md`, their symlink state, any existing bottega:setup block, and the map's routes.
- The issue tracker: the GitHub remote, issue and label permissions, conventions, and labels.
- The domain owner: the doc a consumer reads for vocabulary, contexts, and decisions, and wherever ADRs live.
- The project's commands (test, lint, format, typecheck, build, run) and `.gitignore`.
- The end-to-end suite where the repository ships a user-facing surface: the flows it drives and how its runner names a subset.
- The default branch's merge governance: rulesets or protection, auto-merge, and automation that merges.
- Any index the repository declares for its own agent skills.

## 3. Settle only missing choices

Present the findings, then ask one question at a time only where the repository cannot settle it, each led by a recommended answer I can accept in a word:

- Canonical map, when both root files are independent. A symlink's target is the map. When neither exists, default to `CLAUDE.md` and let me veto it.
- Tracker location, when no GitHub remote settles it.
- Context count and area labels, when the code suggests multiple bounded contexts the tree does not name. A single-context repository needs no area labels.
- The branch claim, when the repository says multiple agents take tracker work and no concurrency-safe claim exists. Preserve an existing force-push rule, and put a conflict between the two to me.

## 4. Propose the exact edits

Show every change for approval. Reuse what exists and invent nothing: no empty glossary, no ADR scaffold, no marker or heading added merely to identify setup.

- The managed block, between `<!-- bottega:setup begin -->` and `<!-- bottega:setup end -->` in the canonical map, only when a missing route needs setup-owned text. It routes to the tracker and domain owners without restating them and records the non-map symlink. An existing bottega:setup block, whatever its markers, is the same setup-owned text: fold its routes into the map or replace it with the one current block, never leave two. When no equivalent owner exists, `docs/agents/issue-tracker.md` and `docs/agents/domain.md` are the fallback owners: the tracker owner records the remote, the concrete read, assign, comment, and close operations, any approved claim, and a pointer to the landing procedure without copying it, and the domain owner tells consumers where vocabulary, contexts, and ADRs live.
- Migrations, formats per `bottega:domain-modeling`: real domain terms move to the vocabulary home and qualifying decisions to the ADR home, every reference updated in the same change. Existing formats win. When source and target both hold material, bring the merge to me before writing.
- Commands, in the canonical map only when no equivalent owner states them. Verify each by running it once, the run command from a disposable worktree: start it, wait for readiness, stop it.
- The map symlink, when only one root map exists. When both hold material, bring the merge to me.
- End-to-end coverage: a product flow with no named executable check gets its spec drafted in the suite's own conventions for my approval, and where the suite cannot run, one issue naming the uncovered flows.
- The branch claim, where step 3 approved one, documented in the tracker owner exactly as:

  ```bash
  git push -u origin <branch> --force-with-lease=refs/heads/<branch>:
  ```

  The empty expected value requires the ref not to exist, so exactly one creation wins and a rejected push means another agent owns the branch. Assignment is the human-visible signal, not the lock. The claim releases when the branch is deleted on merge.
- Merge governance: reuse the repository's documented procedure, and where it has none, form an exact proposal from the [merge-governance reference](references/merge-governance.md).
- `.bottega/` in `.gitignore` when missing, and the approved `area:*` labels plus `hold`, each get-or-create with `gh` and read back. Existing labels stay as they are.

## 5. Apply and report

Apply only what I approved, exactly as shown, until every proposed edit is applied or declined. A declined edit remains a reported gap for the next reconciliation. Report what changed, what I declined, and what only I can fix: missing issue or label permissions, no discoverable project gate, an app that cannot boot from a fresh worktree, or broken links in a repository-declared agent-skill index. A rerun reads state from the repository: a setup-owned route becomes repository-owned once written, so validate it and propose a diff rather than overwriting it.
