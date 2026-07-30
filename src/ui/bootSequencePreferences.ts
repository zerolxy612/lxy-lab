export const BOOT_SEQUENCE_DURATION_MS = 2300

interface BootPreferences {
  compactViewport: boolean
  reducedMotion: boolean
}

export function shouldBypassBoot({ compactViewport, reducedMotion }: BootPreferences) {
  return compactViewport || reducedMotion
}
