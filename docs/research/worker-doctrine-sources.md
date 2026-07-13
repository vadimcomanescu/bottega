# Worker programming doctrine

Snapshot: 2026-07-13. Every external link is a first-party repository pinned to the fetched default-branch commit. Source statements and Bottega decisions are kept separate.

## Sources

| Repository | Pinned head | Used for |
| --- | --- | --- |
| Dietrich Gebert, `ponytail` | [`14a0d79`](https://github.com/DietrichGebert/ponytail/commit/14a0d79548d4de8fc2de95c1b94bb0de63a739d3) | Understanding before reduction, root-cause placement, minimum-code ladder, safety limits |
| Addy Osmani, `agent-skills` | [`98967c4`](https://github.com/addyosmani/agent-skills/commit/98967c45a42b88d6b8fb3a88b7ff6273920763d6) | Vertical implementation, behavior tests, source verification, technology-skill selection, browser inspection |
| Addy Osmani, `agent-engineer` | [`d06e2cb`](https://github.com/addyosmani/agent-engineer/commit/d06e2cbed4481621a453cee8743d99669df3a7ba) | Skill reuse and role separation |
| obra, `superpowers` | [`d884ae0`](https://github.com/obra/superpowers/commit/d884ae04edebef577e82ff7c4e143debd0bbec99) | Test-first behavior, scientific debugging, implementation and review separation |
| Matt Pocock, `skills` | [`391a270`](https://github.com/mattpocock/skills/commit/391a2701dd948f94f56a39f7533f8eea9a859c87) | Domain modeling, deep modules, test seams, debugging, two-axis review |

## Builder doctrine

### Understand before reducing

**Source.** Ponytail runs its minimum-code ladder only after reading the affected code and tracing the real flow. For bugs it traces callers and fixes the shared cause, because a small patch in the wrong place leaves sibling paths broken ([`ponytail/SKILL.md` lines 32-54](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/skills/ponytail/SKILL.md#L32-L54)). Addy's simplification method likewise requires understanding responsibilities, callers, error paths, tests, and history before changing structure ([`code-simplification/SKILL.md` lines 105-121](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/code-simplification/SKILL.md#L105-L121)).

**Bottega decision.** A builder first understands the behavior, data flow, callers, and failure path. Only then does it choose the smallest correct change. Diff size never outranks placement or comprehension.

### Make the domain model executable

**Source.** Pocock's domain method challenges conflicting terms, sharpens overloaded language, tests relationships with concrete scenarios, and checks claims against code ([`domain-modeling/SKILL.md` lines 42-64](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/domain-modeling/SKILL.md#L42-L64)). His design vocabulary defines an interface as everything a caller must know, including invariants, ordering, error modes, configuration, and performance traits ([`codebase-design/SKILL.md` lines 14-28](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/codebase-design/SKILL.md#L14-L28)). Tests and other outputs use the glossary's exact domain language and surface conflicts with existing decisions ([`setup domain guidance` lines 41-51](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/setup-matt-pocock-skills/domain.md#L41-L51)).

**Bottega decision.** Fable owns changes to the domain model. The builder consumes it: names, interfaces, states, invariants, errors, and behavior tests use the same concepts. A domain conflict is not a naming cleanup. It returns to Fable before code chooses a new meaning.

### Build one behavior through the interface

**Source.** Matt's TDD method works one vertical slice at a pre-agreed seam, tests observable behavior, rejects implementation-coupled and tautological tests, and avoids writing a horizontal batch of imagined tests ([`tdd/SKILL.md` lines 8-36](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/tdd/SKILL.md#L8-L36)). Superpowers requires one test, an expected assertion failure, minimum green code, and real code unless a mock is unavoidable ([`test-driven-development/SKILL.md` lines 71-196](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/test-driven-development/SKILL.md#L71-L196)). Addy orders test dependencies from real implementation through fake and stub to mock ([`test-driven-development/SKILL.md` lines 174-232](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/test-driven-development/SKILL.md#L174-L232)).

**Bottega decision.** The builder works one observable behavior at a time through Fable's interface. Red must fail for the expected reason. Green adds only the behavior under test. Expected values come from the spec, a worked example, or another independent source, never a copy of the implementation.

### Let test pain expose design problems

**Source.** Pocock makes callers and tests cross the same interface and treats a desire to test past it as evidence that the module has the wrong shape ([`codebase-design/SKILL.md` lines 60-65](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/codebase-design/SKILL.md#L60-L65)). Superpowers treats hard-to-test code, pervasive mocks, and large setup as design feedback, not reasons to add test machinery ([`test-driven-development/SKILL.md` lines 342-349](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/test-driven-development/SKILL.md#L342-L349)).

**Bottega decision.** The builder does not work around a bad seam with private-state assertions, test-only hooks, or internal mocks. It reports a required architecture change to Fable. Inside a sound seam, it keeps implementation complexity local and the interface small.

### Debug with a tight feedback loop

**Source.** Pocock puts most debugging effort into one fast, deterministic, red-capable command that asserts the exact symptom. It then minimizes the reproduction, ranks falsifiable hypotheses, changes one variable at a time, fixes through the correct seam, and re-runs the original scenario ([`diagnosing-bugs/SKILL.md` lines 12-60](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/diagnosing-bugs/SKILL.md#L12-L60), [`lines 62-123`](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/diagnosing-bugs/SKILL.md#L62-L123)). Superpowers also requires one explicit hypothesis and one minimal probe; three failed fixes trigger an architecture question instead of a fourth guess ([`systematic-debugging/SKILL.md` lines 145-213](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/systematic-debugging/SKILL.md#L145-L213)).

**Bottega decision.** Caller tracing alone is not a debugging method. The builder must create a feedback loop, reproduce and minimize the failure, test falsifiable hypotheses, and fix the cause. If the evidence points outside the architecture brief, Fable decides the architecture.

### Use the first correct option

**Source.** Ponytail asks, in order: is the code needed, does it already exist here, does the standard library cover it, does the platform cover it, does an installed dependency cover it, can one clear line do it, and only then what minimum new code works ([`ponytail/SKILL.md` lines 32-48](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/skills/ponytail/SKILL.md#L32-L48)). It rejects speculative abstractions and protects trust-boundary validation, data-loss handling, security, accessibility, and explicit requirements from reduction ([`lines 56-64`](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/skills/ponytail/SKILL.md#L56-L64), [`lines 90-112`](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/skills/ponytail/SKILL.md#L90-L112)).

**Bottega decision.** This ladder is the central implementation doctrine, not a final cleanup check. The builder applies it at every green step after understanding the problem.

### Load stack knowledge on demand

**Source.** Addy's skill router maps implementation work to relevant UI, interface, source-verification, testing, browser, security, and performance skills ([`using-agent-skills/SKILL.md` lines 12-41](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/using-agent-skills/SKILL.md#L12-L41)). Source-driven development checks installed versions and the specific official documentation before using framework APIs ([`source-driven-development/SKILL.md` lines 38-120](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/source-driven-development/SKILL.md#L38-L120)). Addy's agent-engineering guide keeps reusable expertise loadable on demand instead of crowding one role prompt ([`17-agent-skills/README.md` lines 21-42](https://github.com/addyosmani/agent-engineer/blob/d06e2cbed4481621a453cee8743d99669df3a7ba/17-agent-skills/README.md#L21-L42)).

**Bottega decision.** The orchestrator exposes directly matching installed technology skills. The builder selects and follows the ones that help with the actual stack. They supply current technology knowledge inside the architecture brief; they do not override the spec, domain model, architecture, or repository rules.

### Stay inside the architecture

**Source.** Superpowers tells an implementer to follow the planned structure and stop when the task requires an unplanned architecture choice or restructuring ([`implementer-prompt.md` lines 50-78](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/subagent-driven-development/implementer-prompt.md#L50-L78)). Pocock gives the builder useful freedom behind a small interface: hide complexity, keep locality, and add no variation seam for a single adapter ([`codebase-design/SKILL.md` lines 54-65](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/codebase-design/SKILL.md#L54-L65)).

**Bottega decision.** Fable fixes ownership, seams, interfaces, and domain meaning. The builder owns the implementation behind them. A correct solution that needs the architecture brief changed returns to Fable. The builder does not redesign silently, and it does not replace reviewer independence with a ceremonial line-by-line self-verdict.

## Role boundary

**Source.** Superpowers gives implementation and task review to separate roles; the reviewer independently checks spec compliance, code quality, tests, interfaces, and planned structure ([`task-reviewer-prompt.md` lines 78-115](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/subagent-driven-development/task-reviewer-prompt.md#L78-L115)). Pocock keeps spec fidelity and repository standards as separate review verdicts so one cannot hide failure on the other ([`code-review/SKILL.md` lines 82-89](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/code-review/SKILL.md#L82-L89)). Addy's generator-critic pattern also assigns production and evaluation to different agents ([`18-orchestrators/README.md` lines 174-201](https://github.com/addyosmani/agent-engineer/blob/d06e2cbed4481621a453cee8743d99669df3a7ba/18-orchestrators/README.md#L174-L201)). These sources separate builder and reviewer. Bottega's independent product QA is a local design decision layered after that review.

**Bottega decision.**

| Role | Owns | Does not own |
| --- | --- | --- |
| Fable | Spec, domain decisions, ownership, seams, interfaces, permitted dependencies, arbitration of domain and architecture conflicts, acceptance of independent architecture evidence | Production implementation by default, independent review, final product verdict |
| Builder | Correct, simple implementation behind the architecture brief; vertical behavior tests; focused debugging; use of relevant technology skills | Changing the domain model or architecture; proving its own architectural conformance; final QA evidence |
| Reviewer | Independent, read-only evaluation of the fixed diff against behavior, tests, repository standards, domain model, and architecture | Implementing fixes; certifying the product surface as a user |
| QA | Driving every changed product surface in the real artifact after review; recording independent scenario verdicts and evidence | Reviewing code; changing architecture; fixing product code |

This boundary is deliberate. Addy's browser method is useful during implementation and debugging ([`test-driven-development/SKILL.md` lines 298-327](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/test-driven-development/SKILL.md#L298-L327)), and Pocock lists a browser script as one possible bug feedback loop ([`diagnosing-bugs/SKILL.md` lines 18-29](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/diagnosing-bugs/SKILL.md#L18-L29)). A builder may therefore use a browser as a focused debugging instrument when the red loop requires it. Bottega should not mandate a builder product drive, recording, or surface verdict. Those belong to independent QA. Reviewer conformance remains independent between implementation and QA.

The reviewer and Fable responsibilities are different. Reviewers independently verify the code against the brief. Fable reconciles their evidence against every fixed architecture decision and accepts or rejects the reviewed head. Fable is accountable for the architecture, but is not treated as an independent verifier of its own design. QA starts only after that acceptance and verifies product behavior, not internal architecture.

On a QA failure, QA reports and stops. Fable classifies the cause, never the surface where it appeared: drive, evidence, or environment; implementation inside the unchanged architecture brief; or wrong spec, domain model, interface, or architecture. Fable then chooses setup repair, the builder that owns the responsible module, or redesign. QA fixing and certifying the same head would collapse independent verification into implementation.

## Final Bottega audit

| Concern | Final location | Verdict |
| --- | --- | --- |
| Technology skills and current APIs | `skills/implementing/SKILL.md:14,34`; `skills/run/SKILL.md:34,40` | Resolved. Fable passes only matching installed skills. Builders read every supplied skill and verify version-sensitive APIs against the installed version and primary documentation. |
| Domain model in code | `skills/implementing/SKILL.md:16,27,29`; `skills/codebase-design/SKILL.md:31-40` | Resolved. Fable fixes domain meaning in the brief; builder names, states, invariants, errors, and tests express it; meaning conflicts return to Fable. |
| Root-cause debugging | `skills/implementing/SKILL.md:15,35` | Resolved. The builder starts with the smallest deterministic reproduction, traces the shared cause, tests one falsifiable hypothesis at a time, and stops after three failed attempts. |
| True programming doctrine | `skills/implementing/SKILL.md:20-22,30-34` | Resolved. The center of the skill is one vertical red-green behavior, Ponytail's ordered minimum-code checks, interface-level tests, real dependencies or stand-ins, protected product quality, and source-verified APIs. |
| Architecture ownership | `skills/implementing/SKILL.md:10,16,27`; `skills/reviewing/SKILL.md:34-43`; `skills/run/SKILL.md:46` | Resolved. The builder stays behind Fable's fixed interface and reports conflicts. Reviewers independently check every design decision, domain meaning, and surplus behavior; Fable accepts or rejects their evidence. |
| Builder report | `skills/implementing/SKILL.md:23,28` | Resolved. The required report contains behavior, fresh red and green evidence, gates, files, commit, and unresolved domain or architecture conflicts. It no longer requires skill narration, a product drive, or an outside-observation inventory; line 28 merely permits reporting a useful observation without editing it. |
| Builder, reviewer, and QA boundary | `skills/run/SKILL.md:40,46,48-54` | Resolved. Builders prove code and tests, reviewers verify architecture, Fable accepts the evidence, and QA alone drives the complete product surface. A builder browser remains optional as a focused debugging instrument. |
| Review mechanics | `skills/run/SKILL.md:46`; `skills/run/references/review.md:1-9` | Resolved. `run` keeps Fable's decisions and gate; frozen targets, dispatch contents, schema checks, round limits, and completion mechanics live in the one-use review reference. |
| QA publication mechanics | `skills/run/SKILL.md:48-54`; `skills/run/references/qa-evidence.md:1-5` | Resolved. `run` keeps QA independence, verdicts, invalidation, and failure routing. GitHub publication details are disclosed only when evidence is ready. |
| Costly-decision panel | `skills/run/SKILL.md:38`; `skills/run/references/panel.md:1-13`; `skills/run/assets/panel.js:30-50` | Resolved. The one-use panel branch and identities live with `run`; no standalone panel skill or panel agents remain. |

## Skill and agent placement

**Source.** Addy distinguishes reusable skills from role identity and output format; the user or command composes them ([`docs/agents.md` lines 12-22](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/docs/agents.md#L12-L22)). His agent-engineering guide says shared, independently updated expertise belongs in a skill, while a simple one-off method belongs in the prompt ([`17-agent-skills/README.md` lines 21-32](https://github.com/addyosmani/agent-engineer/blob/d06e2cbed4481621a453cee8743d99669df3a7ba/17-agent-skills/README.md#L21-L32), [`lines 352-373`](https://github.com/addyosmani/agent-engineer/blob/d06e2cbed4481621a453cee8743d99669df3a7ba/17-agent-skills/README.md#L352-L373)). Ponytail keeps host adapters thin and points them at one shared method ([`agent-portability.md` lines 1-5](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/docs/agent-portability.md#L1-L5), [`lines 34-38`](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/docs/agent-portability.md#L34-L38)).

| Bottega method or identity | Actual reuse | Placement decision |
| --- | --- | --- |
| `skills/implementing` | Claude and Codex builders; initial work and review or QA repairs | Keep as a shared skill. Inlining in `agents/builder.md` would duplicate it for Codex. |
| `skills/reviewing` | Claude and Codex reviewers; integrated and delta review | Keep as a shared skill with its schema and dispatch asset. |
| `skills/codebase-design` | Fable designs with it; reviewers judge with it; builders consume the resulting architecture brief | Keep as shared architect and reviewer doctrine. Do not make a builder re-run the design method. |
| `skills/run` | One explicit user entry point executed by Fable, with several one-use branches | Keep as the user-invoked orchestration skill. Keep branch-specific mechanics in its references and assets. |
| Panel method and identities | One costly-decision branch used only by `run` | Correctly inlined as `skills/run/references/panel.md` and `skills/run/assets/panel.js`. A standalone skill or agent adds no reuse. |
| QA and docs sweep | One role and one scenario each, only inside `run` | Correctly inline in `run`; only QA publication mechanics are disclosed in `references/qa-evidence.md`. |
| `agents/builder.md`, `agents/reviewer.md` | Runtime identities that point to methods shared with Codex | Keep as thin pointers. |

No remaining Bottega skill is unused. No remaining agent and skill form a one-runtime, one-scenario pair that benefits from inlining. Review orchestration, QA publication, the panel method, and panel identities are one-use branches under `skills/run`, not standalone skills or agents.

## Compact builder carry text

1. Understand the whole behavior and domain before editing. For a bug, build a tight red signal, minimize it, and fix the shared cause.
2. Work one observable behavior at a time through Fable's interface. See the expected red, add minimum green code, and test outcomes against an independent expected value.
3. Before adding code, apply Ponytail's ordered checks: needed, already here, standard library, native platform, installed dependency, one clear line, minimum new code.
4. Use the domain's exact concepts in names, states, invariants, errors, and tests. Return a conflict in meaning or architecture to Fable.
5. Treat hard tests as design evidence. Test through the interface, prefer real dependencies or local stand-ins, and do not expose internals to make tests easy.
6. Load the installed technology skills that directly match the stack and verify version-sensitive APIs against the installed version and primary documentation.
7. Architecture fixes ownership, seams, and interfaces. Implementation behind them is yours. If correctness requires changing them, stop and report.
8. Claim green only from fresh evidence.

## Deliberate exclusions

- Ponytail's one-check minimum and permission to omit tests for trivial one-liners are not adopted. Bottega keeps its stronger behavior-test contract.
- Addy's browser completion checklist is not copied into the builder. It assumes one implementation lifecycle; Bottega has an independent QA role.
- Addy and Superpowers use broad mandatory skill-trigger rules. Bottega loads only skills that directly match the stack or risk.
- Generic command, commit, routing, recording, and publishing instructions are not programming doctrine. They belong in the harness, a dispatch reference, or the one brief that needs them.
