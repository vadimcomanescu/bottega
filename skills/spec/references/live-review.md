# Live-document review

The mechanics of Present: put the spec on a shared rendered document, hold the review as threaded comments, and mirror the agreed markdown back to the local file. The editor is Proof, a collaborative markdown editor reachable as a plain URL with no account and no install. Every write carries a stable agent identity (`by` on the op, `X-Agent-Id` on the header); pick one hyphenated id for the session and keep it on every call.

## Publish

JSON-encode the local markdown file so newlines and quotes survive, and create the shared document. Hand the owner the returned `tokenUrl`.

    RESP=$(jq -n --arg title "$TITLE" --rawfile md "$LOCAL" '{title:$title, markdown:$md}' \
      | curl -s -X POST https://www.proofeditor.ai/share/markdown \
        -H "Content-Type: application/json" -d @-)
    SLUG=$(printf '%s' "$RESP" | jq -r '.slug')
    TOKEN=$(printf '%s' "$RESP" | jq -r '.accessToken')
    printf '%s' "$RESP" | jq -r '.tokenUrl'

Bind your display name once with `POST /api/agent/$SLUG/presence` (`x-share-token`, `X-Agent-Id`, body `{"name":"...","status":"reading"}`). Publishing syncs nothing back on its own; the local file stays canonical.

## Read the threads

Read comment marks, filtered server-side to comments:

    curl -s "https://www.proofeditor.ai/api/agent/$SLUG/state?kinds=comment" -H "x-share-token: $TOKEN"

A thread needs your attention when its mark is a comment, authored by the owner (not you), unresolved, and its latest entry is the owner's, newer than any reply of yours. Skip everything else. Capture `mutationBase.token` from the read: every mutation carries it as `baseToken`, and each successful response returns the next one. On `STALE_BASE` or `BASE_TOKEN_REQUIRED`, re-read `/state` and retry once with a fresh idempotency key.

## Reply and edit

Mutations go to `POST /api/agent/$SLUG/ops` (single write) with headers `x-share-token`, `X-Agent-Id`, and a fresh `Idempotency-Key`.

- Reply in a thread, resolving it when it is settled: `{"type":"comment.reply","markId":"<id>","by":"<id>","text":"...","resolve":true,"baseToken":"<t>"}`. Leave `resolve` off while the thread waits on the owner.
- Propose a change as a tracked edit the owner accepts or rejects: `{"type":"suggestion.add","kind":"replace","quote":"<original>","content":"<new>","by":"<id>","baseToken":"<t>"}`. Add `"status":"accepted"` to commit it now as a tracked change with a reject-to-revert affordance.
- Accept or reject an existing suggestion: `{"type":"suggestion.accept","markId":"<id>","by":"<id>","baseToken":"<t>"}` (or `suggestion.reject`).
- Batch existing-thread replies and resolves in one call: `{"by":"<id>","baseToken":"<t>","operations":[ ... ]}`.

For a structural change with no text anchor (a new section), read `/api/agent/$SLUG/snapshot` for block refs and use `POST /api/agent/$SLUG/edit/v2` with `insert_after` / `replace_block` operations. Re-read `/snapshot` before a follow-up block edit if any write has landed.

An error response is not proof nothing was written: on a 5xx, timeout, or a 202 with `collab.status: "pending"`, re-read `/state` and check whether the mark or edit is already present before retrying, so a thread is not answered twice.

## Mirror back

When the document says what the owner wants built, its approval may arrive as an owner comment in the document, in their own words. Mirror the agreed state to the local file byte-for-byte: stream the markdown straight to disk so trailing newlines survive, and rename atomically.

    STATE_TMP=$(mktemp)
    curl -s "https://www.proofeditor.ai/api/agent/$SLUG/state" -H "x-share-token: $TOKEN" > "$STATE_TMP"
    TMP="${LOCAL}.proof-sync.$$"
    jq -jr '.markdown' "$STATE_TMP" > "$TMP" && mv "$TMP" "$LOCAL"
    rm "$STATE_TMP"

The local file is now the single source of truth again, and it is what the ticket carries.
