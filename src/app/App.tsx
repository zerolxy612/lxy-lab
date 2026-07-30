import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { StationId } from '../content/stations'
import { labBridge } from '../game/bridge'
import { BootSequence } from '../ui/BootSequence'
import { ContactLinks } from '../ui/ContactLinks'
import { GameViewport } from '../ui/GameViewport'
import { InteractionPrompt } from '../ui/InteractionPrompt'
import { PanelHost } from '../ui/PanelHost'
import { QuickAccess } from '../ui/QuickAccess'

export function App() {
  const quickAccessTrigger = useRef<HTMLButtonElement>(null)
  const [nearbyStation, setNearbyStation] = useState<StationId | null>(null)
  const [activeStation, setActiveStation] = useState<StationId | null>(null)
  const [visitedStations, setVisitedStations] = useState<StationId[]>([])
  const [hasMoved, setHasMoved] = useState(false)
  const visitedStationSet = useMemo(() => new Set(visitedStations), [visitedStations])
  const closePanel = useCallback(() => setActiveStation(null), [])
  const openStation = useCallback((stationId: StationId) => {
    setVisitedStations((current) => (
      current.includes(stationId) ? current : [...current, stationId]
    ))
    setActiveStation(stationId)
  }, [])

  useEffect(() => {
    const removeNearbyListener = labBridge.on(
      'station:nearby',
      ({ stationId }) => setNearbyStation(stationId),
    )
    const removeActivateListener = labBridge.on(
      'station:activate',
      ({ stationId }) => openStation(stationId),
    )
    const removeFirstMoveListener = labBridge.on(
      'player:first-move',
      () => setHasMoved(true),
    )

    return () => {
      removeNearbyListener()
      removeActivateListener()
      removeFirstMoveListener()
    }
  }, [openStation])

  useEffect(() => {
    labBridge.emit('ui:panel-change', {
      open: activeStation !== null,
      stationId: activeStation,
    })
  }, [activeStation])

  useEffect(() => {
    labBridge.emit('ui:visited-change', { visited: visitedStations })
  }, [visitedStations])

  useEffect(() => labBridge.on('game:ready', () => {
    labBridge.emit('ui:panel-change', {
      open: activeStation !== null,
      stationId: activeStation,
    })
    labBridge.emit('ui:visited-change', { visited: visitedStations })
  }), [activeStation, visitedStations])

  return (
    <main className="lab-shell">
      <a className="skip-link" href="#quick-access">Skip to quick access</a>
      <BootSequence />

      <header className="identity-lockup">
        <span className="signal-dot" aria-hidden="true" />
        <div>
          <p>AI Application Engineer · Hong Kong</p>
          <h1>Xiangyu’s AI Lab</h1>
        </div>
      </header>
      <ContactLinks />

      <div className="game-frame">
        <GameViewport />
      </div>

      <div id="quick-access">
        <QuickAccess
          triggerRef={quickAccessTrigger}
          visitedStations={visitedStationSet}
          onSelect={openStation}
        />
      </div>

      <InteractionPrompt
        hasMoved={hasMoved}
        stationId={nearbyStation}
        visited={nearbyStation ? visitedStationSet.has(nearbyStation) : false}
      />
      <section className="mobile-guide" aria-label="Mobile archive guide">
        <span>Field guide</span>
        <strong>Five signals, one room.</strong>
        <p>Open the archive index to explore without steering the character.</p>
      </section>
      <PanelHost
        stationId={activeStation}
        returnFocusRef={quickAccessTrigger}
        onClose={closePanel}
        onNavigate={openStation}
      />
    </main>
  )
}
