import type { StationId } from '../content/stations'
import type { NpcId } from '../content/npcs'
import type { GameLoadingPhase } from './gameLoading'

interface LabEventMap {
  'game:loading': { phase: GameLoadingPhase; progress: number }
  'game:entrance-ready': Record<string, never>
  'game:ready': Record<string, never>
  'game:error': { message: string }
  'player:first-move': { input: 'keyboard' }
  'station:nearby': { stationId: StationId | null }
  'station:activate': { stationId: StationId }
  'npc:nearby': { npcId: NpcId | null }
  'npc:activate': { npcId: NpcId }
  'ui:panel-change': { open: boolean; stationId: StationId | null }
  'ui:dialogue-change': { open: boolean; npcId: NpcId | null }
  'ui:visited-change': { visited: readonly StationId[] }
  'ui:elevator-start': Record<string, never>
  'ui:elevator-skip': Record<string, never>
}

type Listener<K extends keyof LabEventMap> = (payload: LabEventMap[K]) => void

export class LabBridge {
  private listeners = new Map<
    keyof LabEventMap,
    Set<(payload: unknown) => void>
  >()

  on<K extends keyof LabEventMap>(type: K, listener: Listener<K>) {
    const listeners = this.listeners.get(type) ?? new Set()
    const wrapped = listener as (payload: unknown) => void

    listeners.add(wrapped)
    this.listeners.set(type, listeners)

    return () => {
      listeners.delete(wrapped)
    }
  }

  emit<K extends keyof LabEventMap>(type: K, payload: LabEventMap[K]) {
    this.listeners.get(type)?.forEach((listener) => listener(payload))
  }
}

export const labBridge = new LabBridge()
