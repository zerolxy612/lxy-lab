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

  it('keeps visited-station payloads intact across the React and Phaser boundary', () => {
    const bridge = new LabBridge()
    const listener = vi.fn()
    bridge.on('ui:visited-change', listener)

    bridge.emit('ui:visited-change', {
      visited: ['experience', 'systems'],
    })

    expect(listener).toHaveBeenCalledWith({
      visited: ['experience', 'systems'],
    })
  })

  it('carries a recoverable game loading error to the React layer', () => {
    const bridge = new LabBridge()
    const listener = vi.fn()
    bridge.on('game:error', listener)

    bridge.emit('game:error', { message: 'Room assets unavailable.' })

    expect(listener).toHaveBeenCalledWith({ message: 'Room assets unavailable.' })
  })

  it('streams typed loading phases to the DOM intro', () => {
    const bridge = new LabBridge()
    const listener = vi.fn()
    bridge.on('game:loading', listener)

    bridge.emit('game:loading', { phase: 'assets', progress: 0.68 })

    expect(listener).toHaveBeenCalledWith({ phase: 'assets', progress: 0.68 })
  })

  it('carries NPC proximity and dialogue state across the same boundary', () => {
    const bridge = new LabBridge()
    const nearby = vi.fn()
    const dialogue = vi.fn()
    bridge.on('npc:nearby', nearby)
    bridge.on('ui:dialogue-change', dialogue)

    bridge.emit('npc:nearby', { npcId: 'rook' })
    bridge.emit('ui:dialogue-change', { open: true, npcId: 'rook' })

    expect(nearby).toHaveBeenCalledWith({ npcId: 'rook' })
    expect(dialogue).toHaveBeenCalledWith({ open: true, npcId: 'rook' })
  })
})
