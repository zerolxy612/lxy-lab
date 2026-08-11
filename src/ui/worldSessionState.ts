import type { RoomId } from '../game/rooms'

export const worldSessionKey = 'xiangyu-lab:world-v1'

export interface WorldSessionState {
  currentRoom: RoomId
  visitedRooms: readonly RoomId[]
}

const fallbackState: WorldSessionState = {
  currentRoom: 'lab',
  visitedRooms: ['lab'],
}

export function readWorldSession(storage: Storage | null): WorldSessionState {
  if (!storage) return fallbackState

  try {
    const raw = storage.getItem(worldSessionKey)
    if (!raw) return fallbackState
    const parsed = JSON.parse(raw) as Partial<WorldSessionState>
    const visitedRooms = Array.isArray(parsed.visitedRooms)
      ? parsed.visitedRooms.filter((room): room is RoomId => (
        room === 'lab'
        || room === 'library'
        || room === 'after-hours'
        || room === 'observatory'
      ))
      : ['lab'] satisfies RoomId[]
    const currentRoom = parsed.currentRoom === 'library' ? 'library' : 'lab'
    return {
      currentRoom,
      visitedRooms: Array.from(new Set<RoomId>(['lab', ...visitedRooms, currentRoom])),
    }
  } catch {
    return fallbackState
  }
}

export function recordRoomVisit(storage: Storage | null, roomId: RoomId) {
  const current = readWorldSession(storage)
  const next: WorldSessionState = {
    currentRoom: roomId,
    visitedRooms: Array.from(new Set([...current.visitedRooms, roomId])),
  }

  if (storage) {
    try {
      storage.setItem(worldSessionKey, JSON.stringify(next))
    } catch {
      // Session persistence is optional; room navigation still works without it.
    }
  }

  return next
}
