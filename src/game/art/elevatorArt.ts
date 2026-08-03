export const ELEVATOR_CABIN_TEXTURE_KEY = 'elevator-cabin-background-v1'
export const ELEVATOR_CABIN_TEXTURE_URL = '/assets/game/backgrounds/elevator-cabin-background-v1.png'

export const ELEVATOR_DOOR_APERTURE = {
  x: 244,
  y: 126,
  width: 472,
  height: 334,
} as const

export const ELEVATOR_CABIN_FRAMES = {
  shellTop: { key: 'shell-top', x: 0, y: 0, width: 960, height: 126 },
  shellLeft: { key: 'shell-left', x: 0, y: 126, width: 244, height: 334 },
  shellRight: { key: 'shell-right', x: 716, y: 126, width: 244, height: 334 },
  shellFloor: { key: 'shell-floor', x: 0, y: 460, width: 960, height: 80 },
  doorLeft: { key: 'door-left', x: 244, y: 126, width: 236, height: 334 },
  doorRight: { key: 'door-right', x: 480, y: 126, width: 236, height: 334 },
} as const
