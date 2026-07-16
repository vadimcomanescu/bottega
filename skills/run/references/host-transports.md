# Host transports

Identify the current host from its actual tool surface, then follow only that host section. Resolve the installed Bottega root before the first dispatch. The shared run skill owns product behavior and gates; this reference owns model routing, dispatch, external CLI calls, path vocabulary, and routing proof.

## Codex host

The current Codex task is the orchestrator. It runs on GPT-5.6 Sol (`gpt-5.6-sol` when the client exposes that slug) at Ultra (`model_reasoning_effort = "ultra"`). A plugin cannot switch the root task's model or effort. When the client visibly reports a different route, stop and tell the user. When route metadata is hidden, do not claim it was verified.

Resolve the plugin root from the loaded `skills/run/SKILL.md` path, not from a checkout-specific path. Pass absolute paths for every Bottega agent file, skill, schema, script, brief, checkout, report, and evidence file.

Use native subagents for Codex-family workers. Never launch another Codex process. Do not install project custom agents or mutate `.codex/config.toml`. Give a built-in worker the matching file under `agents/`, its method skills by absolute `SKILL.md` path, the canonical run brief, owned paths, verifier, and expected result. Start each reviewer and panelist with fresh context. Resume the same builder only to answer a missing decision. Keep routine reads, commands, formatting, and small deterministic edits in the current task. Use the mechanic only for a substantial bounded lane with an exact verifier. Run independent reads and the round-one review pair in parallel. Put each writing builder in its assigned worktree so concurrent slices do not share a product checkout. Keep at most four workers live.

| work | model | effort |
| --- | --- | --- |
| orchestrator | GPT-5.6 Sol | Ultra |
| mechanic | GPT-5.6 Terra | high |
| builder | GPT-5.6 Sol | high |
| review round 1 | GPT-5.6 Sol plus Claude Opus | high plus xhigh |
| review after a native fix | Claude Opus | xhigh |
| costly-decision panel | GPT-5.6 Sol plus Claude Opus; Claude compare-only judge | max plus xhigh; high judge |
| QA and documentation sweep | GPT-5.6 Sol | high |

When native dispatch controls expose model and effort, request the table route. Otherwise record `host-routed` and retain any model metadata the harness provides. A native review report is accepted only with the native thread identity and the exact frozen SHAs; do not invent model proof the harness did not expose.

Claude reviewer, panelist, and compare-only judge calls go only through `scripts/claude-exec`. Before work that depends on them, run `claude --version`, `claude auth status`, and one minimal schema-constrained adapter smoke call. A missing binary, failed authentication, unavailable Opus route, or failed structured output blocks the run before implementation.

Use this adapter shape, with every path absolute:

```text
<plugin-root>/scripts/claude-exec --role <reviewer|panelist|judge> --cwd <checkout> --brief <brief.md> --out <report.json> --events <envelope.json> --schema <schema.json> [--head <sha> --tree <sha>]
```

The frozen target pair is required for a reviewer and omitted for panel roles. Give a reviewer a disposable worktree at the frozen head and `skills/reviewing/references/report.schema.json`. Give a panelist `skills/panel/references/panelist.schema.json`; give the judge only the blinded drafts and `skills/panel/references/judge.schema.json`. The adapter owns Claude model, effort, permissions, tools, timeout, output validation, model-usage proof, and the tracked-worktree guard. Retain its envelope with the run evidence.

Codex has no Claude session ownership hook. Resume from the worktree, run brief, commits, reports, and PR.

## Claude Code host

The current Claude Code session is the orchestrator and runs on Fable 5. When loaded on a lower tier, report it and hold judgment calls until Fable returns or the user explicitly waives the tier. Resolve the plugin root from `$CLAUDE_PLUGIN_ROOT` when installed and from this repository when developing it.

Write the orchestrating session's `$CLAUDE_CODE_SESSION_ID` to `.bottega/run/<slug>/owner` at isolation and on resume. This arms `hooks/route-guard.js`. Every Agent and Workflow dispatch names its model; the hook rejects missing, misrouted, or unsanctioned Fable routes.

| work | model | effort |
| --- | --- | --- |
| orchestrator | Fable 5 | current session |
| builder | GPT-5.6 Sol through the Codex adapter | high |
| user-facing builder | Claude Opus | xhigh |
| review round 1 | GPT-5.6 Sol plus Claude Opus | high plus xhigh |
| review after fixes | family opposite the fixer | high or xhigh |
| costly-decision panel | GPT-5.6 Sol plus Fable drafts; Fable compare-only judge | max plus high; high judge |
| QA and documentation sweep | Claude Opus | high |
| mechanic | Claude Sonnet | low |

Claude workers use the named files under `agents/` with the table's explicit model and effort. Claude-family review uses `skills/reviewing/assets/review-dispatch.js`; the panel uses `skills/panel/panel.js`, the one sanctioned Fable workflow. Codex-family workers launch only through `scripts/codex-exec` as tracked background shell work, following [the Codex dispatch reference](codex-dispatch.md). Before the first Codex dispatch, run `codex --version` and one one-line execution. A missing binary, failed login, exhausted quota, or failed structured output blocks the run before implementation.
