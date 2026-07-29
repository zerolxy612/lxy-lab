import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import type { StationId } from '../content/stations'
import { stations } from '../content/stations'

interface QuickAccessProps {
  triggerRef: RefObject<HTMLButtonElement | null>
  visitedStations: ReadonlySet<StationId>
  onSelect: (stationId: StationId) => void
}

export function QuickAccess({ triggerRef, visitedStations, onSelect }: QuickAccessProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, triggerRef])

  const selectStation = (stationId: StationId) => {
    setOpen(false)
    triggerRef.current?.focus()
    onSelect(stationId)
  }

  return (
    <div className="quick-access" data-open={open}>
      <button
        ref={triggerRef}
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
