export const PLAYER_SHEET_KEY = 'xiangyu-player-v1'
export const PLAYER_SHEET_URL = '/assets/game/sprites/xiangyu-player-v1.png'
export const PLAYER_FRAME_WIDTH = 40
export const PLAYER_FRAME_HEIGHT = 48

export const PLAYER_DIRECTIONS = ['down', 'left', 'right', 'up'] as const
export type PlayerFacing = (typeof PLAYER_DIRECTIONS)[number]

interface PlayerDirectionFrames {
  idle: number
  walk: number
}

export const PLAYER_FRAMES = {
  down: { idle: 0, walk: 1 },
  left: { idle: 2, walk: 3 },
  right: { idle: 4, walk: 5 },
  up: { idle: 6, walk: 7 },
} as const satisfies Record<PlayerFacing, PlayerDirectionFrames>
