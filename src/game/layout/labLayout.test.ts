import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { stations } from '../../content/stations'
import {
  getStationCollisionRect,
  parseLabMap,
  type RectangleLayout,
} from './labLayout'

const mapUrl = new URL('../../../public/assets/game/maps/lab-v1.tmj', import.meta.url)
const mapSource = JSON.parse(readFileSync(mapUrl, 'utf8')) as unknown
const labLayout = parseLabMap(mapSource)

const containsPoint = (rectangle: RectangleLayout, x: number, y: number) =>
  x >= rectangle.x - rectangle.width / 2
  && x <= rectangle.x + rectangle.width / 2
  && y >= rectangle.y - rectangle.height / 2
  && y <= rectangle.y + rectangle.height / 2

describe('labLayout', () => {
  it('parses the production Tiled map with its locked 16px schema', () => {
    expect(labLayout.worldBounds).toEqual({
      x: 58,
      y: 72,
      width: 844,
      height: 428,
    })
    expect(labLayout.playerSpawn).toEqual({ x: 480, y: 462 })
    expect(labLayout.staticObstacles).toHaveLength(3)
  })

  it('retains the v0.3 visual tile layers as an editable map reference', () => {
    const tiledMap = mapSource as {
      layers: Array<{ encoding?: string; name: string; type: string }>
      tilesets: Array<{
        columns: number
        image: string
        name: string
        tilecount: number
        tileheight: number
        tilewidth: number
      }>
    }
    const visualLayers = tiledMap.layers
      .filter(({ type }) => type === 'tilelayer')
      .map(({ encoding, name }) => ({ encoding, name }))

    expect(visualLayers).toEqual([
      { encoding: 'base64', name: 'Floor' },
      { encoding: 'base64', name: 'Structure' },
    ])
    expect(tiledMap.tilesets).toEqual([
      expect.objectContaining({
        columns: 16,
        image: '../tilesets/room-base-v1.png',
        name: 'room-base-v1',
        tilecount: 256,
        tileheight: 16,
        tilewidth: 16,
      }),
    ])
  })

  it('defines one map object for every content station', () => {
    const contentIds = stations.map(({ id }) => id).sort()
    const layoutIds = labLayout.stations.map(({ id }) => id).sort()

    expect(new Set(layoutIds).size).toBe(layoutIds.length)
    expect(layoutIds).toEqual(contentIds)
  })

  it('keeps Tiled station colors aligned with the React content registry', () => {
    stations.forEach(({ accent, id }) => {
      const layout = labLayout.stations.find((station) => station.id === id)
      expect(layout?.color).toBe(Number.parseInt(accent.slice(1), 16))
    })
  })

  it('places the player spawn inside the room and outside every collision block', () => {
    const { worldBounds, playerSpawn, staticObstacles } = labLayout
    const worldEdges = {
      left: worldBounds.x,
      right: worldBounds.x + worldBounds.width,
      top: worldBounds.y,
      bottom: worldBounds.y + worldBounds.height,
    }

    expect(playerSpawn.x).toBeGreaterThanOrEqual(worldEdges.left)
    expect(playerSpawn.x).toBeLessThanOrEqual(worldEdges.right)
    expect(playerSpawn.y).toBeGreaterThanOrEqual(worldEdges.top)
    expect(playerSpawn.y).toBeLessThanOrEqual(worldEdges.bottom)

    const collisionBlocks = [
      ...staticObstacles,
      ...labLayout.stations.map(getStationCollisionRect),
    ]
    collisionBlocks.forEach((block) => {
      expect(containsPoint(block, playerSpawn.x, playerSpawn.y)).toBe(false)
    })
  })

  it('separates the Living AI Core visual bounds from its floor collision', () => {
    const core = labLayout.stations.find(({ id }) => id === 'systems')
    expect(core).toBeDefined()

    const collision = getStationCollisionRect(core!)
    expect(collision.width).toBeLessThan(core!.width)
    expect(collision.height).toBeLessThan(core!.height)
    expect(collision.y).toBeGreaterThan(core!.y)
  })

  it('separates the Experience Archive visual bounds from its floor collision', () => {
    const archive = labLayout.stations.find(({ id }) => id === 'experience')
    expect(archive).toBeDefined()

    const collision = getStationCollisionRect(archive!)
    expect(collision.width).toBeLessThan(archive!.width)
    expect(collision.height).toBeLessThan(archive!.height)
    expect(collision.y).toBeGreaterThan(archive!.y)
  })

  it('rejects a map when a registered station is missing', () => {
    const incompleteMap = structuredClone(mapSource) as {
      layers: Array<{ name: string; objects: Array<{ name: string }> }>
    }
    const stationLayer = incompleteMap.layers.find(({ name }) => name === 'Stations')
    stationLayer!.objects = stationLayer!.objects.filter(({ name }) => name !== 'future')

    expect(() => parseLabMap(incompleteMap)).toThrow('missing stations future')
  })
})
