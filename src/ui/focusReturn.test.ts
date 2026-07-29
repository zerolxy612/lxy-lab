import { describe, expect, it, vi } from 'vitest'
import { restoreFocus } from './focusReturn'

describe('restoreFocus', () => {
  it('returns focus to the connected origin', () => {
    const previousFocus = { isConnected: true, focus: vi.fn() }
    const fallbackFocus = { isConnected: true, focus: vi.fn() }

    restoreFocus(previousFocus, fallbackFocus)

    expect(previousFocus.focus).toHaveBeenCalledOnce()
    expect(fallbackFocus.focus).not.toHaveBeenCalled()
  })

  it('uses the stable fallback after the origin is removed', () => {
    const previousFocus = { isConnected: false, focus: vi.fn() }
    const fallbackFocus = { isConnected: true, focus: vi.fn() }

    restoreFocus(previousFocus, fallbackFocus)

    expect(previousFocus.focus).not.toHaveBeenCalled()
    expect(fallbackFocus.focus).toHaveBeenCalledOnce()
  })
})
