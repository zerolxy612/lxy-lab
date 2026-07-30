import { describe, expect, it } from 'vitest'
import { shouldBypassBoot } from './bootSequencePreferences'

describe('boot sequence preferences', () => {
  it('keeps the intro for a motion-enabled desktop viewport', () => {
    expect(shouldBypassBoot({ compactViewport: false, reducedMotion: false })).toBe(false)
  })

  it('bypasses the intro for compact or reduced-motion contexts', () => {
    expect(shouldBypassBoot({ compactViewport: true, reducedMotion: false })).toBe(true)
    expect(shouldBypassBoot({ compactViewport: false, reducedMotion: true })).toBe(true)
  })
})
