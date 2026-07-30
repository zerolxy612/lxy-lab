import { describe, expect, it } from 'vitest'
import {
  clampLoadingProgress,
  getLoadingPhaseIndex,
} from './gameLoading'

describe('game loading state', () => {
  it('clamps loader progress to a safe visual range', () => {
    expect(clampLoadingProgress(-0.4)).toBe(0)
    expect(clampLoadingProgress(0.52)).toBe(0.52)
    expect(clampLoadingProgress(1.4)).toBe(1)
  })

  it('keeps the ready phase after every loading stage', () => {
    expect(getLoadingPhaseIndex('runtime')).toBe(0)
    expect(getLoadingPhaseIndex('ready')).toBe(4)
  })
})
