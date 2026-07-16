# Issue labels

Each Bottega issue uses independent label axes. Ownership says where the change
lives, readiness says who can take it next, and activity says whether an agent
currently claims it. Readiness is not activity.

## Ownership: `area:*`

Every issue carries at least one `area:*` label. Add more only when the work
genuinely crosses ownership boundaries.

| Label | Ownership |
| --- | --- |
| `area:plugin` | Claude Code and Codex manifests, marketplace entries, and installation surface |
| `area:skills` | Shared methods under `skills/` |
| `area:agents` | Worker identities under `agents/` |
| `area:transports` | External adapters and their shared boundaries under `scripts/` |
| `area:hooks` | Claude-only routing and entry hooks |
| `area:docs` | Documentation that does not belong to a more specific area |
| `area:repo` | Root tooling, tests, CI, release policy, and cross-cutting work |

Use colour `#006B75` for every ownership label so the axis is visually stable.

## Readiness

| Label | Meaning |
| --- | --- |
| `needs-triage` | A maintainer must evaluate and classify the issue |
| `needs-info` | More information is required from the reporter |
| `ready-for-agent` | The issue is specified for autonomous implementation |
| `ready-for-human` | A person must implement or decide the remaining work |
| `wontfix` | The issue will not be actioned |

An issue has at most one readiness label. Replace the old readiness label when
its state changes.

## Activity

`agent:working` is the only activity label. It is combined with assignment and
the read-back claim comment defined in
[`repository-workflow.md`](repository-workflow.md). Remove it after merge or when
the claim is released.

## Creating the labels

This document is the canonical vocabulary. Repository maintainers create or
update each label with the GitHub settings page or:

```bash
gh label create <name> --color <rrggbb> --description <text> --force
```

Use `006B75` for ownership, `5319E7` for readiness, and `FBCA04` for
`agent:working`.
