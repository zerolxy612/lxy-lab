import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  ROOM_BACKGROUND_HEIGHT,
  ROOM_BACKGROUND_TEXTURE_URL,
  ROOM_BACKGROUND_WIDTH,
} from './roomBackgroundArt'

describe('roomBackgroundArt', () => {
  it('matches the fixed Phaser canvas', () => {
    expect(ROOM_BACKGROUND_WIDTH).toBe(960)
    expect(ROOM_BACKGROUND_HEIGHT).toBe(540)
    expect(ROOM_BACKGROUND_TEXTURE_URL).toBe(
      '/assets/game/backgrounds/lab-room-background-v1.png',
    )

    const image = readFileSync(
      new URL(`../../../public${ROOM_BACKGROUND_TEXTURE_URL}`, import.meta.url),
    )
    expect(image.subarray(1, 4).toString('ascii')).toBe('PNG')
    expect(image.readUInt32BE(16)).toBe(ROOM_BACKGROUND_WIDTH)
    expect(image.readUInt32BE(20)).toBe(ROOM_BACKGROUND_HEIGHT)
  })
})
