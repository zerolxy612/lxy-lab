import { describe, expect, it, vi } from 'vitest'
import { LabBridge } from './bridge'

describe('LabBridge', () => {
  it('delivers typed station events and unsubscribes cleanly', () => {
    const bridge = new LabBridge()
    const listener = vi.fn()
    const unsubscribe = bridge.on('station:activate', listener)

    bridge.emit('station:activate', { stationId: 'projects' })
    unsubscribe()
    bridge.emit('station:activate', { stationId: 'future' })

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith({ stationId: 'projects' })
  })
})
