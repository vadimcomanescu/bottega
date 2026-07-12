export const meta = {
  name: 'panel',
  description: 'Fan one task to independent frontier panelists, blind, judge, return the comparison',
  phases: [{ title: 'Draft' }, { title: 'Judge' }],
}

const PANELIST = {
  type: 'object',
  required: ['draft', 'claims', 'assumptions', 'would_change'],
  properties: {
    draft: { type: 'string', description: 'the complete answer, self-contained' },
    claims: { type: 'array', items: { type: 'string' }, description: 'claims the draft stands on' },
    assumptions: { type: 'array', items: { type: 'string' } },
    would_change: { type: 'array', items: { type: 'string' }, description: 'what would change this answer' },
  },
}

const JUDGE = {
  type: 'object',
  required: ['consensus', 'contradictions', 'partial_coverage', 'unique_insights', 'blind_spots'],
  properties: {
    consensus: { type: 'array', items: { type: 'string' }, description: 'where the drafts agree, with the evidence' },
    contradictions: { type: 'array', items: { type: 'string' }, description: 'where they disagree, quoting each side' },
    partial_coverage: { type: 'array', items: { type: 'string' }, description: 'what each draft covers only partly' },
    unique_insights: { type: 'array', items: { type: 'string' }, description: 'what only one draft saw' },
    blind_spots: { type: 'array', items: { type: 'string' }, description: 'what no draft addressed' },
  },
}

phase('Draft')
// Barrier is correct here: the judge needs every draft before it can compare.
const [a, b] = await parallel([
  // Panelist A: gpt-5.6-sol at ultra, launched through the plugin's codex
  // dispatch script (args.codexExec, an absolute path the orchestrator
  // passes). A cheap agent runs it and returns the answer parsed to PANELIST.
  () => agent(`Dispatch codex through the script at ${args.codexExec}: write the task below to a brief file in a temp directory, then run the script with --model gpt-5.6-sol --effort ultra --sandbox read-only --cwd <the repo root> --brief <the brief file> --out <an out file> --events <an events file>, wait for it to exit, and return the out file's answer in the schema.\n\nTask:\n${args.task}`,
              { label: 'panelist:sol', model: 'sonnet', effort: 'low', schema: PANELIST }),
  // Panelist B: fable at high, the panelist identity.
  () => agent(args.task, { label: 'panelist:fable', agentType: 'bottega:panelist', model: 'fable', effort: 'high', schema: PANELIST }),
])

// Blind in code: fixed labels, model names never reach the judge.
const blinded = `Task:\n${args.task}\n\nDraft A:\n${a.draft}\n\nDraft B:\n${b.draft}`

phase('Judge')
const judge = await agent(`${blinded}\n\nCompare draft A and draft B.`,
  { label: 'judge', agentType: 'bottega:panel-judge', model: 'fable', effort: 'high', schema: JUDGE })

return { A: a, B: b, judge }
