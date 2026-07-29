import { useEffect, useRef } from 'react'
import type { StationId } from '../content/stations'
import { stationById } from '../content/stations'
import { selectedProjects } from '../content/projects'
import { ExperienceArchive } from './ExperienceArchive'

interface PanelHostProps {
  stationId: StationId | null
  onClose: () => void
}

export function PanelHost({ stationId, onClose }: PanelHostProps) {
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!stationId) return

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    closeButton.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      previousFocus?.focus()
    }
  }, [stationId, onClose])

  if (!stationId) return null

  const station = stationById[stationId]

  return (
    <aside
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
