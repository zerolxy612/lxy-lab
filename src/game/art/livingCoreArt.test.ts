import { describe, expect, it } from 'vitest'
import {
  LIVING_CORE_FRAME_HEIGHT,
  LIVING_CORE_FRAME_WIDTH,
  LIVING_CORE_ORIGIN_Y,
} from './livingCoreArt'

describe('livingCoreArt', () => {
  it('keeps the core aligned with the v0.3 art contract', () => {
    expect(LIVING_CORE_FRAME_WIDTH).toBe(192)
    expect(LIVING_CORE_FRAME_HEIGHT).toBe(160)
    expect(LIVING_CORE_ORIGIN_Y).toBeGreaterThan(0.5)
    expect(LIVING_CORE_ORIGIN_Y).toBeLessThan(1)
  })
})
