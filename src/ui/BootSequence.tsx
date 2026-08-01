import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  clampLoadingProgress,
  gameLoadingLabel,
  gameLoadingPhases,
  getLoadingPhaseIndex,
  type GameLoadingPhase,
} from '../game/gameLoading'
import { labBridge } from '../game/bridge'
import {
  BOOT_SEQUENCE_EXIT_MS,
  BOOT_SEQUENCE_ONLINE_MS,
  BOOT_SEQUENCE_PRELUDE_MS,
  isReturningVisitor,
  markBootVisit,
  shouldBypassBoot,
} from './bootSequencePreferences'

const bootLogSteps = [
  { phaseIndex: 0, command: 'Connecting Hong Kong night channel', complete: 'SIGNAL LOCKED' },
  { phaseIndex: 1, command: 'Waking Living AI Core', complete: 'CORE STABLE' },
  { phaseIndex: 2, command: 'Indexing public memories', complete: 'ARCHIVE READY' },
  { phaseIndex: 3, command: 'Synchronizing project signals', complete: '02 RECORDS FOUND' },
] as const

function readBootPreferences() {
  return {
    compactViewport: window.matchMedia('(max-width: 900px)').matches,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
}

function readBootStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function BootSequence() {
  const [visible, setVisible] = useState(() => !shouldBypassBoot(readBootPreferences()))
  const [returningVisitor] = useState(() => isReturningVisitor(readBootStorage()))
  const [phase, setPhase] = useState<GameLoadingPhase>('runtime')
  const [progress, setProgress] = useState(0.04)
  const [ready, setReady] = useState(false)
  const [preludeElapsed, setPreludeElapsed] = useState(false)
  const [exiting, setExiting] = useState(false)
  const phaseIndex = useMemo(() => getLoadingPhaseIndex(phase), [phase])
  const online = ready && preludeElapsed

  useEffect(() => {
    markBootVisit(readBootStorage())
  }, [])

  useEffect(() => {
    if (!visible) return

    const preludeTimer = window.setTimeout(
      () => setPreludeElapsed(true),
      BOOT_SEQUENCE_PRELUDE_MS,
    )
    const skipOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setVisible(false)
    }
    const removeLoadingListener = labBridge.on('game:loading', (next) => {
      setPhase(next.phase)
      setProgress((current) => Math.max(current, clampLoadingProgress(next.progress)))
    })
    const removeReadyListener = labBridge.on('game:ready', () => {
      setPhase('ready')
      setProgress(1)
      setReady(true)
    })
    const removeErrorListener = labBridge.on('game:error', () => setVisible(false))

    window.addEventListener('keydown', skipOnEscape)
    return () => {
      window.clearTimeout(preludeTimer)
      window.removeEventListener('keydown', skipOnEscape)
      removeLoadingListener()
      removeReadyListener()
      removeErrorListener()
    }
  }, [visible])

  useEffect(() => {
    if (!visible || !online) return

    let exitTimer: number | undefined
    const startExitTimer = window.setTimeout(() => {
      setExiting(true)
      exitTimer = window.setTimeout(() => setVisible(false), BOOT_SEQUENCE_EXIT_MS)
    }, BOOT_SEQUENCE_ONLINE_MS)

    return () => {
      window.clearTimeout(startExitTimer)
      if (exitTimer !== undefined) window.clearTimeout(exitTimer)
    }
  }, [online, visible])

  if (!visible) return null

  const progressPercent = Math.round(progress * 100)

  return (
    <section
      className="boot-sequence"
      data-exiting={exiting}
      data-ready={ready}
      data-online={online}
      aria-label="Lab startup sequence"
    >
      <div className="boot-sequence__shutters" aria-hidden="true">
        <span />
        <span />
      </div>

      <div className="boot-sequence__frame" aria-hidden="true">
        <div className="boot-sequence__topline">
          <span>22°17′N / 114°10′E</span>
          <span>Hong Kong night research channel</span>
        </div>

        <div className="boot-sequence__hero">
          <div className="boot-sequence__terminal">
            <p>INITIALIZING LAB-01...</p>
            <ol>
              {bootLogSteps.map((step) => {
                const state = phaseIndex > step.phaseIndex
                  ? 'complete'
                  : phaseIndex === step.phaseIndex
                    ? 'active'
                    : 'pending'
                return (
                  <li key={step.command} data-state={state}>
                    <span><i aria-hidden="true">›</i>{step.command}...</span>
                    <b>{state === 'complete' ? step.complete : state === 'active' ? `RUNNING / ${progressPercent}%` : 'QUEUED'}</b>
                  </li>
                )
              })}
              <li className="boot-sequence__deferred" data-state={phaseIndex >= 3 ? 'deferred' : 'pending'}>
                <span><i aria-hidden="true">›</i>Checking restricted prototypes...</span>
                <b>{phaseIndex >= 3 ? 'NULL-03 / ACCESS DEFERRED' : 'QUEUED'}</b>
              </li>
            </ol>
          </div>

          <div className="boot-sequence__core" data-ready={ready}>
            <i />
            <i />
            <i />
            <b>{String(progressPercent).padStart(2, '0')}</b>
            <span>LAB-01</span>
          </div>

          <div className="boot-sequence__identity">
            <p>SYSTEM ONLINE</p>
            <span>{returningVisitor ? 'Welcome back, visitor.' : 'Welcome, visitor.'}</span>
            <small>You are entering:</small>
            <strong aria-label="Xiangyu AI Lab">
              <i>X I A N G Y U</i>
              <i>A I</i>
              <i>L A B</i>
            </strong>
          </div>
        </div>

        <div className="boot-sequence__telemetry">
          <ol>
            {gameLoadingPhases.slice(0, -1).map((step, index) => (
              <li
                key={step.id}
                data-state={index < phaseIndex ? 'complete' : index === phaseIndex ? 'active' : 'pending'}
              >
                <span>0{index + 1}</span>
                {step.shortLabel}
              </li>
            ))}
          </ol>
          <div className="boot-sequence__progress">
            <i style={{ transform: `scaleX(${progress})` } as CSSProperties} />
          </div>
          <p>{gameLoadingLabel[phase]} <span>{progressPercent}%</span></p>
        </div>

        <p className="boot-sequence__vertical">香港夜間研究室</p>
      </div>

      <p className="boot-sequence__live" role="status" aria-live="polite">
        {gameLoadingLabel[phase]}. {progressPercent}%.
      </p>
      <button type="button" className="boot-sequence__skip" onClick={() => setVisible(false)}>
        Skip intro <kbd>Esc</kbd>
      </button>
    </section>
  )
}
