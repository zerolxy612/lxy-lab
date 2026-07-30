export const ROOM_AMBIENCE_STORAGE_KEY = 'xiangyu-ai-lab:room-ambience'

interface StorageReader {
  getItem: (key: string) => string | null
}

interface StorageWriter {
  setItem: (key: string, value: string) => void
}

function getLocalStorage() {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function parseRoomAmbiencePreference(value: string | null) {
  return value === 'enabled'
}

export function readRoomAmbiencePreference(storage?: StorageReader | null) {
  const target = storage === undefined ? getLocalStorage() : storage
  if (!target) return false

  try {
    return parseRoomAmbiencePreference(target.getItem(ROOM_AMBIENCE_STORAGE_KEY))
  } catch {
    return false
  }
}

export function writeRoomAmbiencePreference(
  enabled: boolean,
  storage?: StorageWriter | null,
) {
  const target = storage === undefined ? getLocalStorage() : storage
  if (!target) return

  try {
    target.setItem(ROOM_AMBIENCE_STORAGE_KEY, enabled ? 'enabled' : 'disabled')
  } catch {
    // A blocked storage API must not make the sound control unusable.
  }
}
