import { useEffect, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import type { StationId } from '../content/stations'
import { stations } from '../content/stations'

const mobileArchiveQuery = '(max-width: 900px)'

interface QuickAccessProps {
  triggerRef: RefObject<HTMLButtonElement | null>
  visitedStations: ReadonlySet<StationId>
  onSelect: (stationId: StationId) => void
  onOpenBriefing: () => void
}

export function QuickAccess({ triggerRef, visitedStations, onSelect, onOpenBriefing }: QuickAccessProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const mobileArchive = window.matchMedia(mobileArchiveQuery)
    const revealArchive = ({ matches }: MediaQueryList | MediaQueryListEvent) => {
      if (matches) setOpen(true)
    }

    revealArchive(mobileArchive)
    mobileArchive.addEventListener('change', revealArchive)
    return () => mobileArchive.removeEventListener('change', revealArchive)
  }, [])

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

  const openBriefing = () => {
    setOpen(false)
    onOpenBriefing()
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
        <div className="quick-access-intro">
          <span>Archive index</span>
          <p>Choose one signal. The room stays available behind every record.</p>
        </div>
        <button className="quick-access-briefing" type="button" onClick={openBriefing}>
          <span>00</span>
          Visitor briefing
          <i aria-hidden="true">→</i>
        </button>
        {stations.map((station) => (
          <button
            key={station.id}
            data-station={station.id}
            data-visited={visitedStations.has(station.id)}
            style={{ '--station-accent': station.accent } as CSSProperties}
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
