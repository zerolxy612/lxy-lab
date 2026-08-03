import type { NpcId } from '../content/npcs'

export const NPC_SESSION_STORAGE_KEY = 'xiangyu-lab:npc-session-v1'

interface NpcSessionStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

interface NpcSessionState {
  talks: Record<NpcId, number>
  barks: Record<NpcId, number>
}

const emptyState = (): NpcSessionState => ({
  talks: { rook: 0, mira: 0 },
  barks: { rook: 0, mira: 0 },
})

function readState(storage: NpcSessionStorage | null) {
  if (!storage) return emptyState()
  try {
    const parsed = JSON.parse(storage.getItem(NPC_SESSION_STORAGE_KEY) ?? '') as Partial<NpcSessionState>
    return {
      talks: {
        rook: Number(parsed.talks?.rook) || 0,
        mira: Number(parsed.talks?.mira) || 0,
      },
      barks: {
        rook: Number(parsed.barks?.rook) || 0,
        mira: Number(parsed.barks?.mira) || 0,
      },
    }
  } catch {
    return emptyState()
  }
}

function writeState(storage: NpcSessionStorage | null, state: NpcSessionState) {
  if (!storage) return
  try {
    storage.setItem(NPC_SESSION_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Dialogue remains fully usable when session storage is unavailable.
  }
}

export function registerNpcTalk(storage: NpcSessionStorage | null, npcId: NpcId) {
  const state = readState(storage)
  state.talks[npcId] += 1
  writeState(storage, state)
  return state.talks[npcId]
}

export function takeNextNpcBark(storage: NpcSessionStorage | null, npcId: NpcId) {
  const state = readState(storage)
  const index = state.barks[npcId]
  state.barks[npcId] += 1
  writeState(storage, state)
  return index
}
