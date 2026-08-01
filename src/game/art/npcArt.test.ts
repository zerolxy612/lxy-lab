import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { NPC_ART, NPC_DIRECTIONS } from './npcArt'

const expectPngDimensions = (url: string, width: number, height: number) => {
  const image = readFileSync(new URL(`../../../public${url}`, import.meta.url))
  expect(image.subarray(1, 4).toString('ascii')).toBe('PNG')
  expect(image.readUInt32BE(16)).toBe(width)
  expect(image.readUInt32BE(20)).toBe(height)
}

describe('npcArt', () => {
  it('provides an idle and alternate frame in all four directions', () => {
    Object.values(NPC_ART).forEach(({ frames }) => {
      const indexes = NPC_DIRECTIONS.flatMap((direction) => [
        frames[direction].idle,
        frames[direction].gesture,
      ])
      expect(indexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })
  })

  it('keeps both runtime sheets aligned with their frame contracts', () => {
    Object.values(NPC_ART).forEach((art) => {
      expectPngDimensions(art.url, art.frameWidth * 2, art.frameHeight * 4)
    })
  })
})
