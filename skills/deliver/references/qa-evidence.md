# QA evidence publication

Publish screenshots, walkthrough gifs, and full recordings from `bottega/evidence-<slug>`. That branch is permanent: it never merges and is never deleted, because deleting it breaks every image the PR embeds, retroactively and for every viewer.

Check the host repo's visibility first (`gh repo view --json visibility`):

- Public: embed screenshots and gifs in the PR body with commit-pinned raw URLs.
- Private: link each screenshot's blob page with a one-line caption. GitHub renders markdown images through an anonymous proxy that cannot authenticate to a private repo, so an inline image renders for no viewer there.

Keep each gif under 10 MB; split a long drive by scenario. Link each full recording beside its gif, because GitHub does not play video files inline.
