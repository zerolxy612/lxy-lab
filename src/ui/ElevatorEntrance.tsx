import { useCallback, useEffect, useState } from 'react'
import { labBridge } from '../game/bridge'
import {
  hasCompletedElevator,
  markElevatorComplete,
  shouldBypassElevator,
} from './bootSequencePreferences'

function readSessionStorage() {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function shouldSkipEntrance() {
  return shouldBypassElevator({
    compactViewport: window.matchMedia('(max-width: 900px)').matches,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    completed: hasCompletedElevator(readSessionStorage()),
  })
}

export function ElevatorEntrance() {
  const [visible, setVisible] = useState(false)
  const [departing, setDeparting] = useState(false)

  const enter = useCallback(() => {
    if (departing) return
    setDeparting(true)
    labBridge.emit('ui:elevator-start', {})
  }, [departing])

  const skip = useCallback(() => {
    markElevatorComplete(readSessionStorage())
    setVisible(false)
    labBridge.emit('ui:elevator-skip', {})
  }, [])

  useEffect(() => {
    const removeEntranceReadyListener = labBridge.on('game:entrance-ready', () => {
      if (shouldSkipEntrance()) {
        labBridge.emit('ui:elevator-skip', {})
        return
      }
      setVisible(true)
    })
    const removeReadyListener = labBridge.on('game:ready', () => {
      markElevatorComplete(readSessionStorage())
      setVisible(false)
    })

    return () => {
      removeEntranceReadyListener()
      removeReadyListener()
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    const handleEntranceKey = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key === 'Escape') {
        event.preventDefault()
        skip()
        return
      }
      if (event.key !== 'Enter' || event.target instanceof HTMLButtonElement) return
      event.preventDefault()
      enter()
    }
    window.addEventListener('keydown', handleEntranceKey)
    return () => window.removeEventListener('keydown', handleEntranceKey)
  }, [enter, skip, visible])

  if (!visible) return null

  if (departing) {
    return (
      <button type="button" className="elevator-ride-skip" onClick={skip}>
        Skip elevator <kbd>Esc</kbd>
      </button>
    )
  }

  return (
    <section className="elevator-entry" aria-label="LXY Lab elevator entrance">
      <header>
        <span>SUBLEVEL B7</span>
        <i>TRANSIT READY</i>
      </header>
      <strong>Enter the underground lab</strong>
      <small>Private lift · Session 07</small>
      <div className="elevator-entry__actions">
        <button type="button" className="elevator-entry__enter" onClick={enter}>
          <span>Enter lab</span>
          <kbd>Enter</kbd>
        </button>
        <button type="button" className="elevator-entry__skip" onClick={skip}>
          Skip <kbd>Esc</kbd>
        </button>
      </div>
    </section>
  )
}
