export type StationId =
  | 'assistant'
  | 'experience'
  | 'systems'
  | 'projects'
  | 'future'

export interface StationContent {
  id: StationId
  index: string
  title: string
  eyebrow: string
  summary: string
  details: readonly string[]
}

export const stations: readonly StationContent[] = [
  {
    id: 'assistant',
    index: '01',
    title: 'Lab Companion',
    eyebrow: 'Ask the room',
    summary: 'A short orientation to Xiangyu, the room, and the ideas hidden inside it.',
    details: [
      'Explore at your own pace, or use Quick Access for the short path.',
      'The archive keeps the story memorable rather than repeating a full résumé.',
    ],
  },
  {
    id: 'experience',
    index: '02',
    title: 'Experience Archive',
    eyebrow: 'Past signals',
    summary: 'Roles, turning points, and lessons collected along the way.',
    details: [
      'Interactive web experience at Tencent IEG.',
      'Generative AI research and application engineering in Hong Kong.',
    ],
  },
  {
    id: 'systems',
    index: '03',
    title: 'Living AI Core',
    eyebrow: 'How the lab thinks',
    summary: 'Production lessons carried from interactive systems into AI-native products.',
    details: [
      'React and Phaser connected through a shared event boundary.',
      'Streaming answers, citations, and multi-step workflows shaped as legible interfaces.',
    ],
  },
  {
    id: 'projects',
    index: '04',
    title: 'Selected Work',
    eyebrow: 'Things built',
    summary: 'Two concise field notes from shipped interactive and AI application work.',
    details: [
      'A TON-ecosystem Web3 game built at Tencent IEG.',
      'A confidential government-facing Legal AI application led at HKGAI.',
    ],
  },
  {
    id: 'future',
    index: '05',
    title: 'Future Gate',
    eyebrow: 'In progress',
    summary: 'Open questions, current experiments, and directions still taking shape.',
    details: [
      'AI-native applications and agent systems.',
      'Research translated into products people can actually use.',
      'A full résumé will join the public release; direct contact is already open.',
    ],
  },
]

export const stationById = Object.fromEntries(
  stations.map((station) => [station.id, station]),
) as Record<StationId, StationContent>
