import { describe, expect, it, vi } from 'vitest'
import { createActiveTimeWatchdog } from './startupWatchdog'

describe('active-time startup watchdog', () => {
  it('does not count time while the page is paused in the background', () => {
    let now = 0
    const scheduled: { delay: number; callback: (() => void) | null } = {
      delay: 0,
      callback: null,
    }
    const onTimeout = vi.fn()
    const watchdog = createActiveTimeWatchdog({
      timeoutMs: 20_000,
      onTimeout,
      now: () => now,
      setTimer: (callback, delay) => {
        scheduled.callback = callback
        scheduled.delay = delay
        return 1
      },
      clearTimer: () => {
        scheduled.callback = null
      },
    })

    watchdog.resume()
    expect(scheduled.delay).toBe(20_000)

    now = 5_000
    watchdog.pause()
    now = 125_000
    watchdog.resume()

    expect(scheduled.delay).toBe(15_000)
    expect(onTimeout).not.toHaveBeenCalled()
    expect(scheduled.callback).not.toBeNull()
    scheduled.callback?.()
    expect(onTimeout).toHaveBeenCalledOnce()
  })

  it('cancels a pending timeout after startup succeeds', () => {
    const onTimeout = vi.fn()
    const clearTimer = vi.fn()
    const watchdog = createActiveTimeWatchdog({
      timeoutMs: 20_000,
      onTimeout,
      setTimer: () => 7,
      clearTimer,
    })

    watchdog.resume()
    watchdog.cancel()
    watchdog.resume()

    expect(clearTimer).toHaveBeenCalledWith(7)
    expect(onTimeout).not.toHaveBeenCalled()
  })
})
