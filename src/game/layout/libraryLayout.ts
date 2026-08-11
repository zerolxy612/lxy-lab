export const LIBRARY_MAP_KEY = 'library-prototype-map-v1'
export const LIBRARY_MAP_URL = '/assets/game/maps/library-prototype-v1.tmj'

export type LibraryInteractionId = 'reading' | 'catalog' | 'exit'

export interface LibraryRectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface LibraryInteraction extends LibraryRectangle {
  id: LibraryInteractionId
  label: string
}

export interface LibraryLayout {
  worldBounds: LibraryRectangle
  playerSpawn: Readonly<{ x: number; y: number }>
  collision: readonly LibraryRectangle[]
  interactions: readonly LibraryInteraction[]
}

interface TiledProperty {
  name: string
  value: unknown
}

interface TiledObject {
  name: string
  x: number
  y: number
  width?: number
  height?: number
  point?: boolean
  properties?: TiledProperty[]
}

const interactionIds = new Set<LibraryInteractionId>(['reading', 'catalog', 'exit'])

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
)

const requireNumber = (value: unknown, label: string) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid Library map: ${label} must be a finite number`)
  }
  return value
}

const requireString = (value: unknown, label: string) => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Invalid Library map: ${label} must be a non-empty string`)
  }
  return value
}

const toObject = (value: unknown, label: string): TiledObject => {
  if (!isRecord(value)) throw new Error(`Invalid Library map: ${label} must be an object`)
  return {
    name: requireString(value.name, `${label} name`),
    x: requireNumber(value.x, `${label} x`),
    y: requireNumber(value.y, `${label} y`),
    width: value.width === undefined ? undefined : requireNumber(value.width, `${label} width`),
    height: value.height === undefined ? undefined : requireNumber(value.height, `${label} height`),
    point: value.point === true,
    properties: Array.isArray(value.properties)
      ? value.properties.flatMap((property) => {
        if (!isRecord(property) || typeof property.name !== 'string') return []
        return [{ name: property.name, value: property.value }]
      })
      : [],
  }
}

const toRectangle = (object: TiledObject): LibraryRectangle => {
  const width = requireNumber(object.width, `${object.name} width`)
  const height = requireNumber(object.height, `${object.name} height`)
  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid Library map: ${object.name} must have positive dimensions`)
  }
  return {
    x: object.x + width / 2,
    y: object.y + height / 2,
    width,
    height,
  }
}

export function parseLibraryMap(source: unknown): LibraryLayout {
  if (!isRecord(source) || source.type !== 'map' || !Array.isArray(source.layers)) {
    throw new Error('Invalid Library map: expected a Tiled map')
  }
  if (source.tilewidth !== 16 || source.tileheight !== 16) {
    throw new Error('Invalid Library map: tile size must be 16 × 16')
  }
  const properties = Array.isArray(source.properties) ? source.properties : []
  const schemaVersion = properties.find(
    (property) => isRecord(property) && property.name === 'schemaVersion',
  )
  if (!isRecord(schemaVersion) || schemaVersion.value !== 1) {
    throw new Error('Invalid Library map: schemaVersion must be 1')
  }

  const layers = new Map<string, TiledObject[]>()
  source.layers.forEach((layer, layerIndex) => {
    if (!isRecord(layer) || layer.type !== 'objectgroup' || !Array.isArray(layer.objects)) return
    const name = requireString(layer.name, `layer ${layerIndex} name`)
    layers.set(name, layer.objects.map((object, index) => toObject(object, `${name}.${index}`)))
  })

  const world = layers.get('World')
  const collisionObjects = layers.get('Collision')
  const interactionObjects = layers.get('Interactions')
  if (!world || !collisionObjects || !interactionObjects) {
    throw new Error('Invalid Library map: missing World, Collision, or Interactions layer')
  }

  const bounds = world.find(({ name }) => name === 'world-bounds')
  const spawn = world.find(({ name }) => name === 'player-spawn')
  if (!bounds || !spawn?.point) {
    throw new Error('Invalid Library map: missing world-bounds or player-spawn')
  }

  const interactions = interactionObjects.map((object): LibraryInteraction => {
    if (!interactionIds.has(object.name as LibraryInteractionId)) {
      throw new Error(`Invalid Library map: unknown interaction "${object.name}"`)
    }
    const label = object.properties?.find(({ name }) => name === 'label')?.value
    return {
      ...toRectangle(object),
      id: object.name as LibraryInteractionId,
      label: requireString(label, `${object.name} label`),
    }
  })

  if (new Set(interactions.map(({ id }) => id)).size !== interactionIds.size) {
    throw new Error('Invalid Library map: reading, catalog, and exit are required')
  }

  return {
    worldBounds: toRectangle(bounds),
    playerSpawn: { x: spawn.x, y: spawn.y },
    collision: collisionObjects.map(toRectangle),
    interactions,
  }
}
