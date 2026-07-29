export interface FocusTarget {
  isConnected: boolean
  focus: () => void
}

export function restoreFocus(
  previousFocus: FocusTarget | null,
  fallbackFocus: FocusTarget | null,
) {
  const target = previousFocus?.isConnected ? previousFocus : fallbackFocus
  target?.focus()
}
