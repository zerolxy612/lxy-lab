import type { StationId } from '../content/stations'
import type { NpcId } from '../content/npcs'
import type { GameLoadingPhase } from './gameLoading'
import type { AvailableRoomId } from './rooms'

export interface NpcDialogueAnchor {
  x: number
  y: number
}

interface LabEventMap {
  'game:loading': { phase: GameLoadingPhase; progress: number }
  'game:entrance-ready': Record<string, never>
  'game:ready': Record<string, never>
  'game:error': { message: string }
  'player:first-move': { input: 'keyboard' }
  'station:nearby': { stationId: StationId | null }
  'station:activate': { stationId: StationId }
  'npc:nearby': { npcId: NpcId | null; anchor: NpcDialogueAnchor | null }
  'npc:activate': { npcId: NpcId; anchor: NpcDialogueAnchor }
  'ui:npc-request': { npcId: NpcId }
  'ui:panel-change': { open: boolean; stationId: StationId | null }
  'ui:dialogue-change': { open: boolean; npcId: NpcId | null }
  'ui:entry-change': { open: boolean }
  'ui:index-change': { open: boolean }
  'ui:visited-change': { visited: readonly StationId[] }
  'ui:elevator-start': Record<string, never>
  'ui:elevator-skip': Record<string, never>
  'room:request': { roomId: AvailableRoomId; source: 'world' | 'index' | 'content' }
  'room:leaving': { from: AvailableRoomId; to: AvailableRoomId }
  'room:entered': { roomId: AvailableRoomId; from: AvailableRoomId | null }
  'room:nearby': { roomId: AvailableRoomId; targetId: string | null; label: string | null }
  'room:error': { roomId: AvailableRoomId; message: string }
  'library:open': { surface: 'catalog' | 'article'; slug?: string }
  'ui:room-content-change': { open: boolean }
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
