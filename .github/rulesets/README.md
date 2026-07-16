# Main merge gate

`main.json` is the repository's reviewed source for the `main` branch ruleset.
It requires pull requests, resolved review conversations, an up-to-date branch,
the release version and test checks, squash-only merges, and no force pushes,
branch deletion, or bypass actors.

The ruleset is not applied by committing this file. A repository maintainer must
review it after merge and apply it through GitHub repository settings or with an
authenticated CLI:

```bash
gh api -X POST repos/vadimcomanescu/bottega/rulesets \
  --input .github/rulesets/main.json
```

Before creating a ruleset, list the existing repository rulesets and update the
matching one instead of creating a duplicate. If a release workflow job name
changes, update its `name:` field and the corresponding required check context
in `main.json` in the same pull request.
