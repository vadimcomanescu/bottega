# QA evidence publication

Publish screenshots, walkthrough gifs, and full recordings from the evidence repository: one repository per GitHub owner, `<owner>/bottega-evidence`, holding every run's evidence files and nothing else. It carries no workflows, so a push builds nothing anywhere. Create it on first use (`gh repo create <owner>/bottega-evidence --public`); make it private only when the owner's projects must not expose their interfaces publicly. Commit the run's files under `<project>/<run-slug>/` on the default branch; history only grows, so a commit-pinned URL never breaks.

Render each scenario's walkthrough as a gif under 10 MB (split a long drive by scenario) and keep the full recording beside it.

With a public evidence repository:

- Embed each gif and screenshot in the PR body with its commit-pinned raw URL and a one-line caption carrying the scenario's verdict. A gif autoplays inline, so the walkthrough plays on the PR itself.
- Link each full recording beside its gif; GitHub does not play raw video files inline.

With a private evidence repository, GitHub's anonymous image proxy cannot fetch raw URLs, so an inline embed renders for no viewer: link each file's blob page with its caption instead.
