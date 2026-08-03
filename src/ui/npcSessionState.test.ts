import { describe, expect, it } from 'vitest'
import {
  NPC_SESSION_STORAGE_KEY,
  registerNpcTalk,
  takeNextNpcBark,
} from './npcSessionState'

function createStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  }
}

describe('NPC session state', () => {
  it('tracks conversations and ambient barks independently per character', () => {
    const storage = createStorage()

    expect(registerNpcTalk(storage, 'rook')).toBe(1)
    expect(registerNpcTalk(storage, 'rook')).toBe(2)
    expect(registerNpcTalk(storage, 'mira')).toBe(1)
    expect(takeNextNpcBark(storage, 'rook')).toBe(0)
    expect(takeNextNpcBark(storage, 'rook')).toBe(1)
    expect(takeNextNpcBark(storage, 'mira')).toBe(0)
    expect(storage.getItem(NPC_SESSION_STORAGE_KEY)).not.toBeNull()
  })

  it('falls back quietly when storage is missing or malformed', () => {
    const storage = createStorage()
    storage.setItem(NPC_SESSION_STORAGE_KEY, 'not-json')

    expect(registerNpcTalk(storage, 'rook')).toBe(1)
    expect(takeNextNpcBark(null, 'mira')).toBe(0)
  })
})
