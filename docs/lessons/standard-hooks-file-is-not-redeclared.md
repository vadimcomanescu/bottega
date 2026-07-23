# The standard hooks file auto-loads; the manifest declares only additional ones

What happened: the Claude manifest declared `"hooks": "./hooks/hooks.json"`, the standard path Claude Code loads automatically. The harness loaded the file twice and rejected the second as a duplicate, failing hook load on every install (surfaced 2026-07-21 after 0.72.0). The redundant key had ridden along since hooks were standardized to `hooks/hooks.json`.

The rule: Claude Code auto-loads `hooks/hooks.json`; a manifest `hooks` key names only additional hook files under non-standard names (as the Codex manifest does with `hooks-codex.json`). Re-declaring the standard path is a duplicate load.

Enforced: tests/worker-doctrine.test.ts ("parses all manifests and points portable manifests at skills") asserts the Claude manifest declares no hooks key.
