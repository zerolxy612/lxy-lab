export interface ExperienceEntry {
  period: string
  organization: string
  role: string
  context: string
  focus: readonly string[]
}

export const experienceTimeline: readonly ExperienceEntry[] = [
  {
    period: '2025 — Present',
    organization: 'HKGAI · HKUST-affiliated',
    role: 'AI Application Engineering',
    context: 'Leading the frontend of government-facing Legal AI experiences from interaction foundations to production workflows.',
    focus: [
      'Streaming answers and source citations',
      'Document generation and multi-step workflows',
      'Reusable frontend foundations',
    ],
  },
  {
    period: '2024',
    organization: 'Tencent IEG',
    role: 'Interactive Web Experience',
    context: 'Building a TON-ecosystem Web3 game where React interfaces and Phaser systems move as one product.',
    focus: [
      'React-to-Phaser event bridge',
      'Asset loading and fast entry',
      'Reusable UI systems',
    ],
  },
]

export const experiencePrinciples = [
  'Start from the product problem, not the technology label.',
  'Make system behavior legible to the people using it.',
  'Treat frontend quality and AI architecture as one product experience.',
] as const
