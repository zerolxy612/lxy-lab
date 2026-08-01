import { describe, expect, it } from 'vitest'
import {
  BOOT_VISITOR_STORAGE_KEY,
  isReturningVisitor,
  markBootVisit,
  shouldBypassBoot,
} from './bootSequencePreferences'

describe('boot sequence preferences', () => {
  it('keeps the intro for a motion-enabled desktop viewport', () => {
    expect(shouldBypassBoot({ compactViewport: false, reducedMotion: false })).toBe(false)
  })

  it('bypasses the intro for compact or reduced-motion contexts', () => {
    expect(shouldBypassBoot({ compactViewport: true, reducedMotion: false })).toBe(true)
    expect(shouldBypassBoot({ compactViewport: false, reducedMotion: true })).toBe(true)
  })

  it('changes the greeting only after a visit has been recorded', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    }

    expect(isReturningVisitor(storage)).toBe(false)
    markBootVisit(storage)
    expect(values.get(BOOT_VISITOR_STORAGE_KEY)).toBe('1')
    expect(isReturningVisitor(storage)).toBe(true)
  })

  it('continues safely when storage is unavailable', () => {
    const blockedStorage = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
    }

    expect(isReturningVisitor(blockedStorage)).toBe(false)
    expect(() => markBootVisit(blockedStorage)).not.toThrow()
  })
})
