# bottega

Bottega is a Claude Code plugin that takes a piece of work from a request to a pull request that is designed, built, reviewed, and verified, without a person driving each step.

`/bottega:maestro` runs the whole thing: it settles the unknowns with you, owns the design, builds through worker agents, has the integrated result reviewed and repaired, drives QA over every product surface the work touched, and opens the PR. Eight other commands run one piece of that on its own.

## Install

```text
/plugin marketplace add vadimcomanescu/bottega
/plugin install bottega@bottega
```

Then start a run with `/bottega:maestro <task, or issue URL>`.

A run needs `git`, `node`, and the [GitHub CLI](https://cli.github.com/) on PATH, plus `trufflehog`, which the review's secret scan requires and never installs itself. It needs the codex CLI logged in for the reads that go to a GPT model. Without that CLI, fresh Claude workers take those reads and the PR says so. A run reports anything else missing at the moment it reaches for it. A run also checks at launch that the session is on the orchestrator model the maestro skill names, and tells you when it is not. Nothing else is assumed about the project.

## Commands

| Command | What it does |
| --- | --- |
| `/bottega:maestro <task, or issue URL>` | Take a task, bug, or issue to a reviewed, evidence-backed PR ready to merge |
| `/bottega:improve [area or direction]` | Scan the codebase for deepening opportunities, verify the strongest one, then take it through a run |
| `/bottega:discover <request or issue>` | Understand what the request means in the repository, then find its unknowns and settle them with you |
| `/bottega:spec` | Turn the settled conversation into a spec and publish it on the run's tracker issue |
| `/bottega:autoreview <PR, ref range, or worktree>` | Review a diff through the vendored review engine and fix what it finds, looping to a converged head |
| `/bottega:panel <the decision>` | Put one costly decision to blinded independent drafts from different companies' models, with a judge that only compares them |
| `/bottega:prototype <the question>` | Build a throwaway prototype that answers one design question, in a terminal app or as UI variants on one route |
| `/bottega:domain-modeling` | Build and sharpen the project's domain model, its terminology and its decision records |
| `/bottega:setup` | Set up the repo's issue tracker, triage label vocabulary, branch claim, and domain doc layout |
| `/bottega:bro` | Talk and write like one human to another, technical content in Simplified Technical English |

A run uses further methods that have no command of their own: open, spec, implement, qa, close, architect, and use-codex. The run reaches them itself.

## How a run works

`/bottega:maestro` turns the session into the run's orchestrator. It designs, decides, and rules on what comes back, and dispatches everything else to fresh workers.

1. **Launch.** It asks the one question the request does not answer: does the PR land itself on green, or hold for you. Then it claims the work, opens its own worktree and branch so your checkout is untouched, records the release answer, and reads the project's commands and landing procedure from the repository's agent map ([`skills/open`](skills/open/SKILL.md)).
2. **Discover.** It reads the code the request touches until it can say what the request means in this repository's terms, sends one worker per question that reading left open, and then works the unknowns with you: naming what you have not thought to ask, laying out options and prototypes to react to, and interviewing you one question at a time. Discovery sizes itself, so a small fix comes back fast and a serious feature takes the whole method ([`skills/discover`](skills/discover/SKILL.md)).
3. **Spec.** When discovery settled anything your request does not already say, the run publishes a spec on its tracker issue: the problem, the finished behavior announced to the people who will use it, user stories, implementation decisions, testing direction, acceptance criteria, and what is out of scope. It confirms the test seams with you before writing. Otherwise your request is the spec, quoted verbatim into every brief that judges against it ([`skills/spec`](skills/spec/SKILL.md)).
4. **Design.** The orchestrator owns the domain model, the boundaries, the acceptance criteria, and the split into vertical slices that workers can build in parallel. A criterion that can be enforced ships as a test. A new check, gate, or validator ships with one sentence naming what it must catch and what it deliberately does not. A decision that is open, costly to reverse after merge, and settled by no cheap check goes to a panel ([`skills/architect`](skills/architect/SKILL.md), [`skills/panel`](skills/panel/SKILL.md)).
5. **Second opinion.** When a bad design here would hurt to undo after the merge, the settled design and plan go to one read-only codex dispatch, held to a single bar: revise only where a strong maintainer, seeing both the current plan and the proposed change, would clearly agree the revision is necessary or materially better.
6. **Build.** As many slices run at once as their files and dependencies allow, each in its own worktree. A builder writes the slice test-first, a fresh reviewer reads what that builder built, the builder fixes what is accepted, and the orchestrator integrates the slices with the project's gates green ([`skills/implement`](skills/implement/SKILL.md)).
7. **Review.** One fresh worker runs the whole review method over the integrated diff. The vendored engine reads a frozen bundle in an isolated sandbox at `--max-priority P2`, blind to the builders and to the run's design decisions, and a Standards lens and a Spec lens read the same diff in parallel and report apart so neither masks the other. That worker verifies each finding against the real code, fixes what is in scope, and reruns to one converged head. The orchestrator rules on its report and never edits code. When the design would be costly to undo, a separate read checks the same diff against the design and the house architecture doctrine ([`skills/autoreview`](skills/autoreview/SKILL.md)).
8. **QA.** Workers drive every visible product surface the work touched the way a user would, judged against the spec, and return a verdict per scenario. They never edit product code. Failed scenarios loop through fixers and another drive until all of them pass, and each scenario's recording is published ([`skills/qa`](skills/qa/SKILL.md)).
9. **Close.** The run confirms that the head it accepted, the head QA verified, and the head it publishes are one commit, files every deferred finding as its own issue, and opens the PR written for a reader who was not in the run. It applies the project's brake when you said hold, arms auto-merge only where the project's landing procedure makes arming the opener's act, watches the checks, and reports the PR merged, ready, held, or waiting on what only a person can clear ([`skills/close`](skills/close/SKILL.md)).

You take part in three places: the launch answer, discovery, and the spec's seam check. A worker that hits a question only you can settle sends it to the conversation mid-run.

What survives a run beyond the code: enforceable acceptance criteria as tests, decisions that meet the decision-record bar as ADRs, operating facts a worker had to dig for in the agent map, and the rest of the story in the PR body. QA recordings live in a separate private repository, linked from the PR. The run's working state is a worktree, a branch, and two gitignored files, cleared once the PR merges.

## Design decisions

**No engine of its own.** Bottega is Markdown skills, one guard hook, and one GitHub script. There is no scheduler, queue, or state machine: orchestration uses the harness's own subagents, workflows, and tracked background work, and a run's state is its worktree, its commits, and its PR, so a later session picks it up from those. Machinery written here would duplicate the harness and drift from it.

**Claude does the work, and codex cross-reads finished work.** Every worker in a run is a Claude subagent. Codex sits at four places: the second opinion on the settled plan, the review engine, the review's Spec lens, and one seat on a panel, where drafts from different companies' models are the whole point. A builder cannot certify the design it implemented, and the orchestrator should not be the only verifier of the design it authored.

**Every dispatch names its worker's model.** The models are named in the sentences that dispatch the workers, in [`skills/maestro`](skills/maestro/SKILL.md), [`skills/panel`](skills/panel/SKILL.md), and the vendored review engine document, and nowhere else. A hook rejects a live run's subagent, workflow, or codex dispatch that names no model, and rejects the orchestrator's own model as a worker, because an omitted model silently inherits the orchestrator's, the most expensive one. The one dispatch that passes without a model parameter is the codex forwarder subagent: its own model is pinned in its agent file, and the codex model it forwards is checked on the companion task command.

**The PR is the only path to trunk, and you decide the release.** Every run builds on its own branch in its own worktree, and its PR reaches ready only once the review, QA, and the project's checks are green on the exact head being delivered. The run verifies, and you authorize the release at launch: land on green, or hold. A held PR carries the brake the project's landing procedure names, or the `hold` label where it names none, and waits for you to lift it. The run never merges a PR by hand and never approves one. Anything only a person can clear, such as a required review, is reported with the PR left open.

## Changing bottega

`AGENTS.md` maps this repository and states the procedure for changing it. The gate is `npm test`, which runs the vitest suites plus the vendored review engine's Python suites and needs `python3` and `git` on PATH.

## Credits

### Copied into this repo

These files are other people's work. Each copy carries its upstream license file, and [`THIRD_PARTY.md`](THIRD_PARTY.md) records the pinned revision, every local edit, and how to sync a newer version:

- the vendored autoreview engine in `skills/autoreview/` (`SKILL.md`, `scripts/`, `tests/`) from [openclaw/agent-skills](https://github.com/openclaw/agent-skills), under `skills/autoreview/LICENSE` (MIT, Copyright (c) 2026 openclaw).
- `skills/prototype/` (`SKILL.md`, `UI.md`, `LOGIC.md`) and the whole of `skills/domain-modeling/`, both from [mattpocock/skills](https://github.com/mattpocock/skills), each set under its directory's `LICENSE` (MIT, Copyright (c) 2026 Matt Pocock).
- the codex agent and the companion runtime every codex dispatch runs on, from OpenAI's [codex plugin for Claude Code](https://github.com/openai/codex-plugin-cc) (Apache 2.0, with upstream's NOTICE): the whole of `vendor/codex/`, under `vendor/codex/LICENSE` and `NOTICE`.

Edit any of them upstream, not here. Bringing in a newer version means copying it again and reading the diff.

### Drawn on, not copied

- The discovery method (interviewing for unknowns) follows Thariq Shihipar's unknowns framework, published as [A field guide to Claude Fable 5: finding your unknowns](https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns).
- The run's context shape (each dispatch a fresh context returning one finished answer, supporting material loaded only in the phase that needs it) follows Shihipar's [The new rules of context engineering for Claude 5 generation models](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models).
- The restraint the skills are written with (few constraints, the orchestrator trusted with judgment) is calibrated to Anthropic's [Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5).
- The design vocabulary is John Ousterhout's deep modules.
- The builder's reuse-before-build order and root-cause repair rule come from [Ponytail](https://github.com/DietrichGebert/ponytail).
- The deep-module vocabulary in `skills/codebase-design` (module, interface, depth, seam, adapter, leverage, locality) started from [Matt Pocock's engineering skills](https://github.com/mattpocock/skills), as do interface-level TDD, the mocking doctrine, the grilling interview absorbed into discovery, and the spec's tracker-issue shape.
- Selective technology-skill loading and the repair's reproduce-first test draw from [Addy Osmani's agent skills](https://github.com/addyosmani/agent-skills).
- The exact-plan-to-implementer-to-reviewer handoff is reinforced by [Superpowers](https://github.com/obra/superpowers).
- The brief discipline a codex dispatch follows, the whole brief handed over as written text with every input by absolute path rather than squeezed through shell quoting, draws from [Peter Steinberger's agent scripts](https://github.com/steipete/agent-scripts).
- The review gate is openclaw's autoreview itself, vendored and locally adapted: its document is the whole closeout method and its helper runs the engines. Bottega's additions stand beside it with no run woven in: the reviewed repository's `REVIEW.md` self-read, the two-axis lenses adapted from Matt Pocock's code-review skill, and the panel held across reruns.
- The panel (blinded frontier drafts, a judge held to structured comparison) follows OpenRouter's [Fusion](https://openrouter.ai/blog/announcements/fusion-beats-frontier/), which measured fused frontier models beating any single one. Bottega deviates in one place: the judge never writes the answer, which stays with the session that ran the panel, because that session holds the context the judge never sees.
- The talk register's technical branch distills [danyuchn's ASD-STE100 skill](https://github.com/danyuchn/asd-ste100-skill), which itself carries the standard's discipline without its dictionary.

## License

MIT
