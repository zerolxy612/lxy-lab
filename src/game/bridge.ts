import type { StationId } from '../content/stations'

interface LabEventMap {
  'game:ready': Record<string, never>
  'game:error': { message: string }
  'player:first-move': { input: 'keyboard' }
  'station:nearby': { stationId: StationId | null }
  'station:activate': { stationId: StationId }
  'ui:panel-change': { open: boolean; stationId: StationId | null }
  'ui:visited-change': { visited: readonly StationId[] }
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
