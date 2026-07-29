import { useEffect, useRef, useState } from 'react'
import type { StationId } from '../content/stations'
import { stations } from '../content/stations'

interface QuickAccessProps {
  visitedStations: ReadonlySet<StationId>
  onSelect: (stationId: StationId) => void
}

export function QuickAccess({ visitedStations, onSelect }: QuickAccessProps) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      trigger.current?.focus()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  const selectStation = (stationId: StationId) => {
    onSelect(stationId)
    setOpen(false)
  }

  return (
    <div className="quick-access" data-open={open}>
      <button
        ref={trigger}
        className="quick-access-trigger"
        aria-expanded={open}
        aria-controls="quick-access-menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span>Quick access · {visitedStations.size}/5</span>
        <b aria-hidden="true">{open ? '×' : '＋'}</b>
      </button>
      <nav id="quick-access-menu" aria-label="Quick access" hidden={!open}>
        {stations.map((station) => (
          <button
            key={station.id}
            data-visited={visitedStations.has(station.id)}
            aria-label={`${station.title}${visitedStations.has(station.id) ? ', visited' : ''}`}
            onClick={() => selectStation(station.id)}
          >
            <span>{station.index}</span>
            {station.title}
            <i aria-hidden="true">{visitedStations.has(station.id) ? '◆' : '◇'}</i>
          </button>
        ))}
      </nav>
    </div>
  )
}
