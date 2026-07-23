# 0005: The method is harness-portable; enforcement shrinks to one guard rule

Date: 2026-07-20

Superseded in part: Cursor was dropped as a target in 0.78.0 (`0015-cursor-dropped.md`), and the proxy path was re-declined in 0.80.0 (`0008-model-proxy-re-declined.md`).

## Decision
Bottega's method lives entirely in skills that run under Claude Code, Codex, and Cursor. Worker identities as agent files and the entry guard are removed. Model selection moves to a routing skill carrying a fixed model table, task rules, and per-host reach mechanics; enforcement shrinks to one portable rule (a run-owning session names a model on every worker start, never fable); GPT models inside Claude Code arrive natively through an optional local proxy, with `scripts/codex-exec` over the codex CLI as the fallback and the single assembly point for every codex launch.

## Context
Agent definition files are the one packaging surface with no cross-harness equivalent, and most dispatches never used them. The observed cost failures (silent fable inheritance) are prevented by the explicit-model rule alone. The full research record is in docs/specs/cross-harness.md.

## Consequences
New models are registry rows, not doctrine edits. Cloud-hosted runs degrade to single-family plus bridge; the proxy is local equipment. The route guard's named-seat checks and workflow parsing go with the seats they policed.
