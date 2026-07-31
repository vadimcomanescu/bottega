# bottega

Autonomous issue-to-PR runs, orchestrated from Claude Code with Claude workers and GPT cross-reads of finished work: `/bottega:maestro` takes a task or issue to a reviewed, evidence-backed PR ready to merge, and code-review, improve, panel, prototype, domain-modeling, setup, and bro are also available on their own. Read `README.md` for the model. This file is the map: where each thing lives, and when to read it.

## Map

| Path | What it is | Read it when |
| --- | --- | --- |
| `CONTEXT.md` | The glossary of the run vocabulary: one meaning per term, domain only | Writing any text that names a run concept, or resolving a term dispute |
| `.claude-plugin/` | Plugin and marketplace manifests | Changing install or release metadata |
| `skills/maestro/SKILL.md` | `/bottega:maestro`, the whole run as one prompt in the owner's own words: the release answer and the model check, discovery, the design and its slices, the codex second opinion, autonomous builders with a fresh reviewer each, the integrated review, the QA loop, close; every worker's model is named in the sentence that dispatches it | Anything touches a run's flow, its state, or which model runs where |
| `skills/discover/SKILL.md` | The discovery method a run's Discover phase uses whole: understand the intent by reading the touched code, fan out Opus workers one per question, size the method to the work, then the unknowns moves (the blind spot pass, options and prototypes, the interview keeping glossary and decisions current), ending with everything settled handed to the spec. Not user-invocable | Anything touches how a run understands a request, finds unknowns, sets scope, brainstorms, prototypes, or interviews the user |
| `skills/spec/SKILL.md` | The spec method a run reaches when discovery closes: synthesis only, the seam check, seven sections from problem to out of scope, published on the run's tracker issue; not user-invocable | Anything touches the spec's sections, its seam check, or where it publishes |
| `skills/prototype/` | The vendored prototype skill, synced per `THIRD_PARTY.md`: throwaway code answering one design question, a logic terminal app or radically different UI variants on one route, captured to a throwaway branch with its pointer on the run's issue | Anything touches how prototypes are built, judged, or captured |
| `skills/domain-modeling/` | The domain modeling method and the house ADR bar: challenge terms against the glossary, sharpen language, concrete scenarios, cross-reference the code, update `CONTEXT.md` inline, offer ADRs under the three-condition bar, with the vendored entry formats beside it | Anything touches glossary discipline, ADR conditions, or the entry formats |
| `skills/open/SKILL.md` | The opening method a run's Launch phase uses whole: tracker-owned claim and branch when present, isolated worktree, owner file and release answer, commands from the agent map; not user-invocable | Anything touches how a run starts or claims work |
| `skills/improve/SKILL.md` | `/bottega:improve`, one agreed improvement taken through a run, the scan standing as its discovery | Changing how improvements are found or handed off |
| `skills/setup/SKILL.md` | `/bottega:setup`, rerunnable semantic reconciliation of a machine and repository: it keeps existing maps and owners, fills only actual routes, then proposes GitHub conventions and labels for approval | Changing what setup writes or verifies |
| `skills/implement` | Implementation doctrine every builder receives with its dispatched slice or repair | Changing how builders work a slice or a repair |
| `skills/use-codex` | The mechanics of running one task through the vendored codex companion runtime: the codex agent dispatch, background jobs and their receipts, the orchestrator's status watch, resume and cancel, the brief, the report. The runtime's own files are recorded in `THIRD_PARTY.md` | Anything touches how a codex dispatch is launched, watched, recovered, or read |
| `skills/code-review/` | The review package: `SKILL.md` is the modified vendored engine document and the whole method (the blind panel, blocker or follow-up classification, fix dispatch to a fresh builder, rerun to one converged head), standalone `/bottega:code-review` on a PR, ref range, or working diff, and the run's Review phase using it whole, with the helper `scripts/` and `tests/` beside it (provenance and sync in root `THIRD_PARTY.md`); see README Credits | Anything touches review method, sequencing, engine mechanics, inputs, fix dispatch, PR threads, or merge verification |
| `skills/qa/SKILL.md` | QA method and limits: drive the shipped interface, return PASS/FAIL/NOT VERIFIED per scenario, forbidden actions; the run's QA phase routes here | Anything touches QA driving, evidence, or limits |
| `skills/close/SKILL.md` | The closing method a run's Close phase routes to: confirm the accepted head, file followups, open the PR written for a reader outside the run, labeled hold when the launch said hold, watch its checks, and report it merged, ready, or waiting on what only a person can clear; not user-invocable | Anything touches PR opening, followup filing, the PR body's writing rule, the check watch, or the ready report |
| `skills/panel/SKILL.md` | `/bottega:panel`, independent drafts from different companies' models and a compare-only judge for one costly decision; a run calls it too, and it states the three conditions that make a panel worth its cost | Changing panel seats, judging, or when a panel is worth running |
| `skills/bro/SKILL.md` | `/bottega:bro`, restate the last reply in plain language; user-invoked only | Changing the restatement instruction |
| `skills/architect` | House design doctrine: deep modules, architecture evolution, documentation architecture | Any design, review, or setup doctrine question |
| `skills-internal/write-bottega-skills` | Bottega's own skill-writing doctrine, the house format, and the closing checklist; repo-only, never installed with the plugin | Creating or editing any skill file |
| `agents/` | The vendored codex agent, a thin forwarder to the companion runtime, synced with recorded local scoping per `THIRD_PARTY.md`, with upstream's `LICENSE` and `NOTICE` beside it | Anything touches what a codex dispatch hands the runtime |
| `scripts/` | Single assembly points for external calls: `pr-threads`, whose header states its contract, and the vendored codex companion runtime (`codex-companion.mjs`, `app-server-broker.mjs`, `session-lifecycle-hook.mjs`, `stop-review-gate-hook.mjs`, `lib/`), synced per `THIRD_PARTY.md` | Any GitHub mutation mechanics, or the runtime a codex dispatch runs on |
| `hooks/` | The route guard, plus the registration of the guard and of the vendored session lifecycle hooks (SessionStart, SessionEnd) that set up and tear down the codex runtime; the guard states its own policy | Changing what dispatches are denied, or what runs at session start and end |
| `THIRD_PARTY.md` | Every file copied from outside this repo: upstream, pinned revision, local scoping, how to sync | Reading, syncing, or adding a vendored file |
| `docs/adr/` | Append-only decision records | Understanding why a current rule exists before changing it |
| `docs/lessons/` | Failure records: what happened, the rule, and where the rule is enforced | Shaping new work in discovery or design, and when a run diagnoses a failure worth keeping |
| `tests/` | The verification gate's suites | Any change; the gate pins doctrine and script contracts |

`.agents/skills` links every skill directory; `.claude/skills` links the two a session working in this repo invokes by bare name (`code-review`, `write-bottega-skills`). Every link points at its one copy: `skills/`, which is what the installed plugin serves, or `skills-internal/`, which holds the repo-only doctrine the plugin never ships.

## Changing this repo

- The product is skills prose read by fable and sol, held by tests. Author changes directly with the owner, in a worktree and branch. `/bottega:maestro` remains for changes to what the software does (hooks, scripts, schemas, workflows).
- Verification gate: `npm test` (the vitest suites plus the vendored autoreview Python suites, needs python3 and git on PATH). Never pipe test output inside a `&&` chain: redirect to a file and check the exit code.
- Creating or editing any skill file, load `skills-internal/write-bottega-skills`, evaluate the writing against it, and end by walking its closing checklist. Its house rules govern every file's prose in this repo, not only skills.
- Every merge to `main` is a release, per `docs/adr/0028-the-launch-decides-the-release.md`: the release gate checks the version bump and `npm test`, whoever opens a PR arms auto-merge in the same breath (`gh pr merge --auto --squash`) and watches it to the merge, the README's command table stays in sync with the skills, and the release commit is titled `bottega X.Y.Z: <headline> (#PR)`. To stop a PR landing, leave it a draft or unarmed.
- Documentation duties land in the same diff: a decision meeting `bottega:domain-modeling`'s ADR bar lands its ADR, a diagnosed failure lands its lesson in `docs/lessons/`, and every doc a change makes stale is fixed or deleted. When a decision replaces an old direction, strip the old one completely and stop: git history is the record of what was removed, and no test or doctrine line asserts a removed thing stays absent.
- PR bodies contain review-relevant content only, with no tool, model, or company attribution. Keep `CLAUDE.md` symlinked to this file.

## Review guidelines

Reviewing a change to this repository, read root `REVIEW.md` first. It carries the Bottega-specific review risks.
