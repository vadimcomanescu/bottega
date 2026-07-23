# Live-document review

The editor is Proof, a collaborative markdown editor reachable as a plain URL with no account and no install. Every write carries a stable agent identity (`by` on the op, `X-Agent-Id` on the header); pick one hyphenated id for the session and keep it on every call.

## Publish

Create the shared document from the local file, failing closed on an HTTP error. Stop and report if `slug` or `accessToken` comes back empty or null; do not proceed on a partial response.

    RESP=$(jq -n --arg title "$TITLE" --rawfile md "$LOCAL" '{title:$title, markdown:$md}' \
      | curl -fsS -X POST https://www.proofeditor.ai/share/markdown \
        -H "Content-Type: application/json" -d @-) || { echo "publish failed"; exit 1; }
    SLUG=$(printf '%s' "$RESP" | jq -r '.slug')
    TOKEN=$(printf '%s' "$RESP" | jq -r '.accessToken')
    [ -n "$SLUG" ] && [ "$SLUG" != "null" ] && [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ] \
      || { echo "publish returned no slug or token"; exit 1; }
    printf '%s' "$RESP" | jq -r '.tokenUrl'

The `tokenUrl` is a live access credential: it grants edit rights to anyone who holds it. Hand it to the owner in the session conversation only, and never write it into an issue, a PR, a log, or any other durable surface. When an agent-scoped response (`/presence`, `/state`) carries `_links`, prefer those API paths over the literal routes below if they ever differ; the create response's `_links` advertise the web surface, not these routes.

Bind your display name once with `POST /api/agent/$SLUG/presence` (`x-share-token`, `X-Agent-Id`, body `{"name":"...","status":"reading"}`).

## Read the threads

Read comment marks, filtered server-side to comments:

    curl -fsS "https://www.proofeditor.ai/api/agent/$SLUG/state?kinds=comment" -H "x-share-token: $TOKEN"

A thread needs your attention when its mark is a comment, authored by the owner (not you), unresolved, and its latest entry is the owner's, newer than any reply of yours. Skip everything else. Capture `mutationBase.token` from the read: every mutation carries it as `baseToken`, and each successful response returns the next one. On `STALE_BASE` or `BASE_TOKEN_REQUIRED`, re-read `/state` and retry once with a fresh idempotency key.

## Reply and edit

Mutations go to `POST /api/agent/$SLUG/ops` (single write) with headers `x-share-token`, `X-Agent-Id`, and an `Idempotency-Key`.

- Reply in a thread, resolving it when it is settled: `{"type":"comment.reply","markId":"<id>","by":"<id>","text":"...","resolve":true,"baseToken":"<t>"}`. Leave `resolve` off while the thread waits on the owner.
- Propose a change as a tracked edit the owner accepts or rejects: `{"type":"suggestion.add","kind":"replace","quote":"<original>","content":"<new>","by":"<id>","baseToken":"<t>"}`. Add `"status":"accepted"` to commit it now as a tracked change with a reject-to-revert affordance.
- Accept or reject an existing suggestion: `{"type":"suggestion.accept","markId":"<id>","by":"<id>","baseToken":"<t>"}` (or `suggestion.reject`).
- Batch existing-thread replies and resolves in one call: `{"by":"<id>","baseToken":"<t>","operations":[ ... ]}`.

For a structural change with no text anchor (a new section), read `/api/agent/$SLUG/snapshot` for block refs and `mutationBase.token`, then `POST /api/agent/$SLUG/edit/v2` with a `replace_block` or `insert_after` operation:

    {"by":"<id>","baseToken":"<t>","operations":[
      {"op":"replace_block","ref":"<block-ref>","block":{"markdown":"<new block markdown>"}}
    ]}

Re-read `/snapshot` before a follow-up block edit if any write has landed, because block refs go stale.

Reuse the same `Idempotency-Key` only when you resend the exact same serialized body after a timeout or 5xx; mint a fresh key for a new logical mutation or a body rebuilt after `STALE_BASE`. An error response is not proof nothing was written: on a 5xx, timeout, or a 202 with `collab.status: "pending"`, re-read `/state` and check whether the mark or edit is already present before retrying, so a thread is not answered twice.

## Mirror back

Mirror the agreed state to the local file byte-for-byte: fetch state failing closed, confirm `.markdown` is present and a string, then stream it to a temp sibling and rename atomically so trailing newlines survive. On anything else, stop and report; never touch the local file.

    STATE_TMP=$(mktemp)
    curl -fsS "https://www.proofeditor.ai/api/agent/$SLUG/state" -H "x-share-token: $TOKEN" > "$STATE_TMP" \
      || { echo "state fetch failed"; rm -f "$STATE_TMP"; exit 1; }
    [ "$(jq -r 'if (.markdown | type) == "string" then "ok" else "bad" end' "$STATE_TMP")" = "ok" ] \
      || { echo "no markdown string in state"; rm -f "$STATE_TMP"; exit 1; }
    TMP=$(mktemp "${LOCAL}.proof-sync.XXXXXX")
    jq -jr '.markdown' "$STATE_TMP" > "$TMP" || { echo "markdown write failed"; rm -f "$TMP" "$STATE_TMP"; exit 1; }
    mv "$TMP" "$LOCAL" || { echo "rename failed"; rm -f "$TMP" "$STATE_TMP"; exit 1; }
    rm -f "$STATE_TMP" || true
