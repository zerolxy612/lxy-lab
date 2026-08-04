export const visitorEntrySessionKey = 'xiangyu-lab:visitor-entry-v1'

export type VisitorEntryChoice = 'briefing' | 'explore'

export function hasChosenVisitorEntry(storage: Storage | null) {
  if (!storage) return false

  try {
    return storage.getItem(visitorEntrySessionKey) !== null
  } catch {
    return false
  }
}

export function markVisitorEntryChoice(
  storage: Storage | null,
  choice: VisitorEntryChoice,
) {
  if (!storage) return

  try {
    storage.setItem(visitorEntrySessionKey, choice)
  } catch {
    // Storage is an enhancement; the entry routes still work without it.
  }
}
