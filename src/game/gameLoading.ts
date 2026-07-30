export const gameLoadingPhases = [
  { id: 'runtime', label: 'Linking runtime', shortLabel: 'Runtime' },
  { id: 'room', label: 'Mapping LAB-01', shortLabel: 'Room' },
  { id: 'assets', label: 'Synchronising station assets', shortLabel: 'Stations' },
  { id: 'systems', label: 'Bringing room systems online', shortLabel: 'Systems' },
  { id: 'ready', label: 'Signal stable', shortLabel: 'Ready' },
] as const

export type GameLoadingPhase = (typeof gameLoadingPhases)[number]['id']

export const gameLoadingLabel = Object.fromEntries(
  gameLoadingPhases.map(({ id, label }) => [id, label]),
) as Record<GameLoadingPhase, string>

export function clampLoadingProgress(progress: number) {
  return Math.min(1, Math.max(0, progress))
}

export function getLoadingPhaseIndex(phase: GameLoadingPhase) {
  return gameLoadingPhases.findIndex(({ id }) => id === phase)
}
