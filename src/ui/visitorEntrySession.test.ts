import { describe, expect, it } from 'vitest'
import {
  hasChosenVisitorEntry,
  markVisitorEntryChoice,
  visitorEntrySessionKey,
} from './visitorEntrySession'

describe('visitor entry session', () => {
  it('shows the entry choice until a route is selected', () => {
    const storage = new Map<string, string>()
    const session = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    } as unknown as Storage

    expect(hasChosenVisitorEntry(session)).toBe(false)
    markVisitorEntryChoice(session, 'briefing')
    expect(storage.get(visitorEntrySessionKey)).toBe('briefing')
    expect(hasChosenVisitorEntry(session)).toBe(true)
  })

  it('degrades quietly when session storage is unavailable', () => {
    expect(hasChosenVisitorEntry(null)).toBe(false)
    expect(() => markVisitorEntryChoice(null, 'explore')).not.toThrow()
  })
})
