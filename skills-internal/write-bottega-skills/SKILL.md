---
name: write-bottega-skills
description: Bottega's own skill-writing doctrine, the house format, and the closing checklist. Use when creating, editing, or evaluating any skill file in this repository.
---

# Writing bottega skills

Hold every skill you write to one virtue: **predictability**, the agent taking the same _process_ every run, not producing the same output. Every lever below serves it.

**Bold terms** are defined in [`GLOSSARY.md`](GLOSSARY.md). Look them up there for the full meaning.

## The reader is a frontier model

A skill is a prompt reused across many requests, so it cannot be as specific as a prompt, and every line it keeps is context the reader pays for on each turn it stays loaded. Anthropic's guidance for this model generation is distilled into this skill's references, and the lessons below each point into them. When the generation moves, reread the sources named in those files and re-audit every skill, because instruction written for a prior generation over-prescribes the next: Anthropic cut over 80% of Claude Code's system prompt for Claude 5 era models and measured no loss.

- Instruction fails on both sides. Too specific, and the model follows the letter when a pivot would be right. Too vague, and it fills the gap with industry best practice that may not fit. Write a line only where you hold something the reader lacks: a decision made, a contract, an observed failure. The unknowns method for finding what a skill must say at all is [references/finding-unknowns.md](references/finding-unknowns.md).
- Two tests per line, either one cuts: could the reader derive it from the repo or from competence, and would the model already do it untold (a **no-op**)? A rule that only prevents a mistake a competent engineer would not make is noise. Keep an always or a never only where it pins an observed failure or a costly mistake.
- A brief instruction steers what enumeration used to. State the outcome once ("write code that reads like the surrounding code") and drop the list of behaviors it replaces. What the current generation does untold, where it still needs steering, and the short blocks that steer it are in [references/prompting-fable.md](references/prompting-fable.md).
- Overlapping instructions across surfaces (this skill, the map, the user's prompt) each cost the reader reconciliation before it acts, so give each rule one home.
- Examples constrain the exploration space. Design the interface instead: a schema, an enum, a parameter name carries the behavior an example used to hint at.
- The richest reference beats prose describing it. Point at code, a test suite, a rendered artifact, a rubric, and delete the description. What replaced the old context practices, surface by surface, is in [references/context-engineering.md](references/context-engineering.md).
- Read every worker rule as the weakest-equipped worker that will receive it: a codex worker has no slash commands, no subagents, no plugin root.

## Invocation

You choose between two invocation modes, and each one costs you something different:

- A **model-invoked** skill keeps a **description**, so the agent can fire it autonomously _and_ other skills can reach it (you can still type its name too). It contributes to **context load**: the description sits in the window every turn. Mechanics: omit `disable-model-invocation`, and write a model-facing description with rich trigger phrasing ("Use when the user wants…, mentions…").
- A **user-invoked** skill strips the description from the agent's reach. Only the user, typing its name, can invoke it, and no other skill can. Zero context load, but it spends **cognitive load**: nothing looks the skill up for the user, so they have to remember it exists. Mechanics: set `disable-model-invocation: true`. The `description` becomes human-facing, a one-line summary with trigger lists stripped.

Pick model-invocation only when the agent must reach the skill on its own, or another skill must. If it only ever fires by hand, make it user-invoked and pay no context load.

When user-invoked skills multiply past what the user can remember, cure that piled-up cognitive load with a **router skill**: one user-invoked skill that names the others and when to reach for each.

## Writing the description

A model-invoked **description** does two jobs: state what the skill is, and list the **branches** that should trigger it. Every word increases **context load**, so prune a description even harder than the body:

- **Front-load the skill's leading word.** The description is where it does its invocation work.
- **One trigger per branch.** Synonyms that rename a single branch are **duplication**: "build features using TDD … asks for test-first development" is one branch written twice. Collapse them, and keep only genuinely distinct branches.
- **Cut identity that's already in the body.** Keep the description to triggers, plus any "when another skill needs…" reach clause.

## Information hierarchy

Build a skill from two content types, **steps** and **reference**, mixed freely: a skill can be all steps, all reference, or both. The core decision is which to use and where each sits on the **information hierarchy**, a ladder ranked by how immediately the agent needs the material:

1. **In-skill step**, an ordered action in `SKILL.md`, the primary tier: what the agent does, in order. Give each step a **finish line** the agent can check, stated in the step's own sentences, and make it _exhaustive_ where it matters ("every modified model accounted for", not "produce a change list"). A vague finish line invites **premature completion**.
2. **In-skill reference**, a definition, rule, or fact in `SKILL.md`, consulted on demand. Often a legitimately flat peer-set (every rule of a review on one rung), a fine arrangement, not a smell. _This skill is all reference._
3. **External reference**, reference pushed out of `SKILL.md` into a separate file, reached by a **context pointer**, loaded only when the pointer fires. (This rung spans _disclosed_ reference, a sibling file like `GLOSSARY.md` that is still part of the skill, through fully **external reference**, a plain file outside any one skill that several skills point at.) The outermost home is still inside what ships with the skills, which for a plugin is the delivered tree and never the surrounding repository. A skill's rule stands on its own sentences instead of citing the repository's decision records.

A demanding **finish line** drives thorough **legwork**, the digging the agent does within the work, whether the skill has steps or not. "Every rule applied" binds flat reference just as "every step done" binds a sequence.

Push too little down and the top bloats. Push too much and you hide material the agent actually needs. Deciding how far down each piece goes is the whole of this choice.

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

A **leading word** is a compact concept already living in the model's pretraining that the agent thinks with while running the skill (e.g. _lesson_, _fog of war_, _tracer bullets_). Repeated through the text, it accumulates a distributed definition and anchors a whole region of behaviour in the fewest tokens, by recruiting priors the model already holds. Repetition is not required: a strong leading word might be needed only once.

It serves predictability twice. In the body it anchors _execution_: the agent reaches for the same behaviour every time the word appears. In the description it anchors _invocation_: when the same word lives in your prompts, docs, and code, the agent links that shared language to the skill and fires it more reliably.

Hunt for opportunities to refactor skills to use leading words. A triad spelled out at three sites (**duplication**), a description spending a sentence to gesture at one idea: each is a passage a single token can replace. Examples include:

- "fast, deterministic, low-overhead" -> _tight_: one quality restated across a phase, collapsed into a single pretrained word (a _tight_ loop).
- "a loop you believe in" -> _red_: converts a fuzzy gate into a binary observable state (the loop goes _red_ on the bug, or it doesn't).

You get both: fewer tokens, _and_ a word the agent reaches the same behaviour from every time. Assume every skill is carrying restatements that leading words retire, and go find them.

## Failure modes

Use these to diagnose issues the user may be having with the skill.

- **Premature completion**: ending a step before it's genuinely done, attention slipping to _being done_. Defence, in order: sharpen the step's **finish line** first, which is cheap and local. Only when it is irreducibly fuzzy _and_ you observe the rush do you hide the post-completion steps by splitting (the sequence cut).
- **Duplication**: the same meaning in more than one place. Costs maintenance and tokens, and inflates a meaning's prominence on the ladder past its real rank.
- **Sediment**: stale layers that settle because adding feels safe and removing feels risky. The default fate of any skill without a pruning discipline.
- **Sprawl**: a skill simply too long, even when every line is live and unique. Hurts readability and maintainability and wastes tokens. The cure is the ladder: disclose **reference** behind pointers, and split by **branch** or sequence so each path carries only what it needs.
- **No-op**: a line the model already obeys by default, so you pay load to say nothing. The test: does it change behaviour versus the default? A weak leading word (_be thorough_ when the agent is already thorough-ish) is a no-op. The fix is a stronger word (_relentless_), not a different technique.
- **Negation**: steering by prohibition backfires. _Don't think of an elephant_ names the elephant and makes it more available, not less. Prompt the positive: state the target behaviour so the banned one is never spoken. Keep a prohibition only as a hard guardrail you cannot phrase positively, and even then pair it with what to do instead.

## House rules

These rules govern every file's prose in this repo, code comments, UI strings, and hook messages included, not only skills.

- Write every sentence to the standard `bro` states: short sentences in simple tenses, one idea each, active voice, the subject and the articles kept, the same word for the same thing. Standard engineering terms only: no metaphors, no invented vocabulary, no theatrical naming. An adjective must choose among alternatives that exist, and a colon introduces a list or an example, never replaces "is" or "means".
- Banned tic-words, no exceptions: "bearing" (e.g. "judgment-bearing"), "bears on" (e.g. "the skills that bear on the task"), "ledger". Say the plain thing: "makes judgment calls", "the skills this work needs", "the log". The register binds bottega's own prose, so text vendored under a sync contract is synced as its author wrote it, never reworded to it.
- A claim about harness behavior (frontmatter keys, hooks, dispatch mechanics, model resolution) is read from the harness documentation at claim time, never from memory or another skill's prose.
- Skills are packaged per the Agent Skills open standard: one directory per capability, `SKILL.md` on top, supporting material inside it loaded on demand. An engine or reference a skill wraps lives inside that skill's directory, never as a sibling skill. The authoring and packaging contract is the harness documentation (https://code.claude.com/docs/en/skills) and the standard (https://agentskills.io), read at claim time. A skill references only its own directory, another skill, or a component the plugin ships. This repository's record under `docs/` and the root doctrine files never appear in a skill, because they do not install with it. A rule a skill states stands on its own sentences, with the decision record behind it left in the repository.
- Put durable constraints where the worker that must obey them will receive them. The orchestrator owns gates, routing, architecture, and exceptions. Do not script decisions that Fable can make from the repository and evidence.
- One placement rule everywhere. A skill defines reusable method or an independently invoked capability. A worker receives it per dispatch, never as a standing identity. A reference is supporting detail for one parent skill, loaded only in the phase that needs it. Hooks, schemas, tests, and workflow code enforce deterministic rules.
- Orchestrate with the harness primitives (subagents, tracked background Bash, workflows). The models already know them, so never add a polling loop, a hand-written scheduler, or prose that restates what the harness does.

## House format

Every skill in this repo shares one outer shape:

- Frontmatter stays universal, the open standard's fields: `name` equal to the directory name, and `description`. A harness-specific key is an exception, justified only by a harness need and kept to the minimum that need requires.
- An H1 in sentence case naming the skill, then one imperative sentence stating the outcome the skill delivers. A "You are" opening belongs only to an agent definition, whose body is a system prompt.
- A file loaded on demand is a markdown link (`[references/x.md](references/x.md)`). A skill that gets invoked is a backticked name (`panel`). Never a bare unlinked path.
- The body stays under 500 lines, references one level deep.

Write the body to the agent that will do the work, the way one person briefs a capable colleague:

- Address the reader directly and command: "you own the design", "send workers out", "fix it and say so in your report". Never describe the reader in the third person ("the builder is given one job") when you mean the agent holding the file.
- Say who the other person in the file is by writing as them. A skill the agent runs while its owner is in the conversation is that owner's brief, so it speaks in their voice: "you" is the agent, "I" and "me" are the owner ("ask me where I am in my thinking"). A skill dispatched to a fresh worker has no owner in the room, so it addresses the worker and names the orchestrator it reports to. The frontmatter description stays third person either way, because it is the model-facing trigger and not part of the conversation.
- Order the body as the work happens. Add a heading only when it shortens the read, and number headings only where the sequence itself is the instruction, a walkthrough someone resumes midway. Steps and reference mix freely, per the hierarchy above.
- Put each rule in the sentence where the work happens, and each step's **finish line** in the step's own prose ("each one hands you its slice with the gates green"), never as a trailing formula.
- A semicolon in prose joins two complete sentences, so write them as two. Periods, commas, colons, and parentheses do everything this repo's prose needs. Code keeps its own syntax.

## Checklist

Walk this list against the finished file after creating or editing any skill. Fix what fails and walk it again:

- [ ] The description is third person: the distinct triggers, one per **branch**, nothing else.
- [ ] The house format holds: frontmatter universal, H1 and opening sentence, pointer style, the body addressed to the working agent in the order the work happens.
- [ ] Every step's **finish line** is checkable in its own prose, and exhaustive where thin **legwork** would hurt.
- [ ] Each meaning has one home. No sentence fails the **no-op** test. No **sediment** survives the edit.
- [ ] Restated ideas are collapsed into a **leading word** where one exists.
- [ ] One term per concept and one concept per term, checked against the glossary the text belongs to. Prohibitions rephrased to their positive target.
- [ ] No semicolons in prose, the frontmatter description included.
- [ ] The path holds: read each skill this file routes to and each skill that routes into it. Every meaning keeps its one home across those files, every section this file relies on is named by the sentence that routes to it, and every sentence agrees with those files and the decision records behind them.
