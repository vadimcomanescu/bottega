# 0010: Skills share one house format, held by writing-great-skills and its closing checklist

Date: 2026-07-23

The skills had drifted structurally (four encodings of numbered phases, three pointer styles, inconsistent frontmatter) because the skill-writing reference taught principles but prescribed no shape. The Agent Skills standard and Anthropic's own skill corpus deliberately refuse a universal body template ("there are no format restrictions"), but the one structurally uniform cluster in Anthropic's repo is the document-skill family a single team maintains as a set. Bottega is one team and one method, so it takes the family convention: a fixed outer contract (universal frontmatter per the open standard with harness-specific keys as justified exceptions, sentence-case H1 plus an imperative outcome sentence, one pointer style, under 500 lines with references one level deep) and two body shapes, numbered `## N. Verb` phases ending on completion criteria for procedures, topical rule headings for references.

The contract lives in `skills/writing-great-skills` with a closing checklist because AGENTS.md already loads that skill on every skill edit, so it fires by construction instead of needing to be remembered. No test enforces the body shape, matching the standard's own line: its reference validator checks frontmatter only, and the body stays a review concern.

The directory's "vendored" freeze was removed in the same change: it named no upstream and carried no license or sync contract (unlike `skills/code-review/`), and it kept the house doctrine out of the one file every skill edit reads.

Considered and rejected: one rigid template with mandated headings for every skill (forces fake sequencing onto rule tables; every surveyed source, from the standard to Anthropic's best-practices patterns, matches form to the skill's job), and a deterministic frontmatter test (declined by the owner as machinery the checklist already covers).
