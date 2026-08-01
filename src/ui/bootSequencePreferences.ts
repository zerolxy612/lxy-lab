export const BOOT_SEQUENCE_PRELUDE_MS = 1500
export const BOOT_SEQUENCE_ONLINE_MS = 950
export const BOOT_SEQUENCE_EXIT_MS = 620
export const BOOT_VISITOR_STORAGE_KEY = 'xiangyu-lab:visited'

interface BootPreferences {
  compactViewport: boolean
  reducedMotion: boolean
}

export function shouldBypassBoot({ compactViewport, reducedMotion }: BootPreferences) {
  return compactViewport || reducedMotion
}

interface BootVisitStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export function isReturningVisitor(storage: BootVisitStorage | null) {
  if (!storage) return false
  try {
    return storage.getItem(BOOT_VISITOR_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function markBootVisit(storage: BootVisitStorage | null) {
  if (!storage) return
  try {
    storage.setItem(BOOT_VISITOR_STORAGE_KEY, '1')
  } catch {
    // The intro remains fully usable when storage is unavailable.
  }
}
