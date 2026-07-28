import type { StationId } from '../content/stations'
import { stations } from '../content/stations'

interface QuickAccessProps {
  onSelect: (stationId: StationId) => void
}

export function QuickAccess({ onSelect }: QuickAccessProps) {
  return (
    <nav className="quick-access" aria-label="Quick access">
      <span>Quick access</span>
      {stations.map((station) => (
        <button key={station.id} onClick={() => onSelect(station.id)}>
          {station.title}
        </button>
      ))}
    </nav>
  )
}
