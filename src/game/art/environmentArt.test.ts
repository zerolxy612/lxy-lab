import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  OFFLINE_CORNER_TEXTURE_HEIGHT,
  OFFLINE_CORNER_TEXTURE_URL,
  OFFLINE_CORNER_TEXTURE_WIDTH,
  RAG_PIPELINE_TEXTURE_HEIGHT,
  RAG_PIPELINE_TEXTURE_URL,
  RAG_PIPELINE_TEXTURE_WIDTH,
} from './environmentArt'

const expectPngDimensions = (url: string, width: number, height: number) => {
  const image = readFileSync(new URL(`../../../public${url}`, import.meta.url))
  expect(image.subarray(1, 4).toString('ascii')).toBe('PNG')
  expect(image.readUInt32BE(16)).toBe(width)
  expect(image.readUInt32BE(20)).toBe(height)
}

describe('environmentArt', () => {
  it('keeps the v0.5 environmental storytelling assets aligned with their contracts', () => {
    expectPngDimensions(
      RAG_PIPELINE_TEXTURE_URL,
      RAG_PIPELINE_TEXTURE_WIDTH,
      RAG_PIPELINE_TEXTURE_HEIGHT,
    )
    expectPngDimensions(
      OFFLINE_CORNER_TEXTURE_URL,
      OFFLINE_CORNER_TEXTURE_WIDTH,
      OFFLINE_CORNER_TEXTURE_HEIGHT,
    )
  })
})
