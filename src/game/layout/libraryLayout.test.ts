import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { fileURLToPath } from 'node:url'
import { parseLibraryMap } from './libraryLayout'

const mapPath = fileURLToPath(
  new URL('../../../public/assets/game/maps/library-prototype-v1.tmj', import.meta.url),
)

describe('library prototype map', () => {
  it('provides a safe world, spawn, collision, and three interaction anchors', () => {
    const map = parseLibraryMap(JSON.parse(readFileSync(mapPath, 'utf8')))

    expect(map.worldBounds).toEqual({ x: 480, y: 286, width: 844, height: 428 })
    expect(map.playerSpawn).toEqual({ x: 480, y: 400 })
    expect(map.interactions.map(({ id }) => id)).toEqual(['reading', 'catalog', 'exit'])
    expect(map.collision).toHaveLength(5)
  })

  it('rejects incomplete interaction contracts', () => {
    const source = JSON.parse(readFileSync(mapPath, 'utf8'))
    source.layers.find(({ name }: { name: string }) => name === 'Interactions').objects.pop()

    expect(() => parseLibraryMap(source)).toThrow(/reading, catalog, and exit/)
  })
})
