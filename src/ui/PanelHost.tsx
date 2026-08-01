import { useEffect, useRef } from 'react'
import type { CSSProperties, RefObject } from 'react'
import type { StationId } from '../content/stations'
import { stationById } from '../content/stations'
import { ExperienceArchive } from './ExperienceArchive'
import { LabCompanion } from './LabCompanion'
import { SelectedWork } from './SelectedWork'
import { restoreFocus } from './focusReturn'
import type { NpcId } from '../content/npcs'

interface PanelHostProps {
  stationId: StationId | null
  returnFocusRef: RefObject<HTMLElement | null>
  onClose: () => void
  onNavigate: (stationId: StationId) => void
  onOpenNpc: (npcId: NpcId) => void
}

export function PanelHost({ stationId, returnFocusRef, onClose, onNavigate, onOpenNpc }: PanelHostProps) {
  const panel = useRef<HTMLElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!stationId) return

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const fallbackFocus = returnFocusRef.current
    closeButton.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      restoreFocus(previousFocus, fallbackFocus)
    }
  }, [stationId, returnFocusRef, onClose])

  if (!stationId) return null

  const station = stationById[stationId]

  return (
    <aside
      ref={panel}
      className="station-panel"
      data-station={station.id}
      style={{ '--station-accent': station.accent } as CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-labelledby="station-panel-title"
    >
      <span className="panel-location" aria-hidden="true">HKG / LAB-01</span>
      <header>
        <div>
          <span>{station.index} / {station.eyebrow}</span>
          <h2 id="station-panel-title">{station.title}</h2>
        </div>
        <button ref={closeButton} className="panel-close" onClick={onClose} aria-label="Close panel">
          Close
        </button>
      </header>

      <p className="panel-summary">{station.summary}</p>

      {stationId === 'assistant' ? (
        <LabCompanion onNavigate={onNavigate} />
      ) : stationId === 'experience' ? (
        <ExperienceArchive />
      ) : stationId === 'projects' ? (
        <SelectedWork />
      ) : (
        <ul>
          {station.details.map((detail) => <li key={detail}>{detail}</li>)}
        </ul>
      )}
      {(stationId === 'systems' || stationId === 'experience') && (
        <button
          type="button"
          className="npc-channel-link"
          onClick={() => onOpenNpc(stationId === 'systems' ? 'rook' : 'mira')}
        >
          <span>Character channel</span>
          Talk to {stationId === 'systems' ? 'ROOK' : 'MIRA'} <i aria-hidden="true">→</i>
        </button>
      )}
    </aside>
  )
}
