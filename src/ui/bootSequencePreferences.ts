export const BOOT_SEQUENCE_MINIMUM_MS = 2800
export const BOOT_SEQUENCE_EXIT_MS = 620

interface BootPreferences {
  compactViewport: boolean
  reducedMotion: boolean
}

export function shouldBypassBoot({ compactViewport, reducedMotion }: BootPreferences) {
  return compactViewport || reducedMotion
}
