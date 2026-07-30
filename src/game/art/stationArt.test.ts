import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  FUTURE_GATE_TEXTURE_HEIGHT,
  FUTURE_GATE_TEXTURE_URL,
  FUTURE_GATE_TEXTURE_WIDTH,
  LAB_COMPANION_TEXTURE_HEIGHT,
  LAB_COMPANION_TEXTURE_URL,
  LAB_COMPANION_TEXTURE_WIDTH,
  SELECTED_WORK_TEXTURE_HEIGHT,
  SELECTED_WORK_TEXTURE_URL,
  SELECTED_WORK_TEXTURE_WIDTH,
} from './stationArt'

const expectPngDimensions = (url: string, width: number, height: number) => {
  const image = readFileSync(new URL(`../../../public${url}`, import.meta.url))
  expect(image.subarray(1, 4).toString('ascii')).toBe('PNG')
  expect(image.readUInt32BE(16)).toBe(width)
  expect(image.readUInt32BE(20)).toBe(height)
}

describe('stationArt', () => {
  it('keeps the three v0.5 stations aligned with their texture contracts', () => {
    expectPngDimensions(
      LAB_COMPANION_TEXTURE_URL,
      LAB_COMPANION_TEXTURE_WIDTH,
      LAB_COMPANION_TEXTURE_HEIGHT,
    )
    expectPngDimensions(
      SELECTED_WORK_TEXTURE_URL,
      SELECTED_WORK_TEXTURE_WIDTH,
      SELECTED_WORK_TEXTURE_HEIGHT,
    )
    expectPngDimensions(
      FUTURE_GATE_TEXTURE_URL,
      FUTURE_GATE_TEXTURE_WIDTH,
      FUTURE_GATE_TEXTURE_HEIGHT,
    )
  })
})
