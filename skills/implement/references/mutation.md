# Mutation

Mutate the lines your diff changed, and let your slice's tests try to kill the mutants.

Look for a Stryker config in the workspaces your diff touches. If there is none, skip mutation and say so in your report.

Run Stryker from the workspace that holds your files:

```
npx stryker run --mutate <file>:<start>-<end> --testFiles <your slice's test files>
```

Pass one range for each changed hunk. Paths resolve from the directory you run in. A range cannot contain a glob. The `--testFiles` flag needs Stryker 9.5.0 or newer.

A survivor is a mutant that no test killed. Judge each one:

- If no test exercises the mutated branch, write the test that kills it.
- If the mutant does not change behavior, it is equivalent. Report it and move on.
- If the mutated guard is redundant because the code after it already handles the same case, simplify the code instead of writing a test, and report that.

A mutant that only a test outside your `--testFiles` list would kill shows up as a survivor. Check for that before you write a new test.
