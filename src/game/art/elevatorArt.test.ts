import { describe, expect, it } from 'vitest'
import { ELEVATOR_CABIN_FRAMES, ELEVATOR_DOOR_APERTURE } from './elevatorArt'

describe('elevator cabin art contract', () => {
  it('splits both door frames across the full reusable aperture', () => {
    const { doorLeft, doorRight } = ELEVATOR_CABIN_FRAMES

    expect(doorLeft.x).toBe(ELEVATOR_DOOR_APERTURE.x)
    expect(doorRight.x).toBe(doorLeft.x + doorLeft.width)
    expect(doorLeft.width + doorRight.width).toBe(ELEVATOR_DOOR_APERTURE.width)
    expect(doorLeft.height).toBe(ELEVATOR_DOOR_APERTURE.height)
    expect(doorRight.height).toBe(ELEVATOR_DOOR_APERTURE.height)
  })

  it('keeps the shell slices around a 960 by 540 doorway', () => {
    const { shellTop, shellLeft, shellRight, shellFloor } = ELEVATOR_CABIN_FRAMES

    expect(shellTop.width).toBe(960)
    expect(shellTop.height).toBe(ELEVATOR_DOOR_APERTURE.y)
    expect(shellLeft.width + ELEVATOR_DOOR_APERTURE.width + shellRight.width).toBe(960)
    expect(shellFloor.y + shellFloor.height).toBe(540)
  })
})
