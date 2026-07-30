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
  BOOT_SEQUENCE_MINIMUM_MS,
  shouldBypassBoot,
} from './bootSequencePreferences'

function readBootPreferences() {
  return {
    compactViewport: window.matchMedia('(max-width: 900px)').matches,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
}

export function BootSequence() {
  const [visible, setVisible] = useState(() => !shouldBypassBoot(readBootPreferences()))
  const [phase, setPhase] = useState<GameLoadingPhase>('runtime')
  const [progress, setProgress] = useState(0.04)
  const [ready, setReady] = useState(false)
  const [minimumElapsed, setMinimumElapsed] = useState(false)
  const [exiting, setExiting] = useState(false)
  const phaseIndex = useMemo(() => getLoadingPhaseIndex(phase), [phase])

  useEffect(() => {
    if (!visible) return

    const minimumTimer = window.setTimeout(
      () => setMinimumElapsed(true),
      BOOT_SEQUENCE_MINIMUM_MS,
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
      window.clearTimeout(minimumTimer)
      window.removeEventListener('keydown', skipOnEscape)
      removeLoadingListener()
      removeReadyListener()
      removeErrorListener()
    }
  }, [visible])

  useEffect(() => {
    if (!visible || !ready || !minimumElapsed) return

    let exitTimer: number | undefined
    const startExitTimer = window.setTimeout(() => {
      setExiting(true)
      exitTimer = window.setTimeout(() => setVisible(false), BOOT_SEQUENCE_EXIT_MS)
    }, 0)

    return () => {
      window.clearTimeout(startExitTimer)
      if (exitTimer !== undefined) window.clearTimeout(exitTimer)
    }
  }, [minimumElapsed, ready, visible])

  if (!visible) return null

  const progressPercent = Math.round(progress * 100)

  return (
    <section
      className="boot-sequence"
      data-exiting={exiting}
      data-ready={ready}
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
          <div className="boot-sequence__title">
            <p>Private signal / public record</p>
            <strong><span>Xiangyu’s</span> AI Lab</strong>
            <small>AI application engineering · Hong Kong</small>
          </div>

          <div className="boot-sequence__core" data-ready={ready}>
            <i />
            <i />
            <i />
            <b>{String(progressPercent).padStart(2, '0')}</b>
            <span>LAB-01</span>
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
