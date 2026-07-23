# The harness-engineering corpus, read against bottega

Snapshot: 2026-07-22. Source: [lopopolo/harness-engineering](https://github.com/lopopolo/harness-engineering) at commit [`226c8d3`](https://github.com/lopopolo/harness-engineering/tree/226c8d35fb6ea3ed55467753dba6dea2b5fd5778) (2026-07-18), read in full: twelve thesis pages, two playbooks, the evaluation method, and the case files. Repository-authored material there is licensed CC BY 4.0; the attribution it asks for is Ryan Lopopolo, _Harness Engineering_, CC BY 4.0.

This note separates three things: what the corpus argues, what bottega already does, and what a session proposed changing. When it was written nothing in it was agreed; the proposals were findings from one reading, kept so a later session inherits the reasoning instead of repeating it. The note was recorded in PR #98, which closed unmerged; it is restored here on 2026-07-23 as the dated snapshot it is, with the landing status below. The adoption decision is `docs/adr/0012-harness-engineering-adoption.md`.

## Landing status, 2026-07-23

Of the six proposals below: 1 (a rule migrates its population) landed in 0.86.0 and its rule now lives in maestro's QA phase; 4 (requalify on a model-generation move) landed in 0.84.0 in AGENTS.md; 6 (worker friction as corroborated telemetry) landed in 0.86.0 in the builder report; the severity gate PR #106 shipped beside them came from the same study's evidence. 3 (machine-check the routes) and 5 (state what the evidence did not establish) never landed and remain open. The named-not-built items stay unbuilt, and the three rejections stand.

## What the corpus argues

Harness engineering holds a chosen model and coding agent constant as a black box for one adoption epoch, then improves the two external levers around it, context and tools, plus the environment that curates both. Its stated purpose is to get an organization's nonfunctional requirements, the quality bar and constraints that decide whether an outcome belongs in the system, into a form the worker can retrieve. General model weights hold the visible tip of an organization's knowledge; the private, changing process data below it (current state, local ontology, quality bar, exception history, authority relationships) is what a situated job actually needs.

The arguments that matter most for a delivery method like bottega's:

- **Give one agent the whole job.** One primary trajectory owns decomposition, execution, integration, proof, and lifecycle closure. A separate context window earns its cost when it buys independent evidence, chiefly parallel discovery and adversarial review. Delivery is active work, not a handoff: the owner opens the pull request, waits for checks, fixes what it caused, and enters the protected merge path. An instruction to "merge" means completing that path, never an administrative bypass.
- **Route context just in time.** Keep a large navigable store and a small active working set. A root guide is a map, not a manual. Detailed policy placed in the durable instruction channel competes for attention across the whole job; narrow rules are better surfaced by repository reads, tool output, and failing checks at the decision point.
- **Make the repository teach the agent.** Code an agent reads becomes prompt material for the next trajectory. Consistency compresses context; half-finished migrations leave two competing answers, and a weak pattern left in the tree keeps teaching after its immediate defect is fixed.
- **Prove the outcome in the real environment.** Match evidence to the claim: a green check proves only its own assertion. Browser journeys, corpora, canaries, and deployed health close different loops. A proof packet states its limits, including what the evidence did not establish.
- **Turn feedback into infrastructure.** A correction to one named line leaves every sibling defect intact unless someone recovers the governing class and searches for the rest of it. Stable lessons move to the earliest durable owner, and a new rule migrates the existing population rather than only guarding future work.
- **Maximize autonomy inside explicit authority.** Capability and authority are separate contracts: broad autonomy where effects are reversible, narrow revocable grants at consequential boundaries.
- **Measure effectiveness at the outcome boundary.** Tokens, lines, agents, and checks are inputs. Keep human attention, wall-clock, rework, risk, lifetime cost, and compute visible as separate dimensions rather than one blended score.

## What bottega already implements

Each claim below names the part of the method that carries it, as of this release.

- One agent owning the whole job is the run: [`skills/maestro`](../../skills/maestro/SKILL.md) keeps design, routing, and arbitration in the orchestrator's own turns and carries the work from request to a delivered pull request.
- Delivery as active work is [`skills/close`](../../skills/close/SKILL.md), which watches checks to green and mergeability and routes diff-caused failures back through build and review rather than bypassing them.
- Independent evidence as the reason for a second context window is the cross-family integrated review in [`skills/code-review`](../../skills/code-review/references/autoreview.md) (then `skills/autoreview`, consolidated in 0.82.0) and the independent drafts in [`skills/panel`](../../skills/panel/SKILL.md).
- Claim-matched proof is [`skills/qa`](../../skills/qa/SKILL.md): the verdict comes from driving the interface a user actually uses, never from code inspection or a staged screenshot.
- Reviewer convergence, which the corpus reaches through reviewers biased toward merge, is carried by the plan reviewer's calibration in [`skills/plan`](../../skills/plan/SKILL.md) (an invented blocker is as much a failure as a missed one) and by the review gate's own convergence rules.
- The map-not-manual shape is [`AGENTS.md`](../../AGENTS.md), whose table routes to each fact's home and restates none of them, with per-phase skills loaded when their phase arrives.
- Repository-as-prompt-material is the doctrine in [`skills/codebase-design`](../../skills/codebase-design/SKILL.md): one authoritative home per fact, and the standard solution as the default over a bespoke mechanism.
- Improving the instructions rather than the output, which the corpus calls observing and rerolling, is maestro's build rule: when a worker's output is bad, fix the instructions that produced it and rerun, never hand-patch the diff.
- Separating capability from authority appears as the route guard in `hooks/`, the worker-reach check in [`skills/open`](../../skills/open/SKILL.md), and the rule that a step touching real users, money, deploys, or production data stops and reports.

## Proposed, not agreed

Six proposals, strongest first. Each names where it would land. None is a decision this repository has taken, and none is implemented.

**1. A fix covers its class, not just its instance.** The corpus records an agent given a concrete correction fixing only the named function while every sibling defect survived; its rule is that a correction carries an implicit principle and the repair must search for the rest of the class. Bottega dispatches a fix per accepted review finding and reruns, with nothing directing a sweep for other instances of the same defect in the integrated diff. Would land as one sentence in maestro's review phase: an accepted blocking finding's fix brief includes searching the diff for other instances of the same class, and the fix covers what the search finds.

**2. A new rule migrates the population it governs.** The corpus pairs every durable principle with a backward path, because a violating pattern left in the tree keeps teaching later trajectories after the rule lands; its worked case enables a lint, repairs roughly 600 existing violations, and adds coverage in one change. Bottega's QA phase files the lesson and adds the review-doctrine rule, then stops. Would land as an addition to that phase: the run scans for existing violations, fixes the in-scope ones, and files one issue for the rest. A companion line in [`skills/improve`](../../skills/improve/SKILL.md) would add half-finished migrations and two live patterns for one concept to the friction list it scans for.

**3. Machine-check the routes between skills.** The corpus treats context routes as carrying cost and asks for machine-checkable cross-links, since a dead route fails silently at the moment a worker needs it. Bottega asks reviewers to verify cross-references in `REVIEW.md`, while its own doctrine says deterministic checks belong in tooling rather than review rules. Would land as one test resolving every relative markdown link under `skills/` and `docs/`.

**4. Requalify worker doctrine when the model table changes.** The corpus holds the worker constant for an epoch and requalifies on every upgrade, including subtraction: scaffolding that helped one worker becomes dead weight for the next. Bottega has the static form of this test in `AGENTS.md` (could the worker derive it, and would the plain model do better without the instruction) but no trigger that fires when the worker changes. Would land as one line in [`skills/routing`](../../skills/routing/SKILL.md) or `AGENTS.md`: a change to the model table re-runs that test over the worker rules written to fence the replaced model's observed failures.

**5. State what the evidence did not establish.** The corpus's proof packet includes known limits and unproved behavior, and its security case draws its credibility from bounding the claim rather than widening it. Bottega's pull request body carries QA evidence with no required element for its limits. Would land as one item in close's body list: the scenarios returned NOT VERIFIED, and any claimed behavior no evidence covers.

**6. Treat worker friction as telemetry, corroborated before it persists.** The corpus asks the worker to record what it had to discover and what it wished it had, treats those reports as leads for the harness builder rather than facts, corroborates them against the trajectory, and keeps raw reports out of later runs, because an incorrect learning otherwise reinforces itself as an instruction. Bottega has the narrow case already: a command discovered broken is written back to the agent map. Would land as one line in the builder report contract in [`skills/implementing`](../../skills/implementing/SKILL.md), naming what the map, plan, or spec should have told it, with the orchestrator promoting only corroborated, recurring reports.

## Named, not built

**Continuous maintenance loops.** The corpus's contract for recurring work is well developed: a checked-in runbook owning intent, candidate selection, proof, authority, durable state, and a retirement condition, with quiet no-op runs treated as healthy. Bottega has no recurring-work surface, and the scheduling primitives exist in both harnesses. This is a new capability rather than a doctrine edit, and it is worth building only when a real recurring job appears; the design is recorded here so that run does not start from nothing.

**A per-run cost record.** The corpus keeps attention, wall-clock, rework, and compute as separate dimensions against each accepted outcome. Bottega's routing changes have twice required reconstructing spend after the fact. A compact per-run record of rounds and spend per phase would give the next routing decision its evidence. It is machinery, and it was left to the owner.

## Considered and rejected

**A context-curator sidecar and goal-scoped context repositories.** The corpus proposes a second worker maintaining a published projection of organizational context for a parent worker, with separate identities, a staging channel, and a publication policy. Rejected: it solves an enterprise problem of many source systems with different owners and retention rules, which this repository does not have. The run branch already carries the projection a run needs, and the machinery would cost more than the routing it replaces.

**The comparative evaluation apparatus.** The corpus's evaluation method asks for matched conditions, randomized run order, repeated trials, condition-blind grading, and ablation before an intervention is retained. Rejected as a standing requirement: it is more rigor than a method repository can amortize per change, and the honest-verdict burden it targets is already carried by the plan reviewer's calibration and the review gate's convergence rules. Its ablation question, whether an instruction still earns its attention, is worth keeping as a habit rather than a procedure.

**The corpus's naming conventions.** Its twelve named theses and coined labels are a retrieval aid for an anthology. Rejected for this repository, whose register rules exist precisely to keep invented vocabulary out of doctrine. Adopt the mechanics above; leave the vocabulary at the source.
