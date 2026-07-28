import { useEffect, useRef } from 'react'
import type { StationId } from '../content/stations'
import { stationById } from '../content/stations'
import { selectedProjects } from '../content/projects'

interface PanelHostProps {
  stationId: StationId | null
  onClose: () => void
}

export function PanelHost({ stationId, onClose }: PanelHostProps) {
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!stationId) return

    closeButton.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [stationId, onClose])

  if (!stationId) return null

  const station = stationById[stationId]

  return (
    <aside className="station-panel" aria-labelledby="station-panel-title">
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

      {stationId === 'projects' ? (
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
