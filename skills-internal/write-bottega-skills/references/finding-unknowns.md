# Finding your unknowns

Source: A field guide to Claude Fable 5: finding your unknowns, Thariq Shihipar, Anthropic, July 2026 (https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns). A distillation for the skill writer: reread the source when the model generation moves.

The map is what you give the model: prompts, skills, context. The territory is the codebase and the real world. The gap between them is your unknowns, and with this generation the quality of the work is bottlenecked by your ability to clarify them. When the model hits an unknown it decides from its best guess of what you want, and the more work in flight, the more unknowns it hits.

Instructing the model is a balance that fails on both sides. Too specific, and it follows your instructions even when a pivot would be more appropriate. Too vague, and it makes choices from industry best practices that may not fit your task. Unaccounted unknowns make you fail both ways at once: you do not know when the path is full of obstacles, and you do not know when the path is clear but you still want the model to veer.

Break a problem down four ways:

- Known knowns: what the prompt already states.
- Known unknowns: what you have not figured out yet and know you have not.
- Unknown knowns: what is so obvious to you that you would never write it down, but would recognize on sight.
- Unknown unknowns: what you have not considered at all, including how good the result could be.

The best agentic coders have few unknowns and assume the ones they have, staying deeply in sync with both the codebase and the model's behaviors. Reducing and planning for unknowns is the skill, and the model is the right instrument for it: it searches a codebase and the internet quickly, knows more about the average topic than you, and iterates from failure faster. The most important part is giving it your starting point, so it works with you like a thought partner: where you are in your thinking, and your experience with the problem and the codebase. Planning ahead is not sufficient on its own, because unknowns surface deep in implementation and can point at a different problem than the one you set out to solve.

Eight moves, before, during, and after implementation:

1. Blind spot pass. In unfamiliar territory, ask for one with the literal words "blind spot pass" and "unknown unknowns", with context on who you are and what you know. It surfaces the questions you did not know to ask, what good looks like, what prior work exists, and the potholes to avoid.
2. Brainstorms and prototypes. For criteria you only recognize on sight, react to several rendered directions instead of describing what you want. Verbalizing an unknown known during prototyping is cheap, and finding it during implementation is expensive, because small spec changes cause drastically different implementations and reverting them is harder for the agent. A prototype stays deliberately unwired (a button in a frame with no backend route or state behind it), which is what makes it cheap. Open almost every session with one: the model finds high-value approaches you would have missed, sometimes misses the forest for the trees, and the exchange sets a scope that is neither too narrow nor too wide. When you would not recognize good even on sight, variations are useless: have the model teach you the domain until you can judge, then ask for directions.
3. Interviews. When brainstorming leaves unknowns, have the model interview you one question at a time, with context about your problem to guide its questions, prioritizing the ones whose answer would change the architecture.
4. References. When you cannot describe what you want in detail, hand a reference. The absolute best reference is source code: point at the folder that implements what you want, even in a different language, over diagrams, documentation, or screenshots.
5. Implementation plans. Lead the plan with what is most likely to change (data models, type interfaces, anything user-facing) and bury the mechanical work, so review lands where your answer matters.
6. Implementation notes. Start implementation in a fresh session carrying the planning artifacts, and have the model keep a running notes file. When an edge case forces a deviation, it picks the conservative option, logs it under deviations, and keeps going.
7. Pitches and explainers. Package the work for reviewers who start with the same unknowns you did, and for experts who want to see the common failure points accounted for.
8. Quizzes. After a long session, reading the diffs alone gives a light understanding, because much of the behavior depends on existing code paths. Have the model quiz you on the change, and merge only after you pass.

When a long-horizon task comes back wrong, you likely needed to spend more time defining your unknowns, or an implementation plan that lets you and the model adapt through them. Every explainer, brainstorm, interview, prototype, and reference is a cheap way to find out what you did not know before it gets expensive to fix.
