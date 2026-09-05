export interface ExperienceEntry {
  period: string
  organization: string
  role: string
  context: string
  focus: readonly string[]
}

export const experienceTimeline: readonly ExperienceEntry[] = [
  {
    period: '2025.06 — Present',
    organization: 'HKGAI · HKUST-affiliated',
    role: 'Frontend Owner · AI Application Engineering',
    context: 'Owning the frontend delivery of government-facing Legal AI products, from product and technical review through production troubleshooting.',
    focus: [
      'Streaming, citations, tool calls, and long-running agent state',
      'Legal documents, research workflows, and complex visualisation',
      'CI/CD, containers, security policy, and private deployment',
    ],
  },
  {
    period: '2024.07 — 2025.05',
    organization: 'Tencent IEG · Shenzhen',
    role: 'Frontend Development Intern',
    context: 'Building Web3 games and interactive products across React interfaces, Phaser worlds, Three.js scenes, and TON ecosystem integrations.',
    focus: [
      'React-to-Phaser event bridge',
      'Asset loading, caching, and rendering performance',
      'Wallet connection and reusable product foundations',
    ],
  },
]

export const experiencePrinciples = [
  'Start from the product problem, not the technology label.',
  'Give progress, evidence, and failure states an interface people can understand.',
  'Treat frontend quality, AI architecture, and delivery constraints as one product system.',
] as const
