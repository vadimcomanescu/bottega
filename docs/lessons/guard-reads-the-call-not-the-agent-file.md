# The guard reads the call, not the agent file

What happened: from 0.154.0 a codex dispatch went out as the `bottega:codex` subagent, whose model is pinned `sonnet` in its own agent file, so a correct dispatch omits the call's model parameter. The route guard reads only that parameter, denied every such dispatch as unpinned, and its deny text ("Claude workers run on opus-5") had the maestro retry with an explicit opus parameter — which overrides the file's pin. Every live-run codex dispatch paid one denied round trip and then ran its one-call forwarder on Opus.

The rule: a worker whose model is pinned in its own agent file is dispatched with no model parameter, and the guard passes it by subagent type, because the file's pin is outside what the guard can read. A deny message is an instruction the orchestrator obeys, so it must not name a model for a dispatch whose model lives elsewhere.

Enforced: `hooks/route-guard.mjs` (the `bottega:codex` pass), `tests/route-guard.test.ts` ("allows an owner-session codex forwarder dispatch without a model").
