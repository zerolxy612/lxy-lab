interface StartupWatchdogOptions {
  timeoutMs: number
  onTimeout: () => void
  now?: () => number
  setTimer?: (callback: () => void, delay: number) => number
  clearTimer?: (timer: number) => void
}

export function createActiveTimeWatchdog({
  timeoutMs,
  onTimeout,
  now = Date.now,
  setTimer = (callback, delay) => window.setTimeout(callback, delay),
  clearTimer = (timer) => window.clearTimeout(timer),
}: StartupWatchdogOptions) {
  let remainingMs = timeoutMs
  let startedAt = 0
  let timer: number | null = null
  let finished = false

  const pause = () => {
    if (timer === null || finished) return
    remainingMs = Math.max(0, remainingMs - (now() - startedAt))
    clearTimer(timer)
    timer = null
  }

  const resume = () => {
    if (timer !== null || finished) return
    if (remainingMs <= 0) {
      finished = true
      onTimeout()
      return
    }
    startedAt = now()
    timer = setTimer(() => {
      timer = null
      finished = true
      onTimeout()
    }, remainingMs)
  }

  const cancel = () => {
    if (timer !== null) clearTimer(timer)
    timer = null
    finished = true
  }

  return { pause, resume, cancel }
}
