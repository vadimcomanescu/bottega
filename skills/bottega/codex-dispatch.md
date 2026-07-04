# Codex dispatch grammar

Every codex seat is one `codex exec` invocation, fully specified so it runs identically on any host: `--ignore-user-config` always (the machine's config, model, and notify hooks are ignored — auth still resolves from `CODEX_HOME`); model and effort verbatim from the routing table; the `--json` event stream (stdout — redirect it) and the `-o` final message both captured as evidence. The run blocks to completion: launch it as a background shell, collect both files. A failed invocation is reported with its stderr, never worked around.

One-turn seats (review, clerk mechanics):

```
codex exec --ignore-user-config -m <model> -c model_reasoning_effort=<effort> -s <sandbox> -C <worktree> --json -o <msg> < brief.md > <events>
```

Builders take `-s workspace-write`; read-only seats take `-s read-only`.

## The two-brief builder ceremony

Codex sandboxes deny writes under a shared gitdir, so a codex builder in a slice worktree cannot commit — verified, never solved with `danger-full-access`. Builder briefs contain no git commands; the dispatching clerk owns the ceremony: pre-creates worktree and branch, then splits the build into two turns on one thread so the commit grammar survives. Authorship stays with the builder; the clerk never writes implementation code. Both turns run from inside the slice worktree.

**RED — failing tests.** Plain `exec`:

```
codex exec --ignore-user-config -m <model> -c model_reasoning_effort=<effort> -s workspace-write -C <worktree> --json -o red-msg.txt < brief-red.md > red-events.jsonl
```

The clerk verifies the tests fail on the assertion and commits RED. The thread id is the `thread_id` field of the `thread.started` event in `red-events.jsonl`.

**GREEN — implement to green.** Resume by that id — never `--resume`/`--last`, which select by cwd and pick the wrong session under parallel slices. `resume` drops exactly two of `exec`'s flags; every other flag is repeated verbatim. Both dropped flags are load-bearing:

- no `-s`: the sandbox defaults to read-only — pass `-c sandbox_mode=workspace-write` or the turn is a silent no-op that still exits 0;
- no `-C`: the writable root and the builder's file paths follow the process cwd — running from inside the slice worktree is what puts GREEN in the right tree.

```
codex exec resume <thread-id> --ignore-user-config -m <model> -c model_reasoning_effort=<effort> -c sandbox_mode=workspace-write --json -o green-msg.txt - < brief-green.md > green-events.jsonl
```

(`-` is resume's read-the-brief-from-stdin marker.) The clerk runs the gate and commits green.

The thread is context reuse, not a requirement: it lives only in that host's `CODEX_HOME` and dies with the seat. Reclaiming a seat that finished RED, dispatch GREEN as a fresh `exec` with a self-contained brief — RED is already committed.
