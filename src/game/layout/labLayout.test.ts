import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { stations } from '../../content/stations'
import {
  getStationCollisionRect,
  containsPoint,
  parseLabMap,
} from './labLayout'

const mapUrl = new URL('../../../public/assets/game/maps/lab-v1.tmj', import.meta.url)
const mapSource = JSON.parse(readFileSync(mapUrl, 'utf8')) as unknown
const labLayout = parseLabMap(mapSource)

describe('labLayout', () => {
  it('parses the production Tiled map with its locked 16px schema', () => {
    expect(labLayout.worldBounds).toEqual({
      x: 58,
      y: 72,
      width: 844,
      height: 428,
    })
    expect(labLayout.playerSpawn).toEqual({ x: 480, y: 462 })
    expect(labLayout.staticObstacles).toHaveLength(4)
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

  it('keeps ROOK mobile and MIRA anchored through Tiled-authored NPC data', () => {
    expect(labLayout.npcs.map(({ id }) => id).sort()).toEqual(['mira', 'rook'])
    const rook = labLayout.npcs.find(({ id }) => id === 'rook')
    const mira = labLayout.npcs.find(({ id }) => id === 'mira')

    expect(rook).toMatchObject({ movement: 'patrol', x: 600, y: 214 })
    expect(rook?.route).toHaveLength(5)
    expect(rook?.route[0]).toEqual({ x: 600, y: 214 })
    expect(mira).toMatchObject({ movement: 'stationary', x: 284, y: 290, route: [] })
  })

  it('keeps the window wall blocked while leaving its sill-side floor walkable', () => {
    const windowWall = labLayout.staticObstacles.find(({ id }) => id === 'window-wall')

    expect(windowWall).toEqual({ id: 'window-wall', x: 480, y: 122, width: 844, height: 100 })
    expect(containsPoint(windowWall!, 480, 172)).toBe(true)
    expect(containsPoint(windowWall!, 480, 173)).toBe(false)
    expect(containsPoint(windowWall!, labLayout.playerSpawn.x, labLayout.playerSpawn.y)).toBe(false)
  })

  it('keeps every NPC anchor and patrol point on collision-free floor', () => {
    const blockedAreas = [
      ...labLayout.staticObstacles,
      ...labLayout.stations.map(getStationCollisionRect),
    ]

    labLayout.npcs.forEach(({ route, x, y }) => {
      [{ x, y }, ...route].forEach((point) => {
        expect(blockedAreas.some((area) => containsPoint(area, point.x, point.y))).toBe(false)
      })
    })
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
