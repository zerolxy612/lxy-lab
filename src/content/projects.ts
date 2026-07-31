export interface ProjectSummary {
  id: string
  index: string
  period: string
  name: string
  type: string
  summary: string
  signal: string
  ownership: string
  challenge: string
  decisions: readonly string[]
  outcome: string
  publicBoundary: string
}

export const selectedProjects: readonly ProjectSummary[] = [
  {
    id: 'ton-web3-game',
    index: '01',
    period: '2024',
    name: 'TON Ecosystem Web3 Game',
    type: 'Tencent IEG · Interactive systems',
    summary: 'Built production game features with React, TypeScript, and Phaser, connecting the web interface and game world through a shared event system.',
    signal: 'React ↔ shared events ↔ Phaser',
    ownership: 'Production features across the React interface and Phaser game layer.',
    challenge: 'Keep web UI, game state, and asset-heavy entry behavior feeling like one coherent product rather than two adjacent runtimes.',
    decisions: [
      'Connected React and Phaser through a shared event boundary.',
      'Designed loading and fast-entry behavior around the player experience.',
      'Built reusable UI foundations for production game features.',
    ],
    outcome: 'Shipped an interactive TON-ecosystem Web3 game at Tencent IEG.',
    publicBoundary: 'Public case note. Product internals and non-public production material are intentionally omitted.',
  },
  {
    id: 'government-legal-ai',
    index: '02',
    period: '2025 — Present',
    name: 'Government-facing Legal AI',
    type: 'HKGAI · AI application engineering',
    summary: 'Led the frontend from foundation to production, shaping streaming answers, source citations, document generation, and multi-step legal workflows.',
    signal: 'Streaming answers · citations · generated documents',
    ownership: 'Frontend leadership from interaction foundations through production workflows.',
    challenge: 'Make generative AI behavior, source evidence, and document-heavy legal tasks understandable inside a reliable product workflow.',
    decisions: [
      'Made streaming answer state and citations legible as one response experience.',
      'Connected document generation to clear multi-step user workflows.',
      'Established reusable frontend foundations for continued product delivery.',
    ],
    outcome: 'Delivered production frontend workflows for a government-facing Legal AI application at HKGAI.',
    publicBoundary: 'Confidential case note. Project name, client identity, data, documents, and internal interfaces are not public.',
  },
]
