driven head: aca05ae9274fd4f877323bd4a1f330e196909655

=== README section headings (install/proxy locations) ===
7:## Install
9:### Claude Code
20:### Codex
32:### Cursor
44:## Commands
58:## What it does
73:## Requirements
81:## Model proxy (optional)
96:## Design decisions
110:## Roles
125:## Repo layout
141:## Development
150:## Credits
154:## License

=== in-tree paths referenced by install + proxy sections (test -e) ===
EXISTS   skills
EXISTS   skills/spec/SKILL.md
EXISTS   docs/specs/cross-harness.md

=== proxy anchor target (#6-the-honest-part...) resolves to a heading ===
130:## 6. The honest part: the proxy and cloud agents

=== ALL 'cliproxy' occurrences (case-insensitive) in README.md ===
83:[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) is a local service that authenticates once to Claude and ChatGPT/Codex with OAuth, holds those tokens locally, and serves backed models through both Anthropic-compatible and OpenAI-compatible endpoints. Install its single binary with Homebrew or a release download, authenticate with both providers (the login commands are in the CLIProxyAPI docs), then start the service on localhost.
README cliproxy grep exit: 0

=== ALL 'cliproxy' occurrences (case-insensitive) in docs/specs/cross-harness.md ===
3:Draft for review. Everything here reflects the decisions from today's session: no agent definition files, one portable guard rule, routing as a skill, per-phase dynamic workflows, CLIProxyAPI for cross-vendor models, workers visible on the harness's main screen.
112:## 5. The model proxy (CLIProxyAPI): how it works, exactly
118:1. Install CLIProxyAPI (single binary; brew or release download).
119:2. Authenticate each provider once (browser OAuth; the exact login command is in the CLIProxyAPI docs); tokens are stored locally.
spec cliproxy grep exit: 0

=== any 'cliproxy <subcommand>' command syntax (lowercase cliproxy followed by a word) anywhere in tree ===
command-syntax grep exit (1 = none found): 1
