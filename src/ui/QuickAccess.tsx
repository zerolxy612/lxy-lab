import { useState } from 'react'
import type { StationId } from '../content/stations'
import { stations } from '../content/stations'

interface QuickAccessProps {
  onSelect: (stationId: StationId) => void
}

export function QuickAccess({ onSelect }: QuickAccessProps) {
  const [open, setOpen] = useState(false)

  const selectStation = (stationId: StationId) => {
    onSelect(stationId)
    setOpen(false)
  }

  return (
    <div className="quick-access" data-open={open}>
      <button
        className="quick-access-trigger"
        aria-expanded={open}
        aria-controls="quick-access-menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span>Quick access</span>
        <b aria-hidden="true">{open ? '×' : '＋'}</b>
      </button>
      <nav id="quick-access-menu" aria-label="Quick access" hidden={!open}>
        {stations.map((station) => (
          <button key={station.id} onClick={() => selectStation(station.id)}>
            <span>{station.index}</span>
            {station.title}
          </button>
        ))}
      </nav>
    </div>
  )
}
