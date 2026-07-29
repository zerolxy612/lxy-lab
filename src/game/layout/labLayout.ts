import { stations, type StationId } from '../../content/stations'

export const LAB_MAP_KEY = 'lab-map-v1'
export const LAB_MAP_URL = '/assets/game/maps/lab-v1.tmj'
export const ROOM_TILESET_KEY = 'room-base-v1'
export const ROOM_TILESET_URL = '/assets/game/tilesets/room-base-v1.png'

export interface RectangleLayout {
  x: number
  y: number
  width: number
  height: number
}

export interface StationLayout extends RectangleLayout {
  id: StationId
  color: number
  interactionPadding: number
  labelGap?: number
  collision?: RectangleLayout
}

export interface LabLayout {
  worldBounds: RectangleLayout
  playerSpawn: Readonly<{ x: number; y: number }>
  staticObstacles: readonly RectangleLayout[]
  stations: readonly StationLayout[]
}

interface TiledProperty {
  name: string
  value: unknown
}

interface TiledObject {
  name: string
  type?: string
  x: number
  y: number
  width?: number
  height?: number
  point?: boolean
  properties?: TiledProperty[]
}

interface TiledObjectLayer {
  name: string
  type: 'objectgroup'
  objects: TiledObject[]
}

interface TiledMap {
  type: 'map'
  tilewidth: number
  tileheight: number
  layers: TiledObjectLayer[]
  properties?: TiledProperty[]
}

const stationIds = new Set<StationId>(stations.map(({ id }) => id))

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const assertNumber = (value: unknown, label: string) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid Tiled map: ${label} must be a finite number`)
  }
  return value
}

const assertString = (value: unknown, label: string) => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Invalid Tiled map: ${label} must be a non-empty string`)
  }
  return value
}

const parseProperties = (value: unknown, label: string): TiledProperty[] => {
  if (value === undefined) return []
  if (!Array.isArray(value)) {
    throw new Error(`Invalid Tiled map: ${label} properties must be an array`)
  }

  return value.map((property, index) => {
    if (!isRecord(property)) {
      throw new Error(`Invalid Tiled map: ${label} property ${index} must be an object`)
    }
    return {
      name: assertString(property.name, `${label} property ${index} name`),
      value: property.value,
    }
  })
}

const parseObject = (value: unknown, layerName: string, index: number): TiledObject => {
  if (!isRecord(value)) {
    throw new Error(`Invalid Tiled map: ${layerName} object ${index} must be an object`)
  }

  return {
    name: assertString(value.name, `${layerName} object ${index} name`),
    type: typeof value.type === 'string' ? value.type : undefined,
    x: assertNumber(value.x, `${layerName}.${String(value.name)} x`),
    y: assertNumber(value.y, `${layerName}.${String(value.name)} y`),
    width: value.width === undefined
      ? undefined
      : assertNumber(value.width, `${layerName}.${String(value.name)} width`),
    height: value.height === undefined
      ? undefined
      : assertNumber(value.height, `${layerName}.${String(value.name)} height`),
    point: value.point === true,
    properties: parseProperties(value.properties, `${layerName}.${String(value.name)}`),
  }
}

const parseMap = (value: unknown): TiledMap => {
  if (!isRecord(value) || value.type !== 'map' || !Array.isArray(value.layers)) {
    throw new Error('Invalid Tiled map: expected a map with layers')
  }

  const layers = value.layers.flatMap((layer, layerIndex) => {
    if (!isRecord(layer) || typeof layer.type !== 'string') {
      throw new Error(`Invalid Tiled map: layer ${layerIndex} must have a type`)
    }
    if (layer.type !== 'objectgroup') return []
    if (!Array.isArray(layer.objects)) {
      throw new Error(`Invalid Tiled map: object layer ${layerIndex} must contain objects`)
    }

    const name = assertString(layer.name, `layer ${layerIndex} name`)
    return [{
      name,
      type: 'objectgroup' as const,
      objects: layer.objects.map((object, index) => parseObject(object, name, index)),
    }]
  })

  return {
    type: 'map',
    tilewidth: assertNumber(value.tilewidth, 'tilewidth'),
    tileheight: assertNumber(value.tileheight, 'tileheight'),
    layers,
    properties: parseProperties(value.properties, 'map'),
  }
}

const getProperty = (properties: TiledProperty[] | undefined, name: string) =>
  properties?.find((property) => property.name === name)?.value

const requireLayer = (map: TiledMap, name: string) => {
  const layer = map.layers.find((candidate) => candidate.name === name)
  if (!layer) throw new Error(`Invalid Tiled map: missing ${name} object layer`)
  return layer
}

const requireObject = (layer: TiledObjectLayer, name: string) => {
  const object = layer.objects.find((candidate) => candidate.name === name)
  if (!object) throw new Error(`Invalid Tiled map: missing ${layer.name}.${name}`)
  return object
}

const toCenteredRectangle = (object: TiledObject): RectangleLayout => {
  const width = assertNumber(object.width, `${object.name} width`)
  const height = assertNumber(object.height, `${object.name} height`)
  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid Tiled map: ${object.name} must have positive dimensions`)
  }

  return {
    x: object.x + width / 2,
    y: object.y + height / 2,
    width,
    height,
  }
}

const toStationId = (value: unknown, label: string): StationId => {
  const id = assertString(value, label)
  if (!stationIds.has(id as StationId)) {
    throw new Error(`Invalid Tiled map: unknown station id "${id}"`)
  }
  return id as StationId
}

const parseColor = (value: unknown, label: string) => {
  const color = assertString(value, label)
  if (!/^#[0-9a-f]{6}$/i.test(color)) {
    throw new Error(`Invalid Tiled map: ${label} must use #RRGGBB`)
  }
  return Number.parseInt(color.slice(1), 16)
}

export function getStationCollisionRect(layout: StationLayout): RectangleLayout {
  if (!layout.collision) return layout

  return {
    x: layout.x + layout.collision.x,
    y: layout.y + layout.collision.y,
    width: layout.collision.width,
    height: layout.collision.height,
  }
}

export function parseLabMap(source: unknown): LabLayout {
  const map = parseMap(source)
  const schemaVersion = getProperty(map.properties, 'schemaVersion')
  if (schemaVersion !== 1) {
    throw new Error('Invalid Tiled map: schemaVersion must be 1')
  }
  if (map.tilewidth !== 16 || map.tileheight !== 16) {
    throw new Error('Invalid Tiled map: tile size must be 16 × 16')
  }

  const worldLayer = requireLayer(map, 'World')
  const collisionLayer = requireLayer(map, 'Collision')
  const stationLayer = requireLayer(map, 'Stations')
  const boundsObject = requireObject(worldLayer, 'world-bounds')
  const spawnObject = requireObject(worldLayer, 'player-spawn')
  const boundsWidth = assertNumber(boundsObject.width, 'world-bounds width')
  const boundsHeight = assertNumber(boundsObject.height, 'world-bounds height')

  const worldBounds = {
    x: boundsObject.x,
    y: boundsObject.y,
    width: boundsWidth,
    height: boundsHeight,
  }
  const playerSpawn = {
    x: spawnObject.x,
    y: spawnObject.y,
  }

  const stationCollisions = new Map<StationId, RectangleLayout>()
  const staticObstacles: RectangleLayout[] = []
  collisionLayer.objects.forEach((object) => {
    const rectangle = toCenteredRectangle(object)
    const stationIdValue = getProperty(object.properties, 'stationId')
    if (stationIdValue === undefined) {
      staticObstacles.push(rectangle)
      return
    }

    const stationId = toStationId(stationIdValue, `${object.name}.stationId`)
    if (stationCollisions.has(stationId)) {
      throw new Error(`Invalid Tiled map: duplicate collision for "${stationId}"`)
    }
    stationCollisions.set(stationId, rectangle)
  })

  const parsedStationIds = new Set<StationId>()
  const parsedStations = stationLayer.objects.map((object): StationLayout => {
    const id = toStationId(object.name, `${object.name} station id`)
    if (parsedStationIds.has(id)) {
      throw new Error(`Invalid Tiled map: duplicate station "${id}"`)
    }
    parsedStationIds.add(id)

    const visual = toCenteredRectangle(object)
    const collision = stationCollisions.get(id)
    if (!collision) {
      throw new Error(`Invalid Tiled map: missing collision for "${id}"`)
    }

    const interactionPadding = assertNumber(
      getProperty(object.properties, 'interactionPadding'),
      `${id}.interactionPadding`,
    )
    const labelGapValue = getProperty(object.properties, 'labelGap')

    return {
      ...visual,
      id,
      color: parseColor(getProperty(object.properties, 'color'), `${id}.color`),
      interactionPadding,
      labelGap: labelGapValue === undefined
        ? undefined
        : assertNumber(labelGapValue, `${id}.labelGap`),
      collision: {
        x: collision.x - visual.x,
        y: collision.y - visual.y,
        width: collision.width,
        height: collision.height,
      },
    }
  })

  if (parsedStationIds.size !== stationIds.size) {
    const missing = stations
      .map(({ id }) => id)
      .filter((id) => !parsedStationIds.has(id))
    throw new Error(`Invalid Tiled map: missing stations ${missing.join(', ')}`)
  }

  return {
    worldBounds,
    playerSpawn,
    staticObstacles,
    stations: parsedStations,
  }
}
