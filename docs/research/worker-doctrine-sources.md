# Worker doctrine and topology

Snapshot: 2026-07-13. This note separates source facts, Bottega inferences, and repository decisions.

## The placement rule

The earlier audit treated current call count as the deciding fact. That was wrong. One call site can still be a reusable capability, while one named role can consume a method in several runtimes and phases.

### Source facts

- A Claude subagent has its own context, system prompt, tools, and permissions. Its `skills` field preloads the full content of named skills ([Claude subagent documentation](https://code.claude.com/docs/en/sub-agents)).
- A Claude skill is optional procedural or domain content with invocation controls and supporting files ([Claude skill documentation](https://code.claude.com/docs/en/slash-commands)).
- Addy Osmani separates agent, skill, and command as who, how, and when. The agent supplies a stable perspective; the skill supplies a reusable workflow; the command composes them ([`docs/agents.md`](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/docs/agents.md)).
- Public software-engineering skills often add no measured value when they are broad or mismatched. In SWE-Skills-Bench, 39 of 49 skills produced no pass-rate gain, and some reduced performance because their guidance conflicted with the repository or version ([SWE-Skills-Bench](https://arxiv.org/abs/2603.15401)).
- Skill constraints are easy to violate when their logical relationship is low-salience. SLBench found logical relations in 70 percent of sampled skills and reduced targeted violations with a small guard ([SLBench](https://arxiv.org/abs/2607.09016)).

### Bottega decision

- **Agent:** a named worker in an isolated context. It defines perspective, authority, forbidden actions, available tools, and the required result.
- **Skill:** reusable method or an independently invoked capability. Keep it separate when it crosses roles, runtimes, or phases, or owns a workflow, script, schema, or other contract.
- **Reference:** supporting detail for one parent skill. Load it only in the phase that needs it.
- **Harness:** hooks, schemas, tests, and workflow code that enforce deterministic rules.

Inline method in an agent only when all four are true: one kind of task for that role, one runtime, no independent invocation, and no assets or contract of its own. Current call count is evidence, never the rule. A shared skill has one source of truth and is preloaded or passed to the worker, not summarized into the agent prompt.

## Complete Bottega inventory

| Item | Semantic use | Decision |
| --- | --- | --- |
| `skills/maestro` | Explicit user entry, executed by Fable; composes every phase | Keep as the orchestration skill. It owns gates, routing, decisions, and phase transitions, not worker programming method. |
| `skills/implementing` | Claude and Codex builders; initial slices and later repairs | Keep. It crosses runtimes and phases even though the role name stays builder. |
| `skills/reviewing` | Claude and Codex reviewers; integrated and delta rounds; report schema and Claude workflow | Keep. It crosses runtimes and owns a stable report contract. |
| `skills/codebase-design` | Fable creates the architecture brief; reviewers test the implementation against it | Keep. It is shared doctrine for design and independent verification. Builders receive the resulting brief rather than redoing the architecture. |
| `skills/panel` | Independently invoked for one costly plan decision; owns a workflow and structured comparison | Keep. Its workflow and contract make it a capability, regardless of how often a run needs it. |
| `agents/builder` | Claude builder identity | Keep thin and preload `bottega:implementing`. |
| `agents/reviewer` | Claude reviewer identity | Keep thin and preload `bottega:reviewing` and `bottega:codebase-design`. |
| `agents/qa` | One independent Claude product-verification role | Keep the small method in the agent. It has one consumer, one runtime, no independent invocation, and no skill-owned assets. |
| `agents/panelist` | Stable independent-draft perspective inside the panel workflow | Keep as identity. The panel method remains in `skills/panel`. |
| `agents/panel-judge` | Stable compare-only perspective inside the panel workflow | Keep as identity. It compares drafts and never chooses the architecture. |
| `skills/maestro/references/codex-dispatch.md` | Codex launch and resume mechanics used by run | Keep as a reference. It is supporting runtime detail, not a user or model-invoked capability. |
| `skills/review/SKILL.md` | Frozen-target, round, and repair routing details for Review | Promoted from a run phase reference to the independently invoked gate with two callers (run, land). |
| `skills/close/references/qa-evidence.md` | Publication mechanics needed after QA has evidence | Keep as a phase reference. |
| `skills/reviewing/assets/review-dispatch.js` | Schema-enforced Claude reviewer launch | Keep as workflow code and invoke it from the Review reference. |
| `skills/panel/panel.js` | Independent drafts and blinded comparison | Keep with the panel skill. |
| route guard, report schema, and tests | Routing, output shape, and invariant enforcement | Keep in code. Do not restate their mechanics as worker ceremony. |
| docs sweep | Small task-specific brief inside Deliver | Keep inline. It does not need a reusable identity or method. |

This inventory has no unused skill. It also has no agent-skill pair that should be collapsed. Implementation and review cross two runtimes; architecture crosses two roles; panel is independently invoked and owns assets. QA is the one method correctly inlined in an agent.

## Builder doctrine

### Understand before reducing

Ponytail reads the affected flow before applying its minimum-code ladder and fixes the shared cause rather than one reported path ([Ponytail method](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/skills/ponytail/SKILL.md#L32-L64)). Matt Pocock's debugging method builds a fast deterministic reproduction, minimizes it, and tests falsifiable explanations ([diagnosing bugs](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/diagnosing-bugs/SKILL.md#L12-L60)). Superpowers likewise changes one variable at a time and treats repeated failed fixes as a reason to question the design ([systematic debugging](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/systematic-debugging/SKILL.md#L145-L213)).

Bottega therefore asks the builder to trace the behavior, reproduce a bug, identify the earliest shared cause, and state the required observable behavior before editing. A small diff in the wrong owner is not a simple solution.

### Make the domain model executable

Pocock sharpens overloaded terms with scenarios and checks the resulting model against code ([domain modeling](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/domain-modeling/SKILL.md#L42-L64)). His design method treats an interface as everything a caller must know, including invariants, ordering, failures, configuration, and relevant performance behavior ([codebase design](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/codebase-design/SKILL.md#L14-L28)).

Fable owns the domain model and architecture. The builder expresses the approved terms in names, states, errors, interfaces, and tests. A conflict in meaning, ownership, interface, or dependency direction returns to Fable. The builder has broad freedom behind the fixed interface, not freedom to silently move it.

### Build one observable behavior at a time

Pocock's TDD method works through an agreed interface and rejects tests coupled to implementation details ([TDD](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/tdd/SKILL.md#L8-L36)). Superpowers requires one expected failing test, minimum green code, and refactoring while green ([test-driven development](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/test-driven-development/SKILL.md#L71-L196)). Addy prefers real dependencies and faithful fakes before mocks ([test-driven development](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/test-driven-development/SKILL.md#L174-L232)).

The builder works red, green, refactor on one observable behavior. Expected values come from the requirement or another independent source. Test pain is design evidence, not a reason to expose internals or add test-only seams.

### Use the first correct option

Ponytail checks, in order: whether the behavior is needed, whether the repository already has it, whether the standard library has it, whether the platform has it, whether an installed dependency has it, whether one clear direct expression is enough, and only then the minimum new code ([Ponytail ladder](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/skills/ponytail/SKILL.md#L32-L48)). It explicitly protects validation, data safety, security, accessibility, and requirements from reduction ([Ponytail safety limits](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/skills/ponytail/SKILL.md#L90-L112)).

This is the builder's central implementation choice after understanding the problem. It is not a cleanup checklist and does not mean smallest diff at any cost.

### Apply YAGNI to capability, not quality

Martin Fowler defines YAGNI as declining capability presumed for the future, within incremental design ([YAGNI](https://martinfowler.com/bliki/Yagni.html)). He separately explains that internal quality makes later change faster and cheaper ([Is High Quality Software Worth the Cost?](https://martinfowler.com/articles/is-quality-worth-cost.html)).

Bottega applies YAGNI to speculative features, variants, configuration, dependencies, compatibility layers, and abstractions. It never excuses incomplete requested behavior, weak validation, unsafe data handling, poor accessibility, security gaps, missing tests, unclear names, duplication left in the changed path, or a misplaced rule. Refactoring for the current requirement is compatible with YAGNI; designing for an imagined variant is not.

### Load only relevant technology knowledge

Addy's router selects skills that match the actual stack and task, while source-driven development checks installed versions and primary vendor documentation ([skill routing](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/using-agent-skills/SKILL.md#L12-L41), [source-driven development](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/source-driven-development/SKILL.md#L38-L120)). SWE-Skills-Bench shows why blanket loading is harmful when guidance is irrelevant or version-mismatched.

Fable inventories both runtimes and supplies only directly relevant technology skills. Those skills improve stack knowledge. They do not override the approved requirement, architecture, domain model, installed version, or repository rules.

## Architecture, review, and QA

Superpowers separates implementation from review and gives the reviewer the plan and code rather than the builder's self-assessment ([implementer prompt](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/subagent-driven-development/implementer-prompt.md#L50-L78), [reviewer prompt](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/subagent-driven-development/task-reviewer-prompt.md#L78-L115)). SWE-Review finds that a structured generate, review, revise loop improves issue resolution over one-shot generation ([SWE-Review](https://arxiv.org/abs/2607.06065)). These sources support an independent reviewer. Extending that reviewer to architecture conformance is Bottega's decision.

The final order is:

1. Fable resolves the domain model and writes the architecture brief.
2. Builders implement slices behind that contract.
3. Independent reviewers inspect the exact integrated tree against behavior, tests, domain meaning, and every fixed architecture decision.
4. Fable reconciles their evidence and accepts or rejects the architecture. Fable is accountable, but is not the sole verifier of its own design.
5. QA drives the accepted head as a user. QA verifies product behavior, not internal architecture.

QA does not repair product code. Product-surface evidence identifies a symptom, not necessarily the responsible module or the class of defect. Letting QA fix would collapse independent verification and encourage local surface patches. Fable classifies the cause and routes it:

| Cause | Owner | Required recheck |
| --- | --- | --- |
| Disposable drive setup or evidence capture | QA | Repeat the affected scenario |
| Product implementation violates an unchanged brief | Builder that owns the responsible module | Gates, opposite-family delta review, Fable acceptance, fresh QA |
| Spec, domain model, interface, ownership, or architecture is wrong | Fable returns to Plan | Revised build, both-family integrated review, Fable acceptance, fresh QA |

A builder may use a browser as the shortest debugging loop. It does not produce the independent product verdict. A reviewer may execute product scenarios to reproduce a code finding. It does not replace QA's complete user drive.

## Prompt and harness implications

Inside the Skill Market finds that implementation, testing, and review are easier to package as reusable skills than high-context requirements and design ([Inside the Skill Market](https://arxiv.org/abs/2607.09065)). Better Harnesses, Smaller Models shows that detailed harness adaptation helps routine, repeated tasks, especially for smaller models ([Better Harnesses, Smaller Models](https://arxiv.org/abs/2607.08938)). Failure as a Process finds that coding-agent failures often begin as early epistemic errors and become hard to recover later ([Failure as a Process](https://arxiv.org/abs/2607.09510)). Obey, Diverge, Collapse shows that a model may recognize an incorrect instruction and still follow it, corrupting later work ([Obey, Diverge, Collapse](https://arxiv.org/abs/2607.04537)).

OpenAI's GPT-5.6 launch emphasizes stronger intent following, sustained focus, and useful work with less steering in reported use ([GPT-5.6](https://openai.com/index/gpt-5-6/)). That is not a formal rule to remove instructions. Combined with the skill benchmarks, it supports a narrower conclusion for Bottega:

- Tell frontier workers what competence cannot derive: decision rights, domain meaning, fixed interfaces, failure routing, safety constraints, and output contracts.
- Keep a few important logical rules prominent. Put mechanically checkable guarantees in hooks, schemas, workflow code, and tests.
- Load specialized knowledge only when it matches the stack and version.
- Cut narration of ordinary tool use, repeated reminders, motivational prose, and generic programming advice.
- Validate understanding and architecture early. Do not compensate for a wrong brief with more end-of-run ceremony.
- Codex workers use Sol at most. The panel uses Sol at max effort, not a multi-agent model tier.

## Deliberate exclusions

- Ponytail's permission to omit tests for trivial one-liners is not adopted. Bottega keeps observable behavior evidence.
- Addy's browser completion checklist is not mandatory builder work. Bottega has independent QA.
- Broad automatic loading of every available skill is not adopted. Relevance and version compatibility decide.
- Fable does not perform a second implementation-style self-review of its own architecture. Independent reviewers verify it; Fable performs the accountable final acceptance step.
- QA does not fix product code. It may only repair disposable drive setup and evidence capture.
- Mechanical command narration, polling, and status ceremony do not belong in worker doctrine.
