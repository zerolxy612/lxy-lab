import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { fileURLToPath } from 'node:url'
import { parseLibraryMap } from './libraryLayout'

const mapPath = fileURLToPath(
  new URL('../../../public/assets/game/maps/library-prototype-v1.tmj', import.meta.url),
)

describe('library prototype map', () => {
  it('provides a safe world, spawn, collision, and four interaction anchors', () => {
    const map = parseLibraryMap(JSON.parse(readFileSync(mapPath, 'utf8')))

    expect(map.worldBounds).toEqual({ x: 480, y: 286, width: 844, height: 428 })
    expect(map.playerSpawn).toEqual({ x: 480, y: 400 })
    expect(map.interactions.map(({ id }) => id)).toEqual(['reading', 'catalog', 'return', 'exit'])
    expect(map.collision).toHaveLength(5)
  })

  it('rejects incomplete interaction contracts', () => {
    const source = JSON.parse(readFileSync(mapPath, 'utf8'))
    source.layers.find(({ name }: { name: string }) => name === 'Interactions').objects.pop()

    expect(() => parseLibraryMap(source)).toThrow(/reading, catalog, return, and exit/)
  })

  it('rejects duplicate interaction anchors', () => {
    const source = JSON.parse(readFileSync(mapPath, 'utf8'))
    const interactions = source.layers.find(({ name }: { name: string }) => name === 'Interactions').objects
    interactions.push({ ...interactions[0], id: 99 })

    expect(() => parseLibraryMap(source)).toThrow(/reading, catalog, return, and exit/)
  })
})
