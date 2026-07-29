import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { StationId } from '../content/stations'
import { stationById } from '../content/stations'
import { selectedProjects } from '../content/projects'
import { ExperienceArchive } from './ExperienceArchive'
import { restoreFocus } from './focusReturn'

interface PanelHostProps {
  stationId: StationId | null
  returnFocusRef: RefObject<HTMLElement | null>
  onClose: () => void
}

export function PanelHost({ stationId, returnFocusRef, onClose }: PanelHostProps) {
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
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="station-panel-title"
    >
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

      {stationId === 'experience' ? (
        <ExperienceArchive />
      ) : stationId === 'projects' ? (
        <div className="project-list">
          {selectedProjects.map((project) => (
            <article key={project.id}>
              <span>{project.type}</span>
              <h3>{project.name}</h3>
              <p>{project.summary}</p>
            </article>
          ))}
        </div>
      ) : (
        <ul>
          {station.details.map((detail) => <li key={detail}>{detail}</li>)}
        </ul>
      )}
    </aside>
  )
}
