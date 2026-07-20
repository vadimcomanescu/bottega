---
name: panel
argument-hint: "<the decision>"
description: Put one costly decision to independent drafts from different model families, blinded, with a compare-only judge; the caller synthesizes the answer. Use when the user asks for a panel, a fusion pass, or second opinions on a decision, or from a run's Plan phase when a decision is expensive to reverse and the repository does not already answer it.
---

# Panel

You run the whole panel yourself: frame the decision, dispatch the seats, and write the final answer. The panel does not vote or decide; it returns independent drafts and a structured comparison, and the decision stays yours.

## Process

### 1. Frame the task

Write one self-contained task: the question, the constraints that bind it, and the repository paths that hold the evidence. State no preferred answer. The test: a seat holding only this text and the repository can answer; if it would need the current conversation, keep writing. Evidence a seat cannot reach (decisions from this conversation, private threads) goes into the task as text; everything public a seat retrieves for itself.

Make a session directory (`mktemp -d`) and save the task as `task.md`, ending with the contract every seat answers to:

```
Ground the answer in the repository and in sources you search or fetch.
Reply in four sections: Answer (complete, self-contained);
Claims the answer rests on; Assumptions; What would change this answer.
Write the reply so it carries no model or vendor identity.
```

### 2. Seat the panel

One seat per model family, and the same `task.md` verbatim to every seat. Every seat is read-only in the repository and grounded twice over: it discovers the repository itself, and it searches the web itself. The defaults are the two families bottega runs on:

| seat | dispatch (from the repository root) |
| --- | --- |
| codex | `scripts/codex-exec` at the bottega install root (`$CLAUDE_PLUGIN_ROOT` when installed as a plugin), with `--model gpt-5.6-sol --effort max --sandbox read-only --search --cwd <repo> --brief task.md --out codex-draft.md --events codex-events.jsonl`, every path absolute |
| claude | `claude -p --model claude-fable-5 < task.md > claude-draft.md` |

Another family's CLI installed on the machine takes a further seat under the same task, read-only with its own web search. Inside a run, the routing table in `skills/maestro/SKILL.md` governs the seat models.

### 3. Fan out

Dispatch every seat in parallel and wait for all of them. A seat that errors, times out, or returns an empty draft is recorded and the panel continues. With two or more drafts, proceed. With fewer there is no panel: report which seats failed and answer solo, saying so, rather than comparing one draft with itself.

### 4. Blind

Copy the drafts to `A.md`, `B.md`, ... in an order unrelated to the seat list, and cut any line that reveals which model wrote one. From here every reference is by letter. The blinding is for the judge; you still know the mapping, so at synthesis weigh evidence, never authorship.

### 5. Judge, compare only

One fresh dispatch, same mechanics as the claude seat, given `task.md`, the blinded drafts, and this brief:

```
Compare the drafts against the task. Report exactly five sections,
each quoting the drafts as evidence: Consensus; Contradictions;
Partial coverage; Unique insights; Blind spots.
Do not answer the task, merge the drafts, vote, grade, or pick one.
```

### 6. Synthesize

You write the decision from the drafts and the comparison: build on the consensus, resolve each contradiction by the stronger evidence, keep the unique insights that survive a check against the repository, and close or explicitly flag the blind spots. Record the decision and what the panel changed wherever your context records decisions: a run puts it in the run brief and the PR; a conversation puts it in the reply.
