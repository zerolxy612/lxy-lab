export const ELEVATOR_FLOORS = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'] as const

export const ELEVATOR_SEQUENCE_MS = 5_280
export const ELEVATOR_ARRIVAL_MS = 3_850
export const ELEVATOR_DOORS_OPEN_MS = 4_180

export function getElevatorFloor(elapsedMs: number) {
  if (elapsedMs <= 1_000) return ELEVATOR_FLOORS[0]
  const movementProgress = Math.min(1, (elapsedMs - 1_000) / 2_650)
  const index = Math.min(
    ELEVATOR_FLOORS.length - 1,
    Math.floor(movementProgress * ELEVATOR_FLOORS.length),
  )
  return ELEVATOR_FLOORS[index]
}
