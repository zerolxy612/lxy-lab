import { describe, expect, it } from 'vitest'
import {
  createPipelineDeck,
  getPipelineAccuracy,
  initialPipelineRun,
  pipelinePacketPool,
  readPipelineRecord,
  routePipelinePacket,
  savePipelineRecord,
} from './pipelineRecovery'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

describe('pipeline recovery', () => {
  it('builds one shuffled run without dropping packets', () => {
    let random = 0
    const deck = createPipelineDeck(() => (random += 0.07))
    expect(deck).toHaveLength(pipelinePacketPool.length)
    expect(new Set(deck.map(({ id }) => id))).toEqual(new Set(pipelinePacketPool.map(({ id }) => id)))
  })

  it('rewards correct routing with a bounded streak bonus', () => {
    const packet = pipelinePacketPool[0]
    const first = routePipelinePacket(initialPipelineRun, packet, packet.lane)
    const second = routePipelinePacket(first.state, packet, packet.lane)

    expect(first).toMatchObject({ correct: true, delta: 100 })
    expect(second).toMatchObject({ correct: true, delta: 115 })
    expect(second.state).toMatchObject({ score: 215, stability: 76, streak: 2, correct: 2 })
  })

  it('penalises a bad route without allowing negative score or stability', () => {
    const packet = pipelinePacketPool[0]
    const result = routePipelinePacket(
      { ...initialPipelineRun, stability: 5, streak: 4 },
      packet,
      'quarantine',
    )

    expect(result).toMatchObject({ correct: false, delta: -35 })
    expect(result.state).toMatchObject({ score: 0, stability: 0, streak: 0, routed: 1 })
  })

  it('calculates accuracy and only keeps the strongest local score', () => {
    const storage = new MemoryStorage()
    expect(getPipelineAccuracy({ ...initialPipelineRun, correct: 3, routed: 4 })).toBe(75)

    savePipelineRecord(storage, { score: 800, accuracy: 80, stability: 88 })
    savePipelineRecord(storage, { score: 700, accuracy: 100, stability: 100 })

    expect(readPipelineRecord(storage)).toEqual({ score: 800, accuracy: 80, stability: 88 })
  })
})
