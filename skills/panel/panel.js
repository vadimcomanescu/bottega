export const meta = {
  name: 'panel',
  description: 'Collect two independent plan drafts, blind them, and return a structured comparison',
  phases: [{ title: 'Draft' }, { title: 'Compare' }],
}

const PANELIST = {
  type: 'object',
  additionalProperties: false,
  required: ['draft', 'claims', 'assumptions', 'would_change'],
  properties: {
    draft: { type: 'string', description: 'complete self-contained answer' },
    claims: { type: 'array', items: { type: 'string' } },
    assumptions: { type: 'array', items: { type: 'string' } },
    would_change: { type: 'array', items: { type: 'string' } },
  },
}

const JUDGE = {
  type: 'object',
  additionalProperties: false,
  required: ['consensus', 'contradictions', 'partial_coverage', 'unique_insights', 'blind_spots'],
  properties: {
    consensus: { type: 'array', items: { type: 'string' } },
    contradictions: { type: 'array', items: { type: 'string' } },
    partial_coverage: { type: 'array', items: { type: 'string' } },
    unique_insights: { type: 'array', items: { type: 'string' } },
    blind_spots: { type: 'array', items: { type: 'string' } },
  },
}

phase('Draft')
const task = `Work independently on this task, using the repository as evidence. Give a complete answer with claims, assumptions, and evidence that would change it.\n\nTask:\n${args.task}`
const [a, b] = await parallel([
  () => agent(
    `Dispatch Codex through ${args.codexExec}. Write the task below to a temporary brief, then run the script with --model gpt-5.6-sol --effort max --sandbox read-only --cwd ${args.cwd} --brief <brief> --out <out> --events <events>. Wait for exit and return the final answer in the required schema.\n\n${task}`,
    { label: 'panelist:sol', model: 'sonnet', effort: 'low', schema: PANELIST },
  ),
  () => agent(task, {
    label: 'panelist:opus',
    agentType: 'bottega:panelist',
    model: 'opus',
    effort: 'xhigh',
    schema: PANELIST,
  }),
])

// A failed panelist resolves to null; a one-draft comparison is not a panel.
if (!a || !b) throw new Error('a panelist returned no draft; the comparison needs both, re-run the panel')

const blinded = `Task:\n${args.task}\n\nDraft A:\n${JSON.stringify(a, null, 2)}\n\nDraft B:\n${JSON.stringify(b, null, 2)}`

phase('Compare')
const judge = await agent(`${blinded}\n\nCompare draft A and draft B.`, {
  label: 'panel-judge',
  agentType: 'bottega:panel-judge',
  model: 'fable',
  effort: 'high',
  schema: JUDGE,
})

return { A: a, B: b, judge }
