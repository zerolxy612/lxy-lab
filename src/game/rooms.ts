export const roomIds = ['lab', 'library', 'after-hours', 'observatory'] as const

export type RoomId = (typeof roomIds)[number]
export type AvailableRoomId = Extract<RoomId, 'lab' | 'library'>

export interface RoomDefinition {
  id: RoomId
  sceneKey: string
  label: string
  eyebrow: string
  path: string
  status: 'available' | 'planned'
  accent: `#${string}`
}

export const rooms: readonly RoomDefinition[] = [
  {
    id: 'lab',
    sceneKey: 'lab',
    label: 'Main Lab',
    eyebrow: 'The present',
    path: '/lab',
    status: 'available',
    accent: '#5cdfff',
  },
  {
    id: 'library',
    sceneKey: 'library',
    label: 'Archive Library',
    eyebrow: 'The record',
    path: '/library',
    status: 'available',
    accent: '#ffc45c',
  },
  {
    id: 'after-hours',
    sceneKey: 'after-hours',
    label: 'After Hours',
    eyebrow: 'The person',
    path: '/after-hours',
    status: 'planned',
    accent: '#ff7867',
  },
  {
    id: 'observatory',
    sceneKey: 'observatory',
    label: 'Observatory',
    eyebrow: 'The future',
    path: '/observatory',
    status: 'planned',
    accent: '#8a63ff',
  },
]

export const roomById = Object.fromEntries(
  rooms.map((room) => [room.id, room]),
) as Record<RoomId, RoomDefinition>

export function isAvailableRoom(roomId: RoomId): roomId is AvailableRoomId {
  return roomById[roomId].status === 'available'
}

export function resolveInitialRoom(pathname: string): AvailableRoomId {
  const normalizedPath = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/'
  if (normalizedPath === '/library' || normalizedPath === '/blog' || normalizedPath.startsWith('/blog/')) return 'library'
  return 'lab'
}

export function getRoomPath(roomId: AvailableRoomId) {
  return roomById[roomId].path
}
