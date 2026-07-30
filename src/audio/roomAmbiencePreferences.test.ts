import { describe, expect, it, vi } from 'vitest'
import {
  parseRoomAmbiencePreference,
  readRoomAmbiencePreference,
  ROOM_AMBIENCE_STORAGE_KEY,
  writeRoomAmbiencePreference,
} from './roomAmbiencePreferences'

describe('room ambience preferences', () => {
  it('defaults to muted unless the visitor explicitly enabled ambience', () => {
    expect(parseRoomAmbiencePreference(null)).toBe(false)
    expect(parseRoomAmbiencePreference('disabled')).toBe(false)
    expect(parseRoomAmbiencePreference('enabled')).toBe(true)
  })

  it('reads and writes the stable local preference key', () => {
    const getItem = vi.fn(() => 'enabled')
    const setItem = vi.fn()

    expect(readRoomAmbiencePreference({ getItem })).toBe(true)
    expect(getItem).toHaveBeenCalledWith(ROOM_AMBIENCE_STORAGE_KEY)

    writeRoomAmbiencePreference(false, { setItem })
    expect(setItem).toHaveBeenCalledWith(ROOM_AMBIENCE_STORAGE_KEY, 'disabled')
  })

  it('fails closed when browser storage is unavailable', () => {
    const getItem = vi.fn(() => {
      throw new Error('blocked')
    })
    const setItem = vi.fn(() => {
      throw new Error('blocked')
    })

    expect(readRoomAmbiencePreference({ getItem })).toBe(false)
    expect(() => writeRoomAmbiencePreference(true, { setItem })).not.toThrow()
  })
})
