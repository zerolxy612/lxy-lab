import { describe, expect, it } from 'vitest'
import { toNpcScreenAnchor } from './dialogueAnchor'

describe('NPC dialogue anchor', () => {
  it('maps Phaser world coordinates into the fixed 960 by 540 game frame', () => {
    const frame = { left: 100, top: 50, width: 960, height: 540 }
    expect(toNpcScreenAnchor({ x: 480, y: 270 }, frame)).toEqual({ x: 580, y: 320 })
    expect(toNpcScreenAnchor({ x: 240, y: 135 }, frame)).toEqual({ x: 340, y: 185 })
  })

  it('falls back to center and clamps invalid edge coordinates', () => {
    const frame = { left: 20, top: 10, width: 480, height: 270 }
    expect(toNpcScreenAnchor(null, frame)).toEqual({ x: 260, y: 145 })
    expect(toNpcScreenAnchor({ x: -20, y: 900 }, frame)).toEqual({ x: 20, y: 280 })
  })
})
