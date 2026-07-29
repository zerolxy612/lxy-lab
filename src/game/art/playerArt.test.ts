import { describe, expect, it } from 'vitest'
import {
  PLAYER_DIRECTIONS,
  PLAYER_FRAME_HEIGHT,
  PLAYER_FRAME_WIDTH,
  PLAYER_FRAMES,
} from './playerArt'

describe('playerArt', () => {
  it('registers one idle and walk frame for every facing direction', () => {
    const frames = PLAYER_DIRECTIONS.flatMap((direction) => [
      PLAYER_FRAMES[direction].idle,
      PLAYER_FRAMES[direction].walk,
    ])

    expect(frames).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(new Set(frames).size).toBe(frames.length)
  })

  it('defines the expected 80 by 192 pixel sheet contract', () => {
    expect(PLAYER_FRAME_WIDTH * 2).toBe(80)
    expect(PLAYER_FRAME_HEIGHT * PLAYER_DIRECTIONS.length).toBe(192)
  })
})
