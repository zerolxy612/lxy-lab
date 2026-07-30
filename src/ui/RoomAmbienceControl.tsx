import { useCallback, useEffect, useRef, useState } from 'react'
import {
  isRoomAmbienceSupported,
  RoomAmbienceEngine,
} from '../audio/roomAmbience'
import {
  readRoomAmbiencePreference,
  writeRoomAmbiencePreference,
} from '../audio/roomAmbiencePreferences'

type AmbienceStatus = 'off' | 'ready' | 'starting' | 'on' | 'unavailable'

const statusLabel: Record<AmbienceStatus, string> = {
  off: 'Off',
  ready: 'Ready',
  starting: 'Starting',
  on: 'On',
  unavailable: 'Unavailable',
}

export function RoomAmbienceControl() {
  const engineRef = useRef<RoomAmbienceEngine | null>(null)
  const startPromiseRef = useRef<Promise<void> | null>(null)
  const [status, setStatus] = useState<AmbienceStatus>(() => {
    if (!isRoomAmbienceSupported()) return 'unavailable'
    return readRoomAmbiencePreference() ? 'ready' : 'off'
  })

  const startAmbience = useCallback(() => {
    if (startPromiseRef.current || status === 'on' || status === 'unavailable') return

    const engine = engineRef.current ?? new RoomAmbienceEngine()
    engineRef.current = engine
    writeRoomAmbiencePreference(true)
    setStatus('starting')

    const startPromise = engine.start()
      .then(() => setStatus('on'))
      .catch(() => {
        writeRoomAmbiencePreference(false)
        void engine.stop()
        engineRef.current = null
        setStatus('off')
      })
      .finally(() => {
        startPromiseRef.current = null
      })
    startPromiseRef.current = startPromise
  }, [status])

  const stopAmbience = useCallback(() => {
    writeRoomAmbiencePreference(false)
    setStatus('off')
    startPromiseRef.current = null
    const engine = engineRef.current
    engineRef.current = null
    if (engine) void engine.stop()
  }, [])

  useEffect(() => {
    if (status !== 'ready') return

    const resumeRememberedAmbience = () => startAmbience()
    window.addEventListener('pointerdown', resumeRememberedAmbience, { capture: true, once: true })
    window.addEventListener('keydown', resumeRememberedAmbience, { capture: true, once: true })
    return () => {
      window.removeEventListener('pointerdown', resumeRememberedAmbience, true)
      window.removeEventListener('keydown', resumeRememberedAmbience, true)
    }
  }, [startAmbience, status])

  useEffect(() => {
    if (status !== 'on') return

    const followPageVisibility = () => {
      const engine = engineRef.current
      if (!engine) return
      if (document.hidden) void engine.suspend()
      else void engine.resume()
    }
    document.addEventListener('visibilitychange', followPageVisibility)
    return () => document.removeEventListener('visibilitychange', followPageVisibility)
  }, [status])

  useEffect(() => () => {
    const engine = engineRef.current
    engineRef.current = null
    if (engine) void engine.stop()
  }, [])

  const enabled = status === 'ready' || status === 'starting' || status === 'on'
  const ariaLabel = status === 'ready'
    ? 'Room ambience remembered. Activate rain and laboratory sounds.'
    : status === 'on'
      ? 'Turn off room ambience'
      : status === 'unavailable'
        ? 'Room ambience is unavailable in this browser'
        : 'Turn on room ambience'

  return (
    <div className="room-ambience" data-state={status}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={enabled}
        disabled={status === 'starting' || status === 'unavailable'}
        onClick={status === 'on' ? stopAmbience : startAmbience}
      >
        <span className="room-ambience__meter" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="room-ambience__copy">
          <b>Ambience</b>
          <small>{statusLabel[status]}</small>
        </span>
        <span className="room-ambience__compact" aria-hidden="true">SND</span>
      </button>
    </div>
  )
}
