import type { StationId } from './stations'

export interface CompanionPrompt {
  id: string
  index: string
  question: string
  answer: string
  route: {
    stationId: StationId
    label: string
  }
}

export const companionPrompts: readonly CompanionPrompt[] = [
  {
    id: 'what-xiangyu-builds',
    index: 'Q01',
    question: 'What does Xiangyu build?',
    answer: 'Interactive products that make complex systems feel legible — from a TON-ecosystem game to government-facing Legal AI workflows.',
    route: {
      stationId: 'projects',
      label: 'Open Selected Work',
    },
  },
  {
    id: 'why-react-phaser',
    index: 'Q02',
    question: 'Why React + Phaser?',
    answer: 'React handles accessible interfaces, Phaser handles space and movement, and a shared event boundary lets each system do one job well.',
    route: {
      stationId: 'systems',
      label: 'Inspect Living AI Core',
    },
  },
  {
    id: 'what-is-next',
    index: 'Q03',
    question: 'What is he exploring now?',
    answer: 'AI-native applications, agent systems, and practical ways to translate research into products people can understand and use.',
    route: {
      stationId: 'future',
      label: 'Enter Future Gate',
    },
  },
]
