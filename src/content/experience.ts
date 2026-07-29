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
    organization: 'Hong Kong Generative AI R&D Center',
    role: 'AI Application Engineering',
    context: 'Turning generative AI research into application workflows and product experiences.',
    focus: [
      'AI-native applications',
      'Agent systems and retrieval workflows',
      'Frontend-to-AI product integration',
    ],
  },
  {
    period: '2024',
    organization: 'Tencent IEG',
    role: 'Interactive Web Experience',
    context: 'Building performance-minded interactive experiences where engineering and visual execution meet.',
    focus: [
      'Interactive frontend engineering',
      'WebGL and mini-game experiences',
      'Real-time interaction and performance',
    ],
  },
]

export const experiencePrinciples = [
  'Start from the product problem, not the technology label.',
  'Make system behavior legible to the people using it.',
  'Treat frontend quality and AI architecture as one product experience.',
] as const
