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
    summary: 'A guided way to explore Xiangyu, his work, and his thinking.',
    details: [
      'Introduces the lab without replacing its navigation.',
      'Starts with curated questions before any live AI integration.',
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
    title: 'AI Systems Core',
    eyebrow: 'How things work',
    summary: 'The engineering ideas behind useful AI-native products.',
    details: [
      'Retrieval, agents, evaluation, and knowledge workflows.',
      'Architecture decisions explained through working systems.',
    ],
  },
  {
    id: 'projects',
    index: '04',
    title: 'Selected Work',
    eyebrow: 'Things built',
    summary: 'A changing collection of products, experiments, and interactive systems.',
    details: [
      'Projects are presented through problems, ownership, decisions, and evidence.',
      'No single project defines the lab or Xiangyu’s work.',
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
    ],
  },
]

export const stationById = Object.fromEntries(
  stations.map((station) => [station.id, station]),
) as Record<StationId, StationContent>
