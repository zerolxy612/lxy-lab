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
    period: '2024.07 — 2025.05',
    name: 'TON Ecosystem Web3 Game',
    type: 'Tencent IEG · Interactive systems',
    summary: 'Built production Web3 game features across React interfaces and Phaser worlds, with TON wallet state and game events behaving as one product flow.',
    signal: 'React ↔ EventBus ↔ Phaser · TON wallet',
    ownership: 'Core business modules across the React interface, Phaser runtime, wallet integration, and asset entry path.',
    challenge: 'Keep web UI, game state, and asset-heavy entry behavior feeling like one coherent product rather than two adjacent runtimes.',
    decisions: [
      'Connected React and Phaser through a shared event boundary.',
      'Reduced entry friction through compression, preloading, staged loading, and cache strategy.',
      'Built reusable UI foundations for production game features.',
    ],
    outcome: 'Shipped an interactive TON-ecosystem Web3 game at Tencent IEG.',
    publicBoundary: 'Public case note. Product internals and non-public production material are intentionally omitted.',
  },
  {
    id: 'government-legal-ai',
    index: '02',
    period: '2025.06 — Present',
    name: 'Government-facing Legal AI',
    type: 'HKGAI · AI application engineering',
    summary: 'Own the frontend of a Legal AI platform spanning streamed reasoning, evidence-backed research, long-running agents, document understanding, and structured legal views.',
    signal: 'SSE · agent state · citations · ReactFlow / Mermaid',
    ownership: 'Frontend ownership from requirement breakdown and architecture through integration, performance governance, deployment, and production diagnosis.',
    challenge: 'Make generative AI behavior, source evidence, and document-heavy legal tasks understandable inside a reliable product workflow.',
    decisions: [
      'Unified answer text, reasoning, retrieval citations, tool calls, cancellation, timeout, retry, and partial recovery over SSE.',
      'Modelled persistent Deep Research stages and cross-session recovery with Zustand.',
      'Turned case relationships, timelines, and evidence paths into layered interactive diagrams.',
    ],
    outcome: 'Delivered production workflows and reduced the main entry bundle from 747 KiB to 274 KiB gzip (−63%); first-load Chat dependencies fell from about 1.17 MiB to 474 KiB (−60%).',
    publicBoundary: 'Confidential case note. Project name, client identity, data, documents, and internal interfaces are not public.',
  },
]
