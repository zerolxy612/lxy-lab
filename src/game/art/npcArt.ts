import type { NpcId } from '../../content/npcs'
import type { PlayerFacing } from './playerArt'

export const NPC_DIRECTIONS = ['down', 'left', 'right', 'up'] as const

interface NpcArtDefinition {
  key: string
  url: string
  frameWidth: number
  frameHeight: number
  frames: Record<PlayerFacing, Readonly<{ idle: number; gesture: number }>>
}

const directionalFrames = {
  down: { idle: 0, gesture: 1 },
  left: { idle: 2, gesture: 3 },
  right: { idle: 4, gesture: 5 },
  up: { idle: 6, gesture: 7 },
} as const

export const NPC_ART: Record<NpcId, NpcArtDefinition> = {
  rook: {
    key: 'rook-v1',
    url: '/assets/game/sprites/rook-v1.png',
    frameWidth: 56,
    frameHeight: 44,
    frames: directionalFrames,
  },
  mira: {
    key: 'mira-v1',
    url: '/assets/game/sprites/mira-v1.png',
    frameWidth: 40,
    frameHeight: 48,
    frames: directionalFrames,
  },
}
