import type { StationId } from '../../content/stations'

export interface RectangleLayout {
  x: number
  y: number
  width: number
  height: number
}

export interface StationLayout extends RectangleLayout {
  id: StationId
  color: number
  interactionPadding: number
}

export const labWorldBounds: RectangleLayout = {
  x: 58,
  y: 72,
  width: 844,
  height: 428,
}

export const playerSpawn = {
  x: 480,
  y: 462,
} as const

export const staticObstacles: readonly RectangleLayout[] = [
  { x: 146, y: 438, width: 176, height: 62 },
  { x: 286, y: 432, width: 78, height: 46 },
  { x: 802, y: 167, width: 158, height: 74 },
]

export const stationLayouts: readonly StationLayout[] = [
  {
    id: 'assistant',
    x: 178,
    y: 174,
    width: 116,
    height: 76,
    color: 0xcd55ff,
    interactionPadding: 62,
  },
  {
    id: 'experience',
    x: 145,
    y: 302,
    width: 178,
    height: 108,
    color: 0x5cdfff,
    interactionPadding: 62,
  },
  {
    id: 'systems',
    x: 480,
    y: 198,
    width: 164,
    height: 126,
    color: 0x68e5ff,
    interactionPadding: 58,
  },
  {
    id: 'projects',
    x: 792,
    y: 305,
    width: 184,
    height: 110,
    color: 0xa86cff,
    interactionPadding: 62,
  },
  {
    id: 'future',
    x: 797,
    y: 430,
    width: 122,
    height: 78,
    color: 0xffc45c,
    interactionPadding: 58,
  },
]
