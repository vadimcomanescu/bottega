# bottega

Autonomous issue-to-PR runs for Claude Code and Codex. One command takes a task, bug, or GitHub issue to a reviewed, evidence-backed pull request.

## Install

### Codex

Requirements:

- A current Codex client with plugin and native subagent support.
- The Claude CLI, authenticated for non-interactive `claude -p` calls.
- Node.js 22.18 or newer.

```bash
codex plugin marketplace add vadimcomanescu/bottega
codex plugin add bottega@bottega
```

Start the Codex task on GPT-5.6 Sol at Ultra, then invoke:

```text
$bottega:run <task, or issue URL>
```

The active Codex task is the orchestrator. A plugin cannot change the task's model or reasoning level, so Bottega stops when the client visibly reports another route and never claims to verify route metadata the client does not expose.

### Claude Code

Requirements:

- Claude Code running on Fable 5.
- The Codex CLI, authenticated for non-interactive `codex exec` calls.

```text
/plugin marketplace add vadimcomanescu/bottega
/plugin install bottega@bottega

/bottega:run <task, or issue URL>
```

## What a run does

The selected host session becomes the orchestrator and:

1. Isolates the work in its own worktree and branch, then discovers the host's test, lint, typecheck, build, and run commands.
2. Reads the codebase and domain glossary, identifies risks omitted from the request, inventories relevant technology skills, and resolves material unknowns.
3. Presents a brief user-facing specification with acceptance criteria, definition of done, domain terms, and wireframes when the work touches UI. The user's approval is the go signal unless the request explicitly waived it.
4. Models the domain, writes the architecture brief, cuts vertical slices, and sends costly decisions without repository precedent to a blinded panel.
5. Dispatches builders with one assigned slice, the fixed architecture, the glossary, owned paths, and exact verifiers. Host gates stay green at every integration.
6. Reconciles documentation before the final gate, freezes the integrated diff, and sends that same target to one cold Codex reviewer and one cold Claude reviewer. The orchestrator reproduces and arbitrates every finding.
7. Sends a separate QA worker through the accepted head and records the product verdict. Any product repair returns through gates and review before QA runs again.
8. Opens the pull request with the specification, decisions, review records, architecture acceptance, and QA evidence. Delivery changes no tracked file, so the pull request publishes the accepted reviewed head.

The user appears exactly twice: agreeing to the specification and merging the pull request.

## One method, two transports

The `skills/` tree is the single source of Bottega's behavior for both hosts. The shared run, implementation, review, design, panel, QA, and delivery methods do not have a generated Codex copy.

- In Codex, the current GPT-5.6 Sol Ultra task orchestrates native subagents. It never launches a nested Codex process. `scripts/claude-exec` is the only external model boundary and owns the fixed Claude route, structured output, timeout, model-usage proof, and frozen-worktree guard.
- In Claude Code, Fable 5 orchestrates Agent and Workflow dispatches. Claude-only hooks enforce routing, and `scripts/codex-exec` is the only place a Codex worker command is assembled.

The exact routes and path rules live in [`skills/run/references/host-transports.md`](skills/run/references/host-transports.md).

## Design decisions

**No engine.** Bottega uses the host's tracked subagent, shell, and workflow primitives. It does not add a scheduler, queue, polling loop, or state machine.

**Both-family review, always.** Every run's integrated diff is reviewed independently by Codex and Claude against the same frozen base, head, tree, intent, and schema. Neither reviewer receives builder reasoning, the other report, or an orchestrator conclusion. Any accepted fix is rechecked by a fresh reviewer from the family opposite the fixer. The report contract is [`skills/reviewing/references/report.schema.json`](skills/reviewing/references/report.schema.json).

**The specification is a conversation.** The user approves observable behavior and material defaults in the session. An explicit autonomous waiver removes that pause, but it never removes separate approval for deploys, money movement, destructive actions, or shared and production data.

**QA owns the product drive.** Builders prove code and tests. Reviewers inspect the integrated code and architecture. QA drives the accepted artifact as a user and reports without editing product code.

**The pull request is the only path to trunk.** Every run builds in isolated worktrees. The user's checkout stays untouched, and the merge is the final human gate.

## Roles

| Role | Responsibility | Claude Code route | Codex route |
| --- | --- | --- | --- |
| orchestrator | design, routing, review arbitration, architecture acceptance | Fable 5 | GPT-5.6 Sol, Ultra |
| builder | one test-first vertical slice inside the fixed architecture | GPT-5.6 Sol high, or Claude Opus xhigh for a user-facing slice | GPT-5.6 Sol high |
| reviewer | complete frozen diff, tests, and independent architecture verdict | GPT-5.6 Sol high plus Claude Opus xhigh | native GPT-5.6 Sol high plus Claude Opus xhigh |
| QA | product scenarios and evidence, no product edits | Claude Opus high | GPT-5.6 Sol high |
| panelist and judge | independent drafts and blinded comparison for one costly decision | GPT-5.6 Sol max plus Fable | GPT-5.6 Sol max plus Claude Opus |
| mechanic | bounded setup, integration, gates, and bulk reads | Claude Sonnet low | GPT-5.6 Terra high |

## Skills

- `run` takes a task to a pull request.
- `review` applies the cross-family gate to a pull request or ref range.
- `land` takes an open pull request through review and fixes to a terminal mergeability state.
- `implementing`, `reviewing`, and `codebase-design` are shared worker methods.
- `panel` is the internal costly-decision comparison.

## Repository layout

```text
.claude-plugin/  Claude Code manifest and marketplace
.codex-plugin/   Codex manifest
.agents/plugins/ Codex marketplace
skills/          one canonical method tree for both hosts
agents/          reusable worker identity files
scripts/         codex-exec, claude-exec, shared adapter checks, and pr-threads
hooks/           Claude-only entry and route guards
tests/           plugin, transport, hook, schema, and workflow contracts
```

## Development

```bash
npm install
npm test
npm run typecheck
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py .
```

Adapter changes also require one minimal real Claude structured-output smoke call. Plugin changes require a local Codex install and a fresh-task skill discovery smoke.

## Credits

The discovery method follows Thariq Shihipar's unknowns framework. The design vocabulary is John Ousterhout's deep modules. The builder's ordered minimum-code checks come from [Ponytail](https://github.com/DietrichGebert/ponytail); interface-level TDD and active domain language draw from [Matt Pocock's engineering skills](https://github.com/mattpocock/skills); selective technology-skill loading draws from [Addy Osmani's agent skills](https://github.com/addyosmani/agent-skills); and the exact-plan-to-implementer-to-reviewer handoff is reinforced by [Superpowers](https://github.com/obra/superpowers). The review report contract adapts the architecture of [openclaw/agent-skills autoreview](https://github.com/openclaw/agent-skills/tree/main/skills/autoreview). The panel follows OpenRouter's [Fusion](https://openrouter.ai/blog/announcements/fusion-beats-frontier/), with synthesis kept in the orchestrator because it holds the run context the compare-only judge does not receive.

## License

MIT
