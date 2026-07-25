---
name: spec
description: Write, present, and commit an agreed spec from discovery's findings. Use bottega:spec when the user wants work shaped into an agreed spec rather than delivered now; a run's Spec phase uses it whole. Never use proactively.
argument-hint: "<task, issue URL, or direction>"
---

# Spec

Produce a spec the user approves, without implementing the task. This method starts from discovery's findings: when none exist yet, use `bottega:discover` first.

When the branch already carries a spec file, start there: show the user what you found and confirm it is the work to do, then run the same method to refine it against the current codebase. An agreed mark never skips this; the code has moved since it was written.

## 1. Write

Keep the spec simple and let the artifacts carry the detail: state each decision in a sentence and point at the prototype sources and references discovery produced; a rendered mockup or a pointed-at implementation tells a builder more than prose describing it. Prototype code is evidence, never truth: it never merges into the product, and the build rewrites it from the agreed spec. A decision that reverses an earlier verdict names that verdict and the evidence that changed the call, in the spec.

[references/spec-format.md](references/spec-format.md) gives the document's shape and prose rules: start from that floor and let discovery's findings drive the rest. It is a floor, never a template to fill. As decisions settle, resolve the domain terms the work introduces or sharpens (the method is in `bottega:codebase-design`) and record them in the spec. Write no `CONTEXT.md` or `docs/adr/` entry from this session; the run that builds the spec writes those after approval.

## 2. Present

The shared editor is hosted, so the spec passes through its operator's servers. Offer it to the user first; a user who cannot accept that declines it, and the same review happens in the conversation, the spec presented as text.

Present the spec as a live shared document: the user reads it rendered, on any device, and comments on the text directly. [references/live-review.md](references/live-review.md) has the mechanics; load it here. Reply inside each comment thread, saying whether you agree and why, and make any resulting change as a tracked edit the user accepts or rejects. Threads resolve as they settle. The local markdown file stays the single source of truth: mirror the agreed state back to it; it is the file publish commits.

The user's approval may arrive as a comment in the document, in their own words; that is the go signal, the same as a reply in the conversation.

On approval, set the spec's status line to agreed ([references/spec-format.md](references/spec-format.md)) and commit it as `docs/specs/<YYYY-MM-DD>-<slug>.md` (dated the day it was agreed), with any prototype screenshots it embeds and the prototype sources that produced them, under `docs/specs/assets/<slug>/`, on the current work branch, creating `bottega/<slug>` now when none exists. This file is the spec; no other artifact is.

In an autonomous run there is no user to present to: skip the shared document, write the spec, set its status line to agreed on your own authority, and commit it to the same path. The user's veto point is the PR's decisions list.

## 3. Publish

The method ends at the committed spec. When the branch existed before this method ran, there is nothing more to do. When this method created it, ask the user once whether to push, then wait. On yes, push and report it: it is the work branch a later run continues, and its PR merges the spec to trunk with the code that fulfils it (`docs/adr/0007-spec-status-in-the-file.md`). On no, delete the branch, local and remote if pushed, before the session ends; the settled decisions already live in the spec's words.
