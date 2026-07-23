# Bottega cross-harness rewrite: the maestro skill, packaging, and the proxy

Status: agreed 2026-07-20

Delivered spec. It records the decisions of the cross-harness session: no agent definition files, one portable guard rule, routing as a skill, per-phase dynamic workflows, CLIProxyAPI for cross-vendor models, workers visible on the harness's main screen.

Superseded in part 2026-07-22 by `docs/adr/0008-model-proxy-re-declined.md`: the model proxy is re-declined, covering sections 5 and 6 whole, section 4's proxy step and no-proxy-fallback wording, and section 2's proxy and tracked-background dispatch paths. Cross-vendor dispatch is one foreground CLI call inside a wrapper subagent, never background work.

## 1. The maestro skill

The delivered text is `skills/maestro/SKILL.md`. This spec points there and carries no copy: an embedded copy drifts as later commits edit the skill.

## 2. What changed against today's skill

* The per-seat table in the run skill is replaced by bottega:routing (new skill): a scored model table, fixed task rules, and per-host reach mechanics, all in the skill text. No separate registry file.

* `agents/builder.md` and `agents/qa.md` are deleted. The builder method stays in bottega:implementing; QA's method and its forbidden actions become bottega:qa, a skill.

* The Build phase runs concurrent slices as one workflow in Claude Code (parallel subagents in Codex and Cursor), with a risk-gated blind reviewer on risky slices and a simplification pass before the integrated review. Codex builders are ordinary workflow agents once the proxy resolves GPT model names.

* `scripts/codex-exec` stays: the single assembly point for every codex CLI launch, carrying the sandbox flags, resume traps, stall watchdog, progress streaming, and completion verification a bare CLI call loses. GPT dispatch is native (proxy) or `scripts/codex-exec` as tracked background work (fallback), and the codex plugin stays for interactive consults.

* The entry guard is deleted. The route guard shrinks to one rule.

* Fable-only seat requirement widens to fable-5 or sol-xhigh, checked by the maestro itself at startup.

## 3. Repo layout and packaging

Superpowers-style: one canonical skills tree, thin per-harness manifests pointing at it, one canonical instructions file.

```
bottega/
  skills/                    # canonical; the product
    maestro/  spec/  routing/  review/  qa/  land/  close/
    panel/  improve/  setup/  implementing/  claude-bridge/
    codebase-design/  autoreview/ (vendored)  writing-great-skills/ (vendored)
  hooks/
    route-guard.mjs          # one script, speaks each harness's hook JSON
    hooks.json               # Claude Code registration
    hooks-cursor.json        # Cursor registration
    hooks-codex.json         # Codex registration
  scripts/                   # codex-exec, pr-threads, pr-claim, issue-claim
  .claude-plugin/plugin.json # points at ./skills/, ./hooks/hooks.json
  .codex-plugin/plugin.json  # points at ./skills/
  .cursor-plugin/plugin.json # points at ./skills/
  .agents/skills/            # symlinks into ../skills for direct .agents discovery
  AGENTS.md                  # canonical instructions
  CLAUDE.md -> AGENTS.md     # symlink
  docs/  tests/
```

The guard script reads the harness from its environment (plugin root variables differ per harness, same trick superpowers uses) and emits that harness's deny JSON. One rule: a session that owns a live run must name a model on every dispatch, and never an orchestrator-tier model. Registered three ways, enforced wherever the harness supports PreToolUse-style hooks, absent without breakage elsewhere.

## 4. Setup and dependencies

`/bottega:setup` reconciles a machine, in this order:

1. Requirements always: git, node, gh.
2. The harness you invoke it from is the one it configures. It verifies the other CLIs you want as worker families: `claude` (for Codex-hosted maestro), `codex` (for the no-proxy fallback), and reports what is missing rather than installing silently.
3. Skill discovery: Claude Code loads the plugin; Codex and Cursor read `.agents/skills/`. Setup verifies the symlinks resolve.
4. Guard registration for the current harness.
5. The model proxy, only if you ask for it (next section).

Dependency posture: bottega depends on nothing at runtime beyond the harness it runs in, git, and gh. The proxy is optional equipment for one harness (Claude Code), never a requirement; every path has a stated fallback.

## 5. The model proxy (CLIProxyAPI): how it works, exactly

What it is: a small local HTTP service that logs into your vendor accounts (Claude subscription, ChatGPT/Codex subscription) once via OAuth, holds the tokens, and exposes them over standard API formats on localhost: an Anthropic-compatible endpoint and an OpenAI-compatible endpoint, each able to serve any backed model. It works in both directions: Claude Code reaches GPT models through the Anthropic-compatible endpoint, and Codex reaches Claude models by declaring a custom model provider whose base_url is the proxy. When Claude Code is pointed at it, a request for `gpt-5.6-sol` is forwarded to OpenAI under your Codex subscription, and a request for an Anthropic model passes through unchanged. Claude Code cannot tell the difference; GPT models become names it can route like any other.

Setup on your machine:

1. Install CLIProxyAPI (single binary; brew or release download).
2. Authenticate each provider once (browser OAuth; the exact login command is in the CLIProxyAPI docs); tokens are stored locally.
3. Start the service (localhost, default port; runs as a login item or a shell service).
4. Point Claude Code at it, in the project or user settings:

   * `ANTHROPIC_BASE_URL=http://localhost:<port>`

   * `ANTHROPIC_AUTH_TOKEN=<the proxy's local api key>`
5. From then on, a subagent dispatch or a workflow `agent()` call may name `gpt-5.6-sol` and it runs, visible in the native UI like any Claude agent. Theo's published setup adds `CLAUDE_CODE_SUBAGENT_MODEL` to force a default subagent model; bottega does not want that (routing chooses per dispatch), so we set only the two variables above.

What it buys bottega: one dispatch mechanism inside Claude Code for both families, full main-screen visibility for codex builders, mixed-family build workflows (sol implementers, opus reviewers, one tree). What it costs: a local service holding OAuth tokens for both subscriptions, and a setup step per machine.

## 6. The honest part: the proxy and cloud agents

You asked how this works for cloud agents not on your machine. Short answer: it does not, out of the box, and I would not pretend otherwise.

The mechanics: a cloud session (claude.ai/code cloud, Cursor cloud agents, Codex cloud) runs in the vendor's VM. `localhost` there is the VM, not your Mac. Your tailnet does not reach it either; vendor VMs are not your nodes. So the proxy as configured above simply does not exist for a cloud run, and a cloud maestro falls back to the same table row as "no proxy": its own vendor's models natively, the other family over that harness's bridge if the VM has the CLI and credentials, otherwise a run that flags the missing family.

The ways to make the proxy reachable from a cloud VM, with their real costs:

1. Host the proxy on a server with a public HTTPS endpoint (a VPS, or your omarchy box behind Tailscale Funnel, which publishes one tailnet service to the public internet under TLS). The cloud environment then gets `ANTHROPIC_BASE_URL=https://proxy.yourdomain` and the proxy key as environment configuration. This works mechanically. The cost is that a public endpoint now fronts OAuth tokens for both of your subscriptions, protected by one bearer key; a leaked key is full spend access to both accounts until you rotate. It also assumes the vendor VM allows egress to arbitrary hosts, which some cloud sandboxes restrict.
2. Accept the degradation: cloud runs are single-family plus bridge, local runs are full cross-family through the proxy. The cross-family review gate then has a stated exception path for cloud runs (the second family arrives via that harness's own bridge or the run says it could not).

My recommendation: option 2 now. Treat the proxy as local equipment, write the cloud degradation into the maestro's harness table as a plain fact, and revisit hosting only if cloud runs become your normal way of working. Option 1 is a real design with real token custody consequences, and it deserves its own decision rather than riding along on this rewrite.

## 7. Open questions for the spec

1. Codex-hosted maestro: subagents there cannot spawn further subagents (depth 1) and `codex exec` headless cannot spawn any; the flow's fan-outs fit inside those limits, but the build workflow shape is Claude-Code-specific. In Codex the same batch runs as parallel native subagents without the workflow tree. Acceptable, or should Codex hosting wait?
2. The guard on Cursor and Codex: both have PreToolUse-equivalent hooks; whether their payloads carry enough (a session identity, a model field) for the one rule is unverified. The spec pins this down per harness or scopes the guard to Claude Code first.
3. Vendored autoreview drives review through both families' CLIs today; with the proxy it could run both engines through one endpoint. Left as is for this rewrite.

## Execution directives (agreed 2026-07-20)

1. Cross compatibility: the method runs under Claude Code, Codex, and Cursor.
2. Zero ceremony: any word removable without changing behavior or doctrine is removed.
3. Every unclear phrase is made precise, except where the model must make a judgment call.
4. Mechanical steps (tests, lint) execute mechanically, always.
5. Every skill aligned to writing-great-skills: uniform openings, skill register (not agent register), no drift between files.
6. Install plugins provided for Claude Code, Codex, and Cursor.
7. Dependency setup managed per industry best practice.
8. The maestro phase sequence validated against the best coding agents and doctrine; missing doctrine added.
