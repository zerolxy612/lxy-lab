import { describe, expect, it } from 'vitest'
import { readWorldSession, recordRoomVisit, worldSessionKey } from './worldSessionState'

function createStorage() {
  const values = new Map<string, string>()
  return {
    values,
    storage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    } as unknown as Storage,
  }
}

describe('world session state', () => {
  it('records rooms once and keeps the latest room', () => {
    const { values, storage } = createStorage()

    recordRoomVisit(storage, 'library')
    recordRoomVisit(storage, 'lab')

    expect(readWorldSession(storage)).toEqual({
      currentRoom: 'lab',
      visitedRooms: ['lab', 'library'],
    })
    expect(values.has(worldSessionKey)).toBe(true)
  })

  it('falls back safely when storage data is invalid', () => {
    const { values, storage } = createStorage()
    values.set(worldSessionKey, '{not-json')

    expect(readWorldSession(storage)).toEqual({
      currentRoom: 'lab',
      visitedRooms: ['lab'],
    })
  })
})
