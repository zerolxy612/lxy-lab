import { useEffect, useState } from 'react'
import type { StationId } from '../content/stations'
import { labBridge } from '../game/bridge'
import { GameViewport } from '../ui/GameViewport'
import { InteractionPrompt } from '../ui/InteractionPrompt'
import { PanelHost } from '../ui/PanelHost'
import { QuickAccess } from '../ui/QuickAccess'

export function App() {
  const [nearbyStation, setNearbyStation] = useState<StationId | null>(null)
  const [activeStation, setActiveStation] = useState<StationId | null>(null)

  useEffect(() => {
    const removeNearbyListener = labBridge.on(
      'station:nearby',
      ({ stationId }) => setNearbyStation(stationId),
    )
    const removeActivateListener = labBridge.on(
      'station:activate',
      ({ stationId }) => setActiveStation(stationId),
    )

    return () => {
      removeNearbyListener()
      removeActivateListener()
    }
  }, [])

  useEffect(() => {
    labBridge.emit('ui:panel-change', { open: activeStation !== null })
  }, [activeStation])

  return (
    <main className="lab-shell">
      <a className="skip-link" href="#quick-access">Skip to quick access</a>

      <header className="identity-lockup">
        <span className="signal-dot" aria-hidden="true" />
        <div>
          <p>AI Application Engineer · Hong Kong</p>
          <h1>Xiangyu’s AI Lab</h1>
        </div>
      </header>

      <div className="game-frame">
        <GameViewport />
      </div>

      <div id="quick-access">
        <QuickAccess onSelect={setActiveStation} />
      </div>

      <InteractionPrompt stationId={nearbyStation} />
      <PanelHost stationId={activeStation} onClose={() => setActiveStation(null)} />
    </main>
  )
}
