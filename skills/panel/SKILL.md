---
name: panel
description: Put one costly decision to independent drafts from different companies' models, blinded, with a judge that only compares them, and write the decision yourself. Use when the user asks for a panel or a fusion pass, or when a run reaches a decision meeting the three conditions below.
argument-hint: "<the decision>"
---

# Panel

Run the whole panel yourself: frame the decision, dispatch the seats, and write the final answer. The panel neither votes nor decides. It returns independent drafts and a structured comparison.

Pay for a seat only when three conditions are all true. The decision is open: several defensible answers, and neither the repository nor a standard solution settles it. Wrong is costly: expensive to reverse after merge, or hard to notice until it is. And no cheap check settles it: a question a test, spike, benchmark, or prototype can answer gets that check instead, because the check returns ground truth, while the seats, grounded but read-only, can only return arguments. A panel generates answers to a question nobody has answered yet. A critique of an existing answer (a plan, a diff, a spec) is a review, never a panel.

## 1. Frame the task

Write one self-contained task: the question, the constraints that bind it, and the repository paths that hold the evidence. State no preferred answer. Test it this way: a seat holding only this text and the repository can answer. If it would need the current conversation, keep writing. Evidence a seat cannot reach (decisions from this conversation, private threads) goes into the task as text. Everything public a seat retrieves for itself.

Make a session directory (`mktemp -d`) and save the task as `task.md`, ending with the contract every seat answers to:

```
Ground the answer in the repository and in sources you search or fetch.
Reply in four sections: Answer (complete, self-contained);
Claims the answer rests on; Assumptions; What would change this answer.
Write the reply so it carries no model or company identity.
```

## 2. Seat the panel

Seat one model per company, and give every seat the same `task.md` verbatim. Keep every seat read-only in the repository and grounded twice over: it discovers the repository itself, and it searches the web itself. Model diversity is what the panel pays for, so the seats are the one place outside the cross-reads where a run dispatches another company's model. The defaults are the two companies bottega runs on:

| seat | dispatch |
| --- | --- |
| codex | one read-only codex dispatch per `bottega:using-codex`: gpt-5.6-sol at max, web search on, the draft to `<session>/codex-draft.md` |
| claude | one subagent on opus-5, given `task.md` verbatim, the draft returned as its report |

Give another company's CLI installed on the machine a further seat under the same task, read-only with its own web search. The seats are the panel's own: this table names their models, the way the review names its engines.

## 3. Fan out

Dispatch every seat in parallel and wait for all of them. Record a seat that errors, times out, or returns an empty draft, and continue the panel. With two or more drafts, proceed. With one draft, take a second independent draft from the strongest seat that answered, same task verbatim, fresh dispatch: two runs of one strong model still fuse, because independent runs cover different considerations. Only when no seat answers at all is there no panel: report the failures and answer solo, saying so.

## 4. Blind

Copy the drafts to `A.md`, `B.md`, ... in an order unrelated to the seat list, and cut any line that reveals which model wrote one. From here refer to every draft by letter. The blinding is for the judge. You still know the mapping, so at synthesis weigh evidence, never authorship.

## 5. Judge, compare only

Send one fresh dispatch, same mechanics as the claude seat, given `task.md`, the blinded drafts, and this brief:

```
Compare the drafts against the task. Report exactly five sections,
each quoting the drafts as evidence: Consensus; Contradictions;
Partial coverage; Unique insights; Blind spots.
Do not answer the task, merge the drafts, vote, grade, or pick one.
```

## 6. Synthesize

Write the decision yourself, from the drafts and the comparison: build on the consensus after checking it against the repository the same way as anything else (agreement between models marks coverage, never correctness), resolve each contradiction by the stronger evidence, keep the unique insights that survive the same check, and close or explicitly flag the blind spots. Record the decision and what the panel changed wherever your context records decisions, so a run puts it in its design and the PR body, and a conversation puts it in the reply.
