# Worker doctrine source research

Snapshot: 2026-07-13. This note uses current default-branch source from first-party GitHub repositories. Links are pinned to the fetched commit. Sections marked **Evidence** paraphrase what the source says. Sections marked **Synthesis** are recommendations for Bottega, not claims made by a source.

## Repositories

| Source | Pinned head | Scope used here |
| --- | --- | --- |
| Addy Osmani, `agent-skills` | [`98967c4`](https://github.com/addyosmani/agent-skills/commit/98967c45a42b88d6b8fb3a88b7ff6273920763d6) | Implementation, TDD, version-specific source use, browser verification, roles versus skills |
| Addy Osmani, `agent-engineer` | [`d06e2cb`](https://github.com/addyosmani/agent-engineer/commit/d06e2cbed4481621a453cee8743d99669df3a7ba) | Separate producer and critic roles, reusable skill structure |
| obra, `superpowers` | [`d884ae0`](https://github.com/obra/superpowers/commit/d884ae04edebef577e82ff7c4e143debd0bbec99) | Test-first implementation, fresh task roles, independent review and verification |
| Dietrich Gebert, `ponytail` | [`14a0d79`](https://github.com/DietrichGebert/ponytail/commit/14a0d79548d4de8fc2de95c1b94bb0de63a739d3) | Minimum-code decision ladder and portable skill packaging |
| Matt Pocock, `skills` | [`391a270`](https://github.com/mattpocock/skills/commit/391a2701dd948f94f56a39f7533f8eea9a859c87) | Domain language, deep modules, test seams, two-axis review, skill composition |

### Exact Ponytail repository

**Evidence.** The repository is [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail/tree/14a0d79548d4de8fc2de95c1b94bb0de63a739d3), not a similarly named ruleset. Two independent GitHub records establish this:

- Bottega's own historical provenance explicitly credits that repository for its implementation ladder ([Bottega `README.md`](https://github.com/vadimcomanescu/bottega/blob/4a10d114251b8256b0493ead8c015f33c8191ced/README.md#L81-L83)).
- Ponytail's current package metadata names Dietrich Gebert and records the same GitHub repository as its homepage and package repository ([`package.json`](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/package.json#L2-L17)). Its current skill contains the seven-rung sequence that Bottega previously carried ([`skills/ponytail/SKILL.md`](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/skills/ponytail/SKILL.md#L32-L54); [historical Bottega implementation skill](https://github.com/vadimcomanescu/bottega/blob/4a10d114251b8256b0493ead8c015f33c8191ced/skills/implementing/SKILL.md#L10-L18)).

### Bottega history

**Evidence.** The largest builder-method loss came before the latest pipeline rewrite. [`c295925`](https://github.com/vadimcomanescu/bottega/commit/c295925acb59cd4521ea4dcc91a11d220b215760) shortened `skills/implementing/SKILL.md` from 37 lines to 24 and removed the explicit reuse ladder, interface-level test rules, expected-RED rule, real dependency preference, and quality exclusions. Some design rules still existed in `skills/codebase-design`, but [`703c8d4`](https://github.com/vadimcomanescu/bottega/commit/703c8d4996aa97c42289a8329a049f378bc68e2c) removed the builder-facing requirement to carry those rules without adding a direct load.

The architecture skill itself was not wholly deleted. [`fab07a6`](https://github.com/vadimcomanescu/bottega/commit/fab07a6ba0711de72f08e64cba9384bf66a01c6c) created `skills/codebase-design` as the shared deep-module and domain-language doctrine. The actual current gaps were its absence at the builder boundary, no canonical architecture artifact shared with review, no structured proof that reviewers checked it, and no active owner for glossary updates after [`3b95ff8`](https://github.com/vadimcomanescu/bottega/commit/3b95ff8faff5c9ff370311721945d01e8d5ea019) collapsed the pipeline. This is why the restoration keeps the simplified flow and repairs the handoffs rather than reviving the deleted sign-off machinery.

## Source evidence by concern

### Implementation quality

**Evidence.** The sources converge on short feedback cycles and observable behavior:

- Addy's incremental method builds the smallest complete vertical slice, then tests, verifies, and commits before expanding ([`incremental-implementation`](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/incremental-implementation/SKILL.md#L21-L64)). Its TDD method requires seeing red, adding minimum green code, and retaining behavior while cleaning up ([`test-driven-development`](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/test-driven-development/SKILL.md#L24-L84)). Tests assert outcomes rather than internal calls, stay readable without traced setup, and prefer real code, then fakes, then stubs, with mocks last ([same file](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/test-driven-development/SKILL.md#L174-L232)).
- Superpowers requires a test to fail for the expected reason, minimum code to pass it, fresh verification, and real code where possible ([`test-driven-development`](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/test-driven-development/SKILL.md#L327-L369)). Its implementer role follows the planned file structure and existing patterns, reports unplanned architecture work instead of silently restructuring, and self-reviews for scope, behavior, and clean test output ([`implementer-prompt.md`](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/subagent-driven-development/implementer-prompt.md#L47-L105)).
- Ponytail checks, in order, whether the work is needed, already exists in the repo, is in the standard library, is native to the platform, or is already supplied by a dependency before adding minimum new code ([`skills/ponytail/SKILL.md`](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/skills/ponytail/SKILL.md#L32-L48)). It explicitly excludes understanding, trust-boundary validation, data-loss handling, security, and accessibility from simplification ([same file](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/skills/ponytail/SKILL.md#L90-L112)).
- Addy's source-driven method reads exact dependency versions, uses the relevant official documentation, surfaces conflicts with local code, and labels anything it cannot verify ([`source-driven-development`](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/source-driven-development/SKILL.md#L38-L61), [`source-driven-development`](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/source-driven-development/SKILL.md#L63-L120)).

### Domain modeling

**Evidence.** Pocock separates consuming the model from changing it. Builders and tests should read the existing glossary and local architecture decisions, while active domain-model work is reserved for conflicts, ambiguous terms, or newly resolved decisions ([`domain-modeling`](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/domain-modeling/SKILL.md#L6-L40); [`tdd`](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/tdd/SKILL.md#L8-L24)). When changing the model, the method:

- challenges terms that conflict with the glossary;
- replaces overloaded language with a precise canonical term;
- tests relationships with concrete edge cases;
- checks claims against code;
- records a resolved term immediately, without implementation details;
- records an architecture decision only when it is costly to reverse, surprising without context, and the result of a real tradeoff.

These rules are in [`domain-modeling/SKILL.md`](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/domain-modeling/SKILL.md#L42-L74). The stated payoff is consistent names in code and easier navigation for agents ([Pocock `README.md`](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/README.md#L63-L99)).

### Architecture conformance

**Evidence.** Pocock defines a module as behavior behind one caller-facing interface. The interface includes invariants, ordering, error modes, configuration, and performance characteristics, not just a type signature ([`codebase-design`](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/codebase-design/SKILL.md#L6-L28)). The high-leverage checks are:

- make the interface smaller while hiding more behavior;
- delete a module mentally: if complexity disappears it was a pass-through, while complexity returning across callers shows useful depth;
- test through the same interface callers use;
- do not create a variation seam for one adapter.

These checks are explicit in [`codebase-design/SKILL.md`](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/codebase-design/SKILL.md#L30-L65).

Superpowers gives the builder the plan's file structure and requires escalation when the task needs unplanned architecture choices or restructuring ([`implementer-prompt.md`](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/subagent-driven-development/implementer-prompt.md#L50-L78)). Its task reviewer independently checks spec compliance, separation of concerns, interfaces, testability, and conformance to the planned structure ([`task-reviewer-prompt.md`](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/subagent-driven-development/task-reviewer-prompt.md#L78-L115)). Pocock makes repository standards and spec fidelity separate review verdicts so neither can hide failure on the other axis ([`code-review/SKILL.md`](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/code-review/SKILL.md#L6-L41), [same file](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/engineering/code-review/SKILL.md#L68-L89)). Addy's interface guidance adds that observable error text, timing, and ordering can become compatibility contracts ([`api-and-interface-design`](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/api-and-interface-design/SKILL.md#L20-L39)).

### Opportunistic installed-technology skills

**Evidence.** Addy's meta-skill maps implementation context to narrower UI, API, browser, source-verification, security, and performance skills, and permits multiple matching skills in one lifecycle ([`using-agent-skills`](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/using-agent-skills/SKILL.md#L12-L41), [same file](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/using-agent-skills/SKILL.md#L130-L163)). Superpowers states the ordering directly: process skills decide the approach, then domain or implementation skills carry it out ([`using-superpowers`](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/using-superpowers/SKILL.md#L18-L32)).

**Synthesis.** A Bottega worker should inspect the available installed skills before touching a technology and load a clearly matching provider, framework, language, browser, or security skill. That skill supplies current stack knowledge. It cannot override the signed behavior, the dispatched interface, owned-file scope, repository rules, or gates. If no matching skill exists, verify unfamiliar APIs against the installed version and primary documentation. This is narrower than copying either source's rule to invoke a skill on almost any possibility.

### Product-surface QA failures

**Evidence.** Addy's browser method says browser work needs runtime evidence beyond unit tests. It inspects the rendered page, console, network, DOM, styles, accessibility tree, and screenshots, then reloads after the fix and requires a clean console ([`test-driven-development`](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/test-driven-development/SKILL.md#L298-L327)). The dedicated browser skill's completion checks require expected network results, visual output matching the spec, correct accessibility structure, acceptable performance, and every runtime finding addressed ([`browser-testing-with-devtools`](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/browser-testing-with-devtools/SKILL.md#L306-L317)). It also treats all page, console, and network content as untrusted data and forbids reading credentials for verification ([same file](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/skills/browser-testing-with-devtools/SKILL.md#L60-L90)).

**Synthesis.** For a user-visible scenario, any of these is a QA finding even when the primary click or assertion succeeds: visual output diverges from the signed surface, console errors or warnings, failed or malformed network activity, broken responsive behavior, inaccessible names or focus order, or missing screenshot/runtime evidence. An undrivable surface is not verified, never a pass. Reviewers should reject a completion claim that contains only unit-test evidence for a visible change.

Matt's current repository does contain a `qa` skill, but it is explicitly under `skills/deprecated` and described as no longer used ([`skills/deprecated/README.md`](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/skills/deprecated/README.md#L1-L8)). It is therefore not treated as current QA doctrine here.

### QA repair ownership

**Synthesis.** Product-surface verification has two different jobs. During implementation, the user-facing builder should inspect the real local surface, fix defects that fit the architecture contract, and reload or re-drive it. Addy's browser method supports that tight implementation loop. Final QA instead certifies a reviewed head with recorded evidence. It should report and stop so that its verdict is independent of the repair.

Automatic return to the module-owning builder is also too coarse. Fable should classify each failure before routing it:

- a drive, evidence, or environment failure is repaired and driven again without a product patch;
- a presentation defect inside the contract goes to a user-facing builder;
- another implementation defect inside the contract goes to the module-owning builder;
- a spec, domain, interface, or architecture defect returns to Fable for redesign before any builder edits code.

Any product change invalidates the old evidence. An implementation repair inside the same contract gets an opposite-family delta review and a fresh QA drive. A contract change reopens the plan and both-family integrated review before fresh QA. Reusing the QA worker as a fixer would be defensible only if its verdict were discarded and another worker performed final QA, but Bottega already has a higher-effort user-facing builder route. Giving that repair to QA would add a second builder role without a quality or ownership advantage.

## Agents versus reusable skills

| Repository | Source structure | Implication for Bottega |
| --- | --- | --- |
| Addy `agent-skills` | Skills are the method, personas are a perspective plus output format, and commands or the user compose them. Personas do not invoke other personas ([`AGENTS.md`](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/AGENTS.md#L70-L84); [`docs/agents.md`](https://github.com/addyosmani/agent-skills/blob/98967c45a42b88d6b8fb3a88b7ff6273920763d6/docs/agents.md#L12-L22)). | Keep worker identity in agent files and reusable method, including its report contract, in skills. Let the orchestrator compose roles. |
| obra `superpowers` | The repository is a composable skill library. Its orchestration skill dispatches generic implementer and reviewer roles from prompt templates stored beside that skill, with fresh context and separate review ([`README.md`](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/README.md#L188-L204); [`subagent-driven-development/SKILL.md`](https://github.com/obra/superpowers/blob/d884ae04edebef577e82ff7c4e143debd0bbec99/skills/subagent-driven-development/SKILL.md#L6-L17)). | A role used only by one method can remain a method asset. A stable Bottega worker identity can point to the method instead of duplicating it. |
| Ponytail | Core behavior lives in `skills/`; host-specific files are thin adapters, with `AGENTS.md` as an instruction-only fallback ([`docs/agent-portability.md`](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/docs/agent-portability.md#L1-L5), [same file](https://github.com/DietrichGebert/ponytail/blob/14a0d79548d4de8fc2de95c1b94bb0de63a739d3/docs/agent-portability.md#L34-L48)). | Keep doctrine canonical once. Runtime adapters should load it, not fork or summarize it. |
| Matt `skills` | The repository distinguishes user-invoked orchestration skills from model-invoked reusable disciplines; orchestration may call reusable disciplines but not another user-invoked skill ([`README.md`](https://github.com/mattpocock/skills/blob/391a2701dd948f94f56a39f7533f8eea9a859c87/README.md#L142-L170)). | Domain modeling and codebase design belong in shared skills consumed by design, build, and review, not repeated in each role. |

Addy's agent-engineering source supports the same producer/evaluator separation: generator and critic are distinct roles in a bounded loop, while independent review perspectives can run in parallel ([`18-orchestrators/README.md`](https://github.com/addyosmani/agent-engineer/blob/d06e2cbed4481621a453cee8743d99669df3a7ba/18-orchestrators/README.md#L141-L201)). Its skill chapter treats skills as focused, on-demand packages that can be shared across agents and updated independently ([`17-agent-skills/README.md`](https://github.com/addyosmani/agent-engineer/blob/d06e2cbed4481621a453cee8743d99669df3a7ba/17-agent-skills/README.md#L21-L44)).

### Bottega topology decision

The local audit found no agent-skill pair that should now be collapsed:

- `skills/implementing` serves Claude and Codex builders, initial slices and later fixes.
- `skills/reviewing` serves two model families and both integrated and delta rounds; it also owns shared schema and workflow assets.
- `skills/codebase-design` is consumed by Fable, builders, and reviewers.
- `skills/run` and `skills/panel` are orchestration methods, not methods attached to one worker agent.
- QA and the docs sweep already travel as one-use brief text from `skills/run`, which is the appropriate inline form.
- Panelist and panel-judge files contain identity only and do not duplicate a skill.

Inlining either builder or reviewer doctrine into its Claude agent would force Codex to consume a runtime-specific adapter or create a second copy. Keeping the shared methods canonical and the agent files as pointers is the smaller design.

## Recommended compact carry text

**Synthesis.** These are proposed Bottega rules, condensed from the evidence above.

### Builder

1. Work one vertical slice at the dispatched interface. Name the behavior that makes it green. See its test fail for the expected reason, add only enough code to pass, run focused checks while iterating, then run the host gates once on the finished slice.
2. Before adding code, check in order: required at all, already present in the repo, standard library, native platform, installed dependency, one direct expression, then minimum new code. Never reduce validation at trust boundaries, data-loss handling, security, accessibility, or signed product behavior.
3. Use the project's domain terms in names and tests. Read the relevant context glossary and architecture decisions. If the task, domain model, code, or decision record conflicts, report the contradiction instead of choosing silently.
4. The dispatched interface and seam are fixed. Follow the planned file structure and existing architecture. Improve depth behind the interface, but stop when success requires a new seam, contract change, or cross-scope restructuring.
5. Load a clearly matching installed technology skill before using that stack. Verify unfamiliar calls against the installed version and primary docs. Installed guidance supplements, but never overrides, the contract, architecture, repository rules, or gates.

### Reviewer

1. Review the fixed diff against two independent questions: does it implement exactly the signed behavior, and does it conform to repository and dispatched architecture? Report both verdicts. Passing one never masks failure on the other.
2. Read changed tests before implementation. Require behavior through the public interface, an independent expected value, credible red evidence, and real dependencies or fakes where practical. Treat skipped, weakened, implementation-coupled, tautological, or noisy tests as findings.
3. Treat completion as a claim. Verify it against the diff, the cold test-edit manifest, and fresh gate evidence. Check the full observable contract, including invariants, errors, ordering, timing, compatibility, and side effects.
4. Apply the depth checks to new structure: small interface, complexity hidden in one place, tests and callers crossing the same seam, no pass-through module, and no variation seam created for one adapter. An unplanned architecture change is a finding even when tests pass.
5. For visible work, require evidence from the real product surface. Visual divergence, console errors or warnings, failed network activity, responsive breakage, accessibility failure, or absent runtime evidence blocks a clean result.

## Limits and source conflicts

- The heads above are a dated snapshot, not moving `main` links. Releases and closed branches were not used.
- Ponytail permits a much smaller test floor than Bottega. Its ladder and explicit quality exclusions are useful; its one-check policy is not adopted because Bottega and the other sources require stronger test-first and host-gate evidence.
- Superpowers and Addy use very broad mandatory skill-trigger rules. The recommendation narrows this to a clear match for technology being touched, avoiding unrelated skill loading.
- Product-surface guidance rests on Addy's active browser-testing sources. Pocock's QA workflow is deprecated, so it is cited only to explain why it was excluded.
