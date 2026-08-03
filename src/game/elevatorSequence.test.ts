import { describe, expect, it } from 'vitest'
import {
  ELEVATOR_DOORS_OPEN_MS,
  ELEVATOR_FLOORS,
  ELEVATOR_SEQUENCE_MS,
  getElevatorFloor,
} from './elevatorSequence'

describe('elevator sequence', () => {
  it('moves through every basement floor and settles on B7', () => {
    expect(getElevatorFloor(0)).toBe('B1')
    expect(getElevatorFloor(1_600)).toBe('B2')
    expect(getElevatorFloor(2_350)).toBe('B4')
    expect(getElevatorFloor(3_650)).toBe('B7')
    expect(getElevatorFloor(5_100)).toBe('B7')
    expect(ELEVATOR_FLOORS).toHaveLength(7)
  })

  it('reserves enough time for the doors and exposure handoff to finish', () => {
    expect(ELEVATOR_SEQUENCE_MS - ELEVATOR_DOORS_OPEN_MS).toBeGreaterThanOrEqual(1_000)
  })
})
