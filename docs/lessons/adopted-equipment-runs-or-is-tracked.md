# Adopted equipment either runs or is tracked, never just described

What happened: 0.66.0 adopted the model proxy (CLIProxyAPI) as the primary path for GPT workers inside Claude Code. What shipped was a README section, a spec section, and one descriptive paragraph in skills/setup. The binary was never installed, authenticated, or used for one live dispatch; the routing skill's primary path pointed at equipment that had never run, and no issue tracked the gap until 2026-07-20 (#78).

The rule: a capability the diff adopts ships with its working verification (the mechanism ran, with evidence), or with a tracking issue filed in the same delivery. A described capability with neither is an unshipped dependency of every path that names it.

Enforced: REVIEW.md ("a capability the diff adopts ships either its working verification or a tracking issue").

Related: [qa-drives-the-integration](qa-drives-the-integration.md).
