# The vendored runtime is one directory

Date: 2026-08-01.

ADR 0038 took the codex runtime at upstream-relative paths, which for a plugin whose root is the repository root meant scattering it across four top-level directories: `agents/`, `scripts/` (mixed in beside bottega's own `pr-threads`), `prompts/`, and `schemas/`. Nothing at the root said which of those came from outside, and two of them read as bottega's own. The layout was not a decision so much as the shape upstream's paths took when the plugin root and the repository root were the same directory.

The scripts are why the pieces sat where they sat. `codex-companion.mjs` resolves the directory above `scripts/` and looks there for `prompts/` and `schemas/`, and `lib/app-server.mjs` reads `../../.claude-plugin/plugin.json` at import, not inside a function. Moving any one piece alone breaks a dispatch at load, which is why the scatter looked necessary.

Decision: everything taken from upstream lives in `vendor/codex/`, laid out exactly as upstream lays out `plugins/codex/`, including upstream's own `.claude-plugin/plugin.json`. Because the mirror is faithful, every one of those walk-up reads resolves inside the directory and not one byte of upstream's code changes. `plugin.json` names the agent's new path, and `hooks/hooks.json` names the session hook's. Root `scripts/` holds bottega's own work alone.

Only the files a dispatch reaches are taken. `prompts/`, `schemas/`, and `stop-review-gate-hook.mjs` serve the `review`, `adversarial-review`, and stop-gate paths: `agents/codex.md` forbids those subcommands, bottega ships none of upstream's `commands/` wrappers that would expose them, and `hooks/hooks.json` never registers the gate. The companion reads those two directories inside the handlers rather than at import, so leaving them out costs no edit to upstream's bytes. Running `adversarial-review` by hand now fails on a missing prompt, which is the only reachable consequence and is already a forbidden call.

Two alternatives were live. Keeping the scatter and deleting only the unreachable files would have left the remaining pieces spread across three root directories for no reason anyone could read off the tree. Redirecting the paths with a fourth recorded hunk would have bought the same tidiness by editing upstream code, which is the one cost the sync contract exists to avoid.

Consequences. A sync copies `plugins/codex/` over `vendor/codex/` and deletes the not-taken paths, which is closer to a straight copy than the old per-path list. The nested `.claude-plugin/plugin.json` is required, not residue: delete it as a stray manifest and every dispatch dies before it starts, which `tests/codex-vendor.test.ts` pins. It also corrects what a dispatch reports about itself, since `clientInfo.version` carried bottega's release number while upstream's manifest was absent and now carries codex's. `marketplace.json` names one plugin by explicit source, so the nested manifest registers nothing.
