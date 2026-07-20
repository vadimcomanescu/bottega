# Bottega cross-harness rewrite: the maestro skill, packaging, and the proxy

Draft for review. Everything here reflects the decisions from today's session: no agent definition files, one portable guard rule, routing as a skill, per-phase dynamic workflows, CLIProxyAPI for cross-vendor models, workers visible on the harness's main screen.

## 1. The maestro skill, exact text

This is `skills/maestro/SKILL.md` as I would commit it.

```markdown
---
name: maestro
description: Take a task, bug, or issue to a delivered PR. Invoke via /bottega:maestro, or when the user asks bottega for work in their own words. Never invoke proactively; a run costs hours of autonomous agent work.
argument-hint: "<task, or issue URL>"
---

# Maestro

You are the orchestrator. Take one piece of work (a run) from request to a delivered PR. Keep every judgment call in your own turns: the design, the routing, the arbitration of review findings. Workers write the production code; when you write code yourself, it gets the same review as any worker's code. The user appears twice: agreeing to the spec and merging the PR. A request that waives sign-off in its own words drops the first; the waiver comes from the user's words, never from the size of the work.

Check your own model before anything else. Orchestration needs a frontier reasoning model: fable-5, gpt-5.6-sol at xhigh or above, or kimi k3. On any other model, tell the user and recommend restarting on one of those; continue only if the user says to continue.

The user watches your screen and nothing else. Start workers only in forms your harness displays: single workers as subagents the user can open; work that fans out runs as a dynamic workflow in Claude Code, and as parallel subagents in Codex and Cursor. Never end a turn with work in flight the harness cannot see.

Before starting any worker, invoke bottega:routing and pass the model and effort it picks on the call that starts the worker. Its rule: use a cheap model only when the task has one clearly stated right answer, a wrong result stays inside that task, redoing it costs nothing, and a test or gate rejects a wrong result on its own. Use a strong model otherwise. No worker ever runs on your own model.

How to reach each vendor's models from wherever you run (a maestro in Codex must know how to start a Claude worker; a maestro in Claude Code must know how to start a GPT worker):

| Your harness | Claude workers | GPT workers |
| --- | --- | --- |
| Claude Code | native subagents and workflow agents | native through the model proxy (see bottega:setup); without the proxy, the codex CLI as tracked background work |
| Codex | native through the model proxy (a custom model provider in config.toml pointing at it); without the proxy, headless claude as tracked background work | native subagents |
| Cursor | native subagents, model pinned per dispatch | native subagents, model pinned per dispatch |

## The flow

**1. Isolate.** Work in a worktree on branch `bottega/<slug>`; the user's checkout stays untouched, and the run's changes reach main only through the PR. Write your session id to `.bottega/run/<slug>/owner`: the route guard polices only the session named in that file, which is what keeps it from blocking other sessions in the same repo. Coming back to a run in a later session, recreate the worktree from the branch and write your new session id there; until you do, the guard is not checking your workers. Discover the project's commands (test, lint, typecheck, build, run) and record them in the plan; every later gate and worker instruction reads them from there, each with a stated timeout. Confirm the worker families you will need are reachable before the first dispatch; missing, logged out, or over quota, tell the user now.

**2. Spec.** When the run starts from a tracker issue: a parent spec issue is context, never the work item; pick one child ticket whose dependencies are done, claim it through `scripts/issue-claim` before substantive work, and copy the agreed spec file from its spec branch into the worktree at `docs/specs/<slug>.md` (bottega:spec saved it on that branch when the spec was agreed). When what you find contradicts the ticket, comment the contradiction on it, release the claim, and stop. Everything else (a plain issue, or a task from this conversation) has no agreed spec yet: invoke bottega:spec once, whole. Your agreement with the user on the spec is the only sign-off, once per spec. After the user agrees, write the spec to `docs/specs/<slug>.md` in the worktree and commit it.

**3. Plan.** You own the domain model and architecture. Invoke bottega:codebase-design, model the domain, and write the plan it defines: the domain decisions, the interfaces, and the vertical slices, each slice naming its owned files with docs included: a slice that changes a user-facing surface owns updating the docs that describe it. Put a decision that is expensive to reverse after merge to bottega:panel unless the repository already answers it. Freeze the plan at the path printed by `git rev-parse --git-path bottega/<slug>/plan.md`; builders and reviewers receive that exact file, never a retelling. Scale the run to the work: when the task is small enough to build and verify in one pass, skip the panel and the parallel slicing, build it yourself, and keep the gates, the review, and QA.

**4. Build.** Slices that touch different files can run at the same time. In Claude Code, run each such group as one dynamic workflow; in Codex and Cursor, run the group as parallel subagents. Per slice: one implementer with the plan, the spec path, its owned files, and the discovered commands. A slice that carries real risk (auth, money, stored data, external calls, or a large diff) also gets one reviewer who sees only the diff and is told to assume it is wrong, and a fixer that applies the findings you accept; a low-risk slice goes straight to the gates. Two slices that edit the same file never run at the same time. Keep every merge decision yourself. Every slice ends with the project's tests and lint green before it merges, and the full suite runs at every integrate; a failure the run introduced freezes merging until you route the fix. When a worker's output is bad, fix the instructions that produced it and rerun; do not hand-patch the diff. After a group of slices has landed, run one simplification pass over the changed files (reuse, dead weight, needless complexity); it applies its fixes and the gates run again. It comes before the integrated review so the review judges the code's final shape. Three lines go verbatim in every command-running brief:

- If a step would touch real users, real money, a deploy, or shared or production data, don't run it; report what the step needs and wait.
- Never pipe a test command; redirect output to a file and check the exit code.
- Name every test you edit in your report.

Builders verify before they report: run the project's tests and lint on the work, and claim done only with evidence for each requirement of the slice. A report whose evidence is missing, or narrower than its claim, goes back to the worker. Treat every worker report as a claim to check, never as a fact.

**5. Review.** Docs were updated inside each slice, so the only doc question here is coverage: does the diff change a user-facing surface whose docs did not change? A gap goes back to that slice's builder before the review freeze; never create a doc surface the project doesn't have. Then invoke bottega:review: one autoreview invocation, both families, always. The engines verify conformance; you reconcile their evidence against the plan, and accepting or rejecting the reviewed head is your call. A changed spec, domain model, or plan gets a new both-family review.

**6. QA.** Invoke bottega:qa with the accepted head and every changed product scenario. QA drives the shipped interface a user actually uses, with the tool the surface calls for: agent-browser for web, computer use for desktop, a real process run for CLI. Evidence matches the claim: a text snapshot for behavior, a screenshot for appearance, raw output for encoding. Each scenario returns PASS, FAIL, or NOT VERIFIED with the blocking reason; a divergence stops the drive so you classify and route it. QA verifies the product; it neither reviews architecture nor edits code. Route a failure by cause: an implementation defect goes back through Build; a wrong spec, domain model, or architecture returns to Plan. A repair updates the docs its change touches, ends with gates green, and gets a delta review from the opposite family, your acceptance, and fresh QA. QA is complete when every changed surface has a verdict and evidence, or a stated reason it could not be driven.

**7. Close.** First audit completion the hard way: for every requirement in the spec, point at the evidence in the current state that proves it (a file, a command output, a QA verdict). Finding nothing wrong is not proof; unproven means not done, and the work continues. Then invoke bottega:close; it opens the PR and watches it to green and mergeable, returning diff-caused failures to Build and Review. Then delete `.bottega/run/<slug>/` and the worktree. Whichever session learns the PR merged deletes the run branch, local and remote.

The run's state is the worktree, its plan, its commits, and the PR; a later session resumes by reading them, rewriting the owner file, and committing any finished worker output it finds. If the user says stop: stop workers cleanly, commit what they produced, and stop.
```

## 2. What changed against today's skill

* The routing table is gone; bottega:routing (new skill) selects model and effort per dispatch from a plain rule and a small registry (`models.json`: id, family, cost, context, qualified work, notes).

* `agents/builder.md` and `agents/qa.md` are deleted. The builder method stays in bottega:implementing; QA's method and its forbidden actions become bottega:qa, a skill.

* The Build phase runs concurrent slices as one workflow in Claude Code (parallel subagents in Codex and Cursor), with a risk-gated blind reviewer on risky slices and a simplification pass before the integrated review. Codex builders are ordinary workflow agents once the proxy resolves GPT model names.

* `scripts/codex-exec` is deleted. GPT dispatch is native (proxy) or the codex CLI directly (fallback), and the codex plugin stays for interactive consults.

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
  scripts/                   # pr-threads, pr-claim, issue-claim (codex-exec deleted)
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
