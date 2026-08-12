import { describe, expect, it } from 'vitest'
import { shouldUseArchiveCorridor } from './archiveCorridorRoute'

describe('archive corridor routing', () => {
  it('uses the walkable corridor for desktop transfers between the lab and library', () => {
    expect(shouldUseArchiveCorridor('lab', 'library', false, false)).toBe(true)
    expect(shouldUseArchiveCorridor('library', 'lab', false, false)).toBe(true)
  })

  it('keeps compact and reduced-motion routes direct', () => {
    expect(shouldUseArchiveCorridor('lab', 'library', true, false)).toBe(false)
    expect(shouldUseArchiveCorridor('lab', 'library', false, true)).toBe(false)
  })
})
