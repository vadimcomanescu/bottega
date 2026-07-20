=== in-tree paths referenced by install + proxy sections (test -e) ===
EXISTS   skills
EXISTS   skills/spec/SKILL.md
EXISTS   docs/specs/cross-harness.md

=== confirm the anchor target section 6 exists in cross-harness.md ===
130:## 6. The honest part: the proxy and cloud agents

=== proxy section (lines 81-94) grep for cliproxy flags (dash-dash options) ===
grep exit (1 = no flags found): 1

=== all 'cliproxy' mentions in proxy section ===
3:[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) is a local service that authenticates once to Claude and ChatGPT/Codex with OAuth, holds those tokens locally, and serves backed models through both Anthropic-compatible and OpenAI-compatible endpoints. Install its single binary with Homebrew or a release download, run `cliproxy auth claude` and `cliproxy auth codex`, then start the service on localhost.
