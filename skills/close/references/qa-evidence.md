# QA evidence publication

Publish each scenario's evidence to the evidence repository and link it from the PR body.

Use one private repository per GitHub owner, `<owner>/bottega-evidence`, holding every run's evidence files and nothing else. It carries no workflows, so a push builds nothing anywhere. Create it on first use (`gh repo create <owner>/bottega-evidence --private`). Commit the run's files under `<project>/<run-slug>/` on the default branch and push with the same credentials you already use for GitHub. History only grows, so a commit-pinned link never breaks.

For each scenario, render the recording as a gif and keep the full recording beside it. ffmpeg with a palette pass, 8 to 12 fps, and about 960px width keeps UI text readable at a few megabytes. Split a long drive by scenario.

Link both in the PR body under the scenario's verdict, as commit-pinned blob URLs. The gif's blob page plays the walkthrough in the browser for any reader with repository access, so watching it takes one click. The full recording is the fidelity copy. GitHub serves raw video files as downloads, never inline, so the gif carries the review and the recording carries the proof.
