export interface ProjectSummary {
  id: string
  name: string
  type: string
  summary: string
  signal: string
}

export const selectedProjects: readonly ProjectSummary[] = [
  {
    id: 'ton-web3-game',
    name: 'TON Ecosystem Web3 Game',
    type: 'Tencent IEG · Interactive systems',
    summary: 'Built production game features with React, TypeScript, and Phaser, connecting the web interface and game world through a shared event system.',
    signal: 'React ↔ shared events ↔ Phaser',
  },
  {
    id: 'government-legal-ai',
    name: 'Government-facing Legal AI',
    type: 'HKGAI · AI application engineering',
    summary: 'Led the frontend from foundation to production, shaping streaming answers, source citations, document generation, and multi-step legal workflows.',
    signal: 'Streaming answers · citations · generated documents',
  },
]
