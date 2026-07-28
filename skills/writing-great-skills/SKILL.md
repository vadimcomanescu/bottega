---
name: writing-great-skills
description: Reference for predictable skill writing. Use when creating, editing, or evaluating any skill file, including SKILL.md, references, assets, schemas, and agent files.
---

# Writing great skills

Hold every skill you write to one virtue: **predictability**, the agent taking the same _process_ every run, not producing the same output. Every lever below serves it.

**Bold terms** are defined in [`GLOSSARY.md`](GLOSSARY.md). Look them up there for the full meaning.

## Invocation

You choose between two invocation modes, trading different costs:

- A **model-invoked** skill keeps a **description**, so the agent can fire it autonomously _and_ other skills can reach it (you can still type its name too). It contributes to **context load**: the description sits in the window every turn. Mechanics: omit `disable-model-invocation`, and write a model-facing description with rich trigger phrasing ("Use when the user wants…, mentions…").
- A **user-invoked** skill strips the description from the agent's reach. Only the user, typing its name, can invoke it, and no other skill can. Zero context load, but it spends **cognitive load**: the user is the index that must remember it exists. Mechanics: set `disable-model-invocation: true`. The `description` becomes human-facing, a one-line summary with trigger lists stripped.

Pick model-invocation only when the agent must reach the skill on its own, or another skill must. If it only ever fires by hand, make it user-invoked and pay no context load.

When user-invoked skills multiply past what the user can remember, cure that piled-up cognitive load with a **router skill**: one user-invoked skill that names the others and when to reach for each.

## Writing the description

A model-invoked **description** does two jobs: state what the skill is, and list the **branches** that should trigger it. Every word increases **context load**, so prune a description even harder than the body:

- **Front-load the skill's leading word.** The description is where it does its invocation work.
- **One trigger per branch.** Synonyms that rename a single branch are **duplication**: "build features using TDD … asks for test-first development" is one branch written twice. Collapse them, and keep only genuinely distinct branches.
- **Cut identity that's already in the body.** Keep the description to triggers, plus any "when another skill needs…" reach clause.

## Information hierarchy

Build a skill from two content types, **steps** and **reference**, mixed freely: a skill can be all steps, all reference, or both. The core decision is which to use and where each sits on the **information hierarchy**, a ladder ranked by how immediately the agent needs the material:

1. **In-skill step**, an ordered action in `SKILL.md`, the primary tier: what the agent does, in order. Give each step a finish line the agent can check, stated in the step's own sentences, and make it _exhaustive_ where it matters ("every modified model accounted for", not "produce a change list"). A vague finish line invites **premature completion**.
2. **In-skill reference**, a definition, rule, or fact in `SKILL.md`, consulted on demand. Often a legitimately flat peer-set (every rule of a review on one rung), a fine arrangement, not a smell. _This skill is all reference._
3. **External reference**, reference pushed out of `SKILL.md` into a separate file, reached by a **context pointer**, loaded only when the pointer fires. (Spans _disclosed_ reference, a sibling file like `GLOSSARY.md` still part of the skill, through fully **external reference**, a plain file outside any one skill that several skills point at.) The outermost home is still inside what ships with the skills, for a plugin the delivered tree, never the surrounding repository: a skill's rule stands on its own sentences instead of citing the repository's decision records.

A demanding finish line drives thorough **legwork**, the digging the agent does within the work, whether the skill has steps or not, since "every rule applied" binds flat reference just as "every step done" binds a sequence.

Push too little down and the top bloats. Push too much and you hide material the agent actually needs. That tension is the whole decision.

**Progressive disclosure** is the move down the ladder, out of `SKILL.md` into a linked file, so the top stays legible. Mechanics: a linked `.md` file in the skill folder, named for what it holds (this skill discloses its full definitions to `GLOSSARY.md`). Some skills are used in more than one way, and each distinct way is a **branch**: different runs taking different paths through the skill. Branching is the cleanest disclosure test: inline what every branch needs, and push behind a pointer what only some branches reach. A **context pointer**'s _wording_, not its target, decides when and how reliably the agent reaches the material.

Where the ladder decides _how far down_ a piece sits, **co-location** decides _what sits beside it_ once there: keep a concept's definition, rules, and caveats under one heading rather than scattered, so reading one part brings its neighbours with it.

## When to split

**Granularity** is how finely you divide skills, and each cut spends one of the two loads, so split only when the cut earns it. Two cuts:

- **By invocation**: split off a **model-invoked** skill when you have a distinct **leading word** that should trigger it on its own, or another skill must reach it. You pay **context load** for the new always-loaded **description**, so that independent reach has to be worth it.
- **By sequence**: split a run of **steps** when the steps still ahead (a step's **post-completion steps**) tempt the agent to rush the one in front of it (**premature completion**). Keeping them out of view encourages the agent to do more **legwork** on the current task.

## Pruning

Keep each meaning in a **single source of truth**: one authoritative place, so changing the behaviour is a one-place edit.

Check every line for **relevance**: does it still say something about what the skill does?

Then hunt **no-ops** sentence by sentence, not just line by line. Run the no-op test on each sentence in isolation, and when one fails, delete the whole sentence rather than trim words from it. Be aggressive: most prose that fails should go, not be rewritten.

## Leading words

A **leading word** is a compact concept already living in the model's pretraining that the agent thinks with while running the skill (e.g. _lesson_, _fog of war_, _tracer bullets_). Repeated throughout the text (though not necessarily: a strong leading word might only be needed once), it accumulates a distributed definition and anchors a whole region of behaviour in the fewest tokens, by recruiting priors the model already holds.

It serves predictability twice. In the body it anchors _execution_: the agent reaches for the same behaviour every time the word appears. In the description it anchors _invocation_: when the same word lives in your prompts, docs, and code, the agent links that shared language to the skill and fires it more reliably.

Hunt for opportunities to refactor skills to use leading words. A triad spelled out at three sites (**duplication**), a description spending a sentence to gesture at one idea: each is a passage begging to **collapse** into a single token. Examples include:

- "fast, deterministic, low-overhead" -> _tight_: one quality restated across a phase, collapsed into a single pretrained word (a _tight_ loop).
- "a loop you believe in" -> _red_: converts a fuzzy gate into a binary observable state (the loop goes _red_ on the bug, or it doesn't).

You win twice over: fewer tokens, _and_ a sharper hook for the agent to hang its thinking on. Assume every skill is carrying restatements that leading words retire, and go find them.

## Failure modes

Use these to diagnose issues the user may be having with the skill.

- **Premature completion**: ending a step before it's genuinely done, attention slipping to _being done_. Defence, in order: sharpen the step's finish line first (cheap, local), and only if it is irreducibly fuzzy _and_ you observe the rush, hide the post-completion steps by splitting (the sequence cut).
- **Duplication**: the same meaning in more than one place. Costs maintenance and tokens, and inflates a meaning's prominence on the ladder past its real rank.
- **Sediment**: stale layers that settle because adding feels safe and removing feels risky. The default fate of any skill without a pruning discipline.
- **Sprawl**: a skill simply too long, even when every line is live and unique. Hurts readability and maintainability and wastes tokens. The cure is the ladder: disclose **reference** behind pointers, and split by **branch** or sequence so each path carries only what it needs.
- **No-op**: a line the model already obeys by default, so you pay load to say nothing. The test: does it change behaviour versus the default? A weak leading word (_be thorough_ when the agent is already thorough-ish) is a no-op. The fix is a stronger word (_relentless_), not a different technique.
- **Negation**: steering by prohibition backfires. _Don't think of an elephant_ names the elephant and makes it more available, not less. Prompt the **positive**: state the target behaviour so the banned one is never spoken. Keep a prohibition only as a hard guardrail you can't phrase positively, and even then pair it with what to do instead.

## House format

Every skill in this repo shares one outer shape:

- Frontmatter stays universal, the open standard's fields: `name` equal to the directory name, and `description`. A harness-specific key is an exception a harness need must justify, kept to the minimum that need requires.
- An H1 in sentence case naming the skill, then one imperative sentence stating the outcome the skill delivers.
- A file loaded on demand is a markdown link (`[references/x.md](references/x.md)`). A skill that gets invoked is a backticked name (`bottega:panel`). Never a bare unlinked path.
- The body stays under 500 lines, references one level deep.

Write the body to the agent that will do the work, the way one person briefs a capable colleague:

- Address the reader directly and command: "you own the design", "send workers out", "fix it and say so in your report". Never describe the reader in the third person ("the builder is given one job") when you mean the agent holding the file.
- Say who the other person in the file is by writing as them. A skill the agent runs while its owner is in the conversation is that owner's brief, so it speaks in their voice: "you" is the agent, "I" and "me" are the owner ("ask me where I am in my thinking"). A skill dispatched to a fresh worker has no owner in the room, so it addresses the worker and names the orchestrator it reports to. The frontmatter description stays third person either way, because it is the model-facing trigger and not part of the conversation.
- Order the body as the work happens. Add a heading only when it shortens the read, and number headings only where the sequence itself is the instruction, a walkthrough someone resumes midway. Steps and reference mix freely, per the hierarchy above.
- Put each rule in the sentence where the work happens, and each step's finish line in the step's own prose ("each one hands you its slice with the gates green"), never as a trailing formula.
- Sentences end. A semicolon in prose is two sentences wearing one: split it. Periods, commas, colons, and parentheses do everything this repo's prose needs. Code keeps its own syntax.

## Checklist

Walk this list against the finished file after creating or editing any skill. Fix what fails and walk it again:

- [ ] The description is third person: the distinct triggers, one per **branch**, nothing else.
- [ ] The house format holds: frontmatter universal, H1 and opening sentence, pointer style, the body addressed to the working agent in the order the work happens.
- [ ] Every step's finish line is checkable in its own prose, and exhaustive where thin **legwork** would hurt.
- [ ] Each meaning has one home. No sentence fails the **no-op** test. No **sediment** survives the edit.
- [ ] Restated ideas are collapsed into a **leading word** where one exists.
- [ ] One term per concept and one concept per term, checked against the glossary the text belongs to. Prohibitions rephrased to the **positive** target.
- [ ] No semicolons and no em dashes in prose, the frontmatter description included.
