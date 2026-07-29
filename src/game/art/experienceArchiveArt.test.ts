import { describe, expect, it } from 'vitest'
import {
  EXPERIENCE_ARCHIVE_FRAME_HEIGHT,
  EXPERIENCE_ARCHIVE_FRAME_WIDTH,
  EXPERIENCE_ARCHIVE_ORIGIN_Y,
} from './experienceArchiveArt'

describe('experienceArchiveArt', () => {
  it('keeps the archive aligned with the v0.3 art contract', () => {
    expect(EXPERIENCE_ARCHIVE_FRAME_WIDTH).toBe(192)
    expect(EXPERIENCE_ARCHIVE_FRAME_HEIGHT).toBe(128)
    expect(EXPERIENCE_ARCHIVE_ORIGIN_Y).toBeGreaterThan(0.5)
    expect(EXPERIENCE_ARCHIVE_ORIGIN_Y).toBeLessThan(1)
  })
})
