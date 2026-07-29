import { describe, expect, it } from 'vitest'
import { stations } from '../../content/stations'
import {
  labWorldBounds,
  playerSpawn,
  staticObstacles,
  stationLayouts,
  type RectangleLayout,
} from './labLayout'

const containsPoint = (rectangle: RectangleLayout, x: number, y: number) =>
  x >= rectangle.x - rectangle.width / 2 &&
  x <= rectangle.x + rectangle.width / 2 &&
  y >= rectangle.y - rectangle.height / 2 &&
  y <= rectangle.y + rectangle.height / 2

describe('labLayout', () => {
  it('defines one layout entry for every content station', () => {
    const contentIds = stations.map(({ id }) => id).sort()
    const layoutIds = stationLayouts.map(({ id }) => id).sort()

    expect(new Set(layoutIds).size).toBe(layoutIds.length)
    expect(layoutIds).toEqual(contentIds)
  })

  it('places the player spawn inside the room and outside every collision block', () => {
    const worldEdges = {
      left: labWorldBounds.x,
      right: labWorldBounds.x + labWorldBounds.width,
      top: labWorldBounds.y,
      bottom: labWorldBounds.y + labWorldBounds.height,
    }

    expect(playerSpawn.x).toBeGreaterThanOrEqual(worldEdges.left)
    expect(playerSpawn.x).toBeLessThanOrEqual(worldEdges.right)
    expect(playerSpawn.y).toBeGreaterThanOrEqual(worldEdges.top)
    expect(playerSpawn.y).toBeLessThanOrEqual(worldEdges.bottom)

    const collisionBlocks = [...staticObstacles, ...stationLayouts]
    collisionBlocks.forEach((block) => {
      expect(containsPoint(block, playerSpawn.x, playerSpawn.y)).toBe(false)
    })
  })
})
