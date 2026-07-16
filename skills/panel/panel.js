export const meta = {
  name: 'panel',
  description: 'Collect two independent plan drafts, blind them, and return a structured comparison',
  phases: [{ title: 'Draft' }, { title: 'Compare' }],
}

// A caller that JSON-encodes the args object hands the script one string and
// every field reads undefined; the panelists then receive a task of "undefined".
const input = typeof args === 'string' ? JSON.parse(args) : args
for (const field of ['task', 'cwd', 'codexExec']) {
  if (typeof input?.[field] !== 'string' || !input[field]) throw new Error(`args.${field} is required`)
}
for (const field of ['panelistSchema', 'judgeSchema']) {
  if (!input?.[field] || typeof input[field] !== 'object' || Array.isArray(input[field])) {
    throw new Error(`args.${field} is required`)
  }
}

// Workflow scripts cannot read sibling files. The caller reads the canonical
// reference schemas and passes the parsed objects as workflow arguments.
const PANELIST = input.panelistSchema
const JUDGE = input.judgeSchema

// The Sol draft crosses two boundaries (wrapper agent, then codex), so the
// wrapper reports transport facts the script can check instead of being
// schema-forced to produce a draft when codex failed.
const SOL_TRANSPORT = {
  type: 'object',
  additionalProperties: false,
  required: ['exit_code', 'draft'],
  properties: {
    exit_code: { type: 'integer', description: 'codex-exec exit code' },
    draft: {
      anyOf: [PANELIST, { type: 'null' }],
      description: 'the JSON codex wrote to --out; null when the dispatch failed',
    },
  },
}

phase('Draft')
const task = `Work independently on this task, using the repository at ${input.cwd} as evidence. Give a complete answer with claims, assumptions, and evidence that would change it.\n\nTask:\n${input.task}`
const [transport, b] = await parallel([
  () => agent(
    `Dispatch Codex through ${input.codexExec}. Write the task below to a temporary brief file, and this JSON Schema to a temporary schema file:\n\n${JSON.stringify(PANELIST)}\n\nThen run the script with --model gpt-5.6-sol --effort max --sandbox read-only --cwd ${input.cwd} --brief <brief> --out <out> --events <events> --schema <schema>, every path absolute (the script refuses relative paths). Wait for exit. Report exit_code and, when it is 0, the parsed JSON from the out file as draft. Never author or repair the draft yourself: on a nonzero exit or JSON that does not match the schema, report draft: null.\n\n${task}`,
    { label: 'panelist:sol', model: 'sonnet', effort: 'low', schema: SOL_TRANSPORT },
  ),
  () => agent(task, {
    label: 'panelist:fable',
    agentType: 'bottega:panelist',
    model: 'fable',
    effort: 'high',
    schema: PANELIST,
  }),
])

// A failed panelist resolves to null, and a Sol dispatch only counts when
// codex itself exited 0 with a schema-valid draft; a one-draft comparison is
// not a panel.
const a = transport && transport.exit_code === 0 ? transport.draft : null
if (!a || !b) throw new Error('a panelist returned no draft; the comparison needs both, re-run the panel')

const blinded = `Task:\n${input.task}\n\nDraft A:\n${JSON.stringify(a, null, 2)}\n\nDraft B:\n${JSON.stringify(b, null, 2)}`

phase('Compare')
const judge = await agent(`${blinded}\n\nCompare draft A and draft B.`, {
  label: 'panel-judge',
  agentType: 'bottega:panel-judge',
  model: 'fable',
  effort: 'high',
  schema: JUDGE,
})

return { A: a, B: b, judge }
