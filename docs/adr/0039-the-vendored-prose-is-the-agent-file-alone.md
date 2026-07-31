# The vendored prose is the agent file alone

Date: 2026-07-31.

The vendoring ADR 0038 records brought upstream's whole prose stack along with the runtime: `agents/codex.md` plus its two preloaded skills, `skills/codex-cli-runtime` and `skills/gpt-5-4-prompting`. Read against what each file carries, the two skills bought nothing. `codex-cli-runtime` restates the forwarding contract the agent body already states line for line. `gpt-5-4-prompting` is prompt guidance written for a model generation the dispatch sites no longer pin, and the brief a dispatch hands codex is already written per `skills/use-codex`. Both also installed as plugin skills on every consumer, widening the surface the sync contract and the register carve-outs had to cover.

Decision: the vendored prose is one file, `agents/codex.md`. Its `skills` preload list and the two lines pointing at upstream's prompting skill are removed as recorded scoping edits, upstream's `LICENSE` and `NOTICE` move beside it in `agents/`, and upstream's `skills/` joins `commands/` in the not-taken list. The scripts, prompts, and schemas the runtime runs on are unchanged, and so is the dispatch shape: the agent forwards once to `codex-companion.mjs task` and the orchestrator holds the watch.

Consequence for a sync: the upstream-to-upstream diff is applied to one prose file instead of three, and a sync that reintroduces upstream's skill directories is wrong by this record.
