# QA evidence publication

Attach the QA evidence to the open PR itself. GitHub rehosts each attached file at a `user-attachments` URL independent of any branch, plays MP4, MOV, and WebM inline, and serves attachments on a private repo to every reader who can open the PR. GitHub exposes no API for this upload, so the browser drives it.

1. With the harness browser tool, under a GitHub session that can comment on the repo, open the PR and post one evidence comment: per scenario, the verdict, a one-line caption, and the recording or screenshot attached through the comment box.
2. Reload the PR and confirm every video renders as an inline player and every image displays; a bare filename link means the upload did not take.

Per-file limits: images and gifs 10 MB; videos 10 MB on a free plan, 100 MB on a paid one. Split a long drive by scenario, or re-encode to fit (H.264 MP4 has the widest browser support).

On a machine with no GitHub-authenticated browser session, report the local evidence paths in the close report so the owner can attach them by hand.
