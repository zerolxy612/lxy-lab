import type { StationId } from './stations'

export type NpcId = 'rook' | 'mira'

export interface NpcPrompt {
  id: string
  index: string
  question: string
  lines: readonly string[]
  route?: Readonly<{ stationId: StationId; label: string }>
}

interface NpcOpeningSet {
  first: readonly string[]
  repeats: readonly (readonly string[])[]
  familiar: readonly string[]
  context?: Readonly<{
    stationId: StationId
    lines: readonly string[]
  }>
}

export interface NpcContent {
  id: NpcId
  name: string
  role: string
  status: string
  accent: `#${string}`
  summary: string
  choicePrompt: string
  barks: readonly string[]
  openings: NpcOpeningSet
  prompts: readonly NpcPrompt[]
}

export const npcs: readonly NpcContent[] = [
  {
    id: 'rook',
    name: 'ROOK',
    role: 'Mobile maintenance unit',
    status: 'Maintenance channel / local',
    accent: '#68e5ff',
    summary: 'ROOK patrols the systems bay and treats every visitor as a new maintenance variable.',
    choicePrompt: 'Go on. Pick a problem.',
    barks: [
      'Please avoid the blue cable.',
      'That was the blue cable.',
      'The core is humming in a new key.',
      'Maintenance note: visitors remain unpredictable.',
    ],
    openings: {
      first: [
        'Hold there.',
        'You are standing on coolant line 03.',
        '…Never mind. It has survived three visitors tonight.',
      ],
      repeats: [
        ['Back already?', 'Either the room is interesting, or you have concerns about the wiring.'],
        ['You again.', 'Good. Consistent anomalies are easier to document.'],
      ],
      familiar: [
        'Fourth inspection.',
        'I am beginning to suspect the machine is inspecting you.',
      ],
      context: {
        stationId: 'systems',
        lines: [
          'The core changed pitch while you were looking at it.',
          'It claims this was normal load variation. The core is very good at choosing facts.',
        ],
      },
    },
    prompts: [
      {
        id: 'machine-noise',
        index: 'R1',
        question: 'Has it always been this loud?',
        lines: [
          'Only since the core learned that silence makes humans nervous.',
          'Now it hums reassuringly while processing several deeply unreassuring things.',
        ],
        route: { stationId: 'systems', label: 'Take a closer look at the core' },
      },
      {
        id: 'repairing-tonight',
        index: 'R2',
        question: 'What are you repairing?',
        lines: [
          'Tonight? A loading path, two fallback states, and someone’s confidence in perfect networks.',
          'The dramatic failures are easy. It is the polite little failures that live longest.',
        ],
      },
      {
        id: 'shared-silence',
        index: 'R3',
        question: 'Say nothing.',
        lines: [
          'Good.',
          'At last, someone understands the central principle of maintenance.',
        ],
      },
    ],
  },
  {
    id: 'mira',
    name: 'MIRA',
    role: 'Archive keeper',
    status: 'Archive desk / after hours',
    accent: '#ffc45c',
    summary: 'MIRA keeps the public archive, the private omissions, and a dry sense of proportion.',
    choicePrompt: 'Choose carefully. The archive takes phrasing personally.',
    barks: [
      'The archive is closed. Naturally, it remains accessible.',
      'Some records prefer the rain.',
      'The lowest drawer is not stuck. It is selective.',
      'A polite omission can still be a very loud clue.',
    ],
    openings: {
      first: [
        'The archive is closed.',
        'Of course, it has never officially been open.',
        'You may stay.',
      ],
      repeats: [
        ['Back for another footnote?', 'Those are usually where the interesting decisions hide.'],
        ['I remember you.', 'The archive does too, but it is less discreet about it.'],
      ],
      familiar: [
        'You have become a recurring entry.',
        'Do not worry. I have filed you under “probably intentional.”',
      ],
      context: {
        stationId: 'future',
        lines: [
          'You looked at the sealed gate.',
          'Good. Curiosity is still operating within normal parameters.',
          'As for what is behind it—the archive is declining to comment.',
        ],
      },
    },
    prompts: [
      {
        id: 'recording',
        index: 'M1',
        question: 'What are you recording?',
        lines: [
          'Mostly turning points: the moment a prototype becomes a product, or a clever system becomes legible.',
          'Dates are useful. Decisions are usually more honest.',
        ],
        route: { stationId: 'experience', label: 'Browse the public archive' },
      },
      {
        id: 'off-limits',
        index: 'M2',
        question: 'Is anything off-limits?',
        lines: [
          'Names, private data, internal screens—the usual locked drawers.',
          'A boundary does not make the story smaller. It reveals what someone chooses to protect.',
        ],
        route: { stationId: 'projects', label: 'Read the public field notes' },
      },
      {
        id: 'passing-through',
        index: 'M3',
        question: 'Just passing through.',
        lines: [
          'Everyone says that in an archive.',
          'Then they begin with the lowest drawer.',
        ],
      },
    ],
  },
]

export const npcById = Object.fromEntries(
  npcs.map((npc) => [npc.id, npc]),
) as Record<NpcId, NpcContent>

export function selectNpcOpening(
  npcId: NpcId,
  talkCount: number,
  visitedStations: ReadonlySet<StationId>,
) {
  const openings = npcById[npcId].openings
  if (talkCount <= 1) return openings.first
  if (talkCount >= 4) return openings.familiar
  if (openings.context && visitedStations.has(openings.context.stationId)) {
    return openings.context.lines
  }
  return openings.repeats[(talkCount - 2) % openings.repeats.length]
}
