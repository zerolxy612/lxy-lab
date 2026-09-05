export const independentBuild = {
  index: 'SELF-01',
  title: 'Xiangyu’s AI Lab',
  label: 'Independent product · living portfolio',
  summary: 'A personal world built to test whether engineering judgment can be experienced instead of listed. The laboratory combines an accessible React interface, a Phaser runtime, original pixel-art direction, authored characters, and a local publishing system.',
  signals: [
    'Designed the product, interaction model, content system, and world structure as one independent build.',
    'Uses two runtimes with a typed event boundary so the playable space never owns critical content.',
    'Treats writing, accessibility, reduced motion, direct URLs, and local-first publishing as product features.',
  ],
} as const

export const currentQuestions = [
  'How should a long-running agent show progress without pretending its next step is certain?',
  'How can evidence remain attached to generated answers, diagrams, and documents as they change form?',
  'When does an explorable interface communicate a technical idea better than another dashboard?',
] as const

export const researchSignals = [
  {
    index: 'R01',
    title: 'CareerCraft',
    context: 'ACM CHI 2026 · third author',
    summary: 'LLM-assisted self-construction of career profiles for new graduates navigating job search.',
  },
  {
    index: 'R02',
    title: 'Trustworthy Legal Reasoning in 2026',
    context: 'Preprint · co-author',
    summary: 'A mid-year review connecting legal-AI research, products, events, and governance.',
  },
] as const

export const education = {
  period: '2020.09 — 2024.06',
  institution: 'Hunan Agricultural University',
  degree: 'B.Eng. in Computer Science and Technology',
  detail: '87.02 average · top 10% · national Computer Design Competition award',
} as const
