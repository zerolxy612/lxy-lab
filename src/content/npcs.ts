import type { StationId } from './stations'

export type NpcId = 'rook' | 'mira'

export interface NpcPrompt {
  id: string
  index: string
  question: string
  answer: string
  route: Readonly<{ stationId: StationId; label: string }>
}

export interface NpcContent {
  id: NpcId
  name: string
  role: string
  status: string
  accent: `#${string}`
  summary: string
  prompts: readonly NpcPrompt[]
}

export const npcs: readonly NpcContent[] = [
  {
    id: 'rook',
    name: 'ROOK',
    role: 'Mobile maintenance unit',
    status: 'Patrol pauses while connected',
    accent: '#68e5ff',
    summary: 'ROOK patrols the systems bay and talks through the engineering choices that keep the room dependable.',
    prompts: [
      {
        id: 'reliable-room',
        index: 'R1',
        question: 'What keeps this room reliable?',
        answer: 'A small typed boundary, explicit fallback paths, and content that remains usable without the canvas. The spectacle can fail without taking the story with it.',
        route: { stationId: 'systems', label: 'Inspect the Living AI Core' },
      },
      {
        id: 'react-phaser-boundary',
        index: 'R2',
        question: 'Why separate React from Phaser?',
        answer: 'React owns readable content, accessibility, and interface state. Phaser owns movement, proximity, and the room. A narrow event bridge keeps each side understandable.',
        route: { stationId: 'systems', label: 'See the system boundary' },
      },
      {
        id: 'maintain-first',
        index: 'R3',
        question: 'What do you maintain before adding features?',
        answer: 'Entry speed, failure recovery, input and focus, then content access. Once those are sound, motion and surprise can add character without becoming a tax.',
        route: { stationId: 'projects', label: 'Open the field notes' },
      },
    ],
  },
  {
    id: 'mira',
    name: 'MIRA',
    role: 'Archive keeper',
    status: 'Stationary at the Experience Archive',
    accent: '#ffc45c',
    summary: 'MIRA stays with the archive and connects Xiangyu’s interactive past to the AI products he wants to build next.',
    prompts: [
      {
        id: 'games-to-ai',
        index: 'M1',
        question: 'What carried from games into AI products?',
        answer: 'The same product lesson: complex state must feel legible. Games coordinate a world and its interface; AI products coordinate streaming, sources, tools, and human decisions.',
        route: { stationId: 'experience', label: 'Read the Experience Archive' },
      },
      {
        id: 'public-boundary',
        index: 'M2',
        question: 'What can this archive say in public?',
        answer: 'It can describe a TON-ecosystem Web3 game at Tencent IEG and government-facing Legal AI work at HKGAI. Client identities, internal data, and sensitive screens stay outside this room.',
        route: { stationId: 'projects', label: 'Review the public field notes' },
      },
      {
        id: 'future-direction',
        index: 'M3',
        question: 'What is Xiangyu building toward?',
        answer: 'AI-native applications and agent systems grounded in products people can understand and use—not intelligence as a demo, but capability shaped into a dependable experience.',
        route: { stationId: 'future', label: 'Visit the Future Gate' },
      },
    ],
  },
]

export const npcById = Object.fromEntries(
  npcs.map((npc) => [npc.id, npc]),
) as Record<NpcId, NpcContent>
