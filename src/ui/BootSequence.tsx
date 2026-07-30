import { useEffect, useState } from 'react'
import { BOOT_SEQUENCE_DURATION_MS, shouldBypassBoot } from './bootSequencePreferences'

function readBootPreferences() {
  return {
    compactViewport: window.matchMedia('(max-width: 900px)').matches,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
}

export function BootSequence() {
  const [visible, setVisible] = useState(() => !shouldBypassBoot(readBootPreferences()))

  useEffect(() => {
    if (!visible) return

    const finish = () => setVisible(false)
    const timer = window.setTimeout(finish, BOOT_SEQUENCE_DURATION_MS)
    const skipOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
    }

    window.addEventListener('keydown', skipOnEscape)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', skipOnEscape)
    }
  }, [visible])

  if (!visible) return null

  return (
    <section className="boot-sequence" aria-label="Lab startup sequence">
      <div className="boot-sequence__frame" aria-hidden="true">
        <p className="boot-sequence__eyebrow">Night shift · Hong Kong</p>
        <div className="boot-sequence__signal">
          <span>LAB-01</span>
          <span>Signal acquired</span>
        </div>
        <strong>Xiangyu’s AI Lab</strong>
        <p>AI application engineering · room systems online</p>
        <div className="boot-sequence__rail">
          <span>Room</span>
          <span>Archive</span>
          <span>Core</span>
        </div>
      </div>
      <button type="button" className="boot-sequence__skip" onClick={() => setVisible(false)}>
        Skip intro <kbd>Esc</kbd>
      </button>
    </section>
  )
}
