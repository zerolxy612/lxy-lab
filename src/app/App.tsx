import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { StationId } from '../content/stations'
import type { NpcId } from '../content/npcs'
import { labBridge } from '../game/bridge'
import { BootSequence } from '../ui/BootSequence'
import { ContactLinks } from '../ui/ContactLinks'
import { GameViewport } from '../ui/GameViewport'
import { InteractionPrompt } from '../ui/InteractionPrompt'
import { PanelHost } from '../ui/PanelHost'
import { QuickAccess } from '../ui/QuickAccess'
import { RoomAmbienceControl } from '../ui/RoomAmbienceControl'
import { NpcDialogue } from '../ui/NpcDialogue'
import { ElevatorEntrance } from '../ui/ElevatorEntrance'

export function App() {
  const quickAccessTrigger = useRef<HTMLButtonElement>(null)
  const [nearbyStation, setNearbyStation] = useState<StationId | null>(null)
  const [activeStation, setActiveStation] = useState<StationId | null>(null)
  const [nearbyNpc, setNearbyNpc] = useState<NpcId | null>(null)
  const [activeNpc, setActiveNpc] = useState<NpcId | null>(null)
  const [visitedStations, setVisitedStations] = useState<StationId[]>([])
  const [hasMoved, setHasMoved] = useState(false)
  const [gameReady, setGameReady] = useState(false)
  const [gameFailed, setGameFailed] = useState(false)
  const labChromeVisible = gameReady || gameFailed
  const visitedStationSet = useMemo(() => new Set(visitedStations), [visitedStations])
  const closePanel = useCallback(() => setActiveStation(null), [])
  const closeDialogue = useCallback(() => setActiveNpc(null), [])
  const openStation = useCallback((stationId: StationId) => {
    setVisitedStations((current) => (
      current.includes(stationId) ? current : [...current, stationId]
    ))
    setActiveStation(stationId)
    setActiveNpc(null)
  }, [])
  const openNpc = useCallback((npcId: NpcId) => {
    setActiveStation(null)
    setActiveNpc(npcId)
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
    const removeNpcNearbyListener = labBridge.on(
      'npc:nearby',
      ({ npcId }) => setNearbyNpc(npcId),
    )
    const removeNpcActivateListener = labBridge.on(
      'npc:activate',
      ({ npcId }) => openNpc(npcId),
    )
    const removeFirstMoveListener = labBridge.on(
      'player:first-move',
      () => setHasMoved(true),
    )

    return () => {
      removeNearbyListener()
      removeActivateListener()
      removeNpcNearbyListener()
      removeNpcActivateListener()
      removeFirstMoveListener()
    }
  }, [openNpc, openStation])

  useEffect(() => {
    labBridge.emit('ui:panel-change', {
      open: activeStation !== null,
      stationId: activeStation,
    })
  }, [activeStation])

  useEffect(() => {
    labBridge.emit('ui:dialogue-change', {
      open: activeNpc !== null,
      npcId: activeNpc,
    })
  }, [activeNpc])

  useEffect(() => {
    labBridge.emit('ui:visited-change', { visited: visitedStations })
  }, [visitedStations])

  useEffect(() => labBridge.on('game:ready', () => {
    setGameReady(true)
    labBridge.emit('ui:panel-change', {
      open: activeStation !== null,
      stationId: activeStation,
    })
    labBridge.emit('ui:visited-change', { visited: visitedStations })
    labBridge.emit('ui:dialogue-change', {
      open: activeNpc !== null,
      npcId: activeNpc,
    })
  }), [activeNpc, activeStation, visitedStations])

  useEffect(() => labBridge.on('game:error', () => setGameFailed(true)), [])

  return (
    <main className="lab-shell">
      <BootSequence />

      <div className="game-frame">
        <GameViewport />
      </div>
      <ElevatorEntrance />

      <div
        className="lab-chrome"
        data-visible={labChromeVisible}
        inert={!labChromeVisible}
        aria-hidden={!labChromeVisible}
      >
        <a className="skip-link" href="#quick-access">Skip to quick access</a>
        <header className="identity-lockup">
          <span className="signal-dot" aria-hidden="true" />
          <div>
            <p>AI Application Engineer · Hong Kong</p>
            <h1>Xiangyu’s AI Lab</h1>
          </div>
        </header>
        <ContactLinks />
        <RoomAmbienceControl />
        <div id="quick-access">
          <QuickAccess
            triggerRef={quickAccessTrigger}
            visitedStations={visitedStationSet}
            onSelect={openStation}
          />
        </div>
        {gameReady && (
          <InteractionPrompt
            hasMoved={hasMoved}
            stationId={nearbyStation}
            npcId={nearbyNpc}
            visited={nearbyStation ? visitedStationSet.has(nearbyStation) : false}
          />
        )}
        <section className="mobile-guide" aria-label="Mobile archive guide">
          <span>Field guide</span>
          <strong>Five signals, one room.</strong>
          <p>Open the archive index to explore without steering the character.</p>
        </section>
      </div>
      <PanelHost
        stationId={activeStation}
        returnFocusRef={quickAccessTrigger}
        onClose={closePanel}
        onNavigate={openStation}
        onOpenNpc={openNpc}
      />
      <NpcDialogue
        npcId={activeNpc}
        returnFocusRef={quickAccessTrigger}
        onClose={closeDialogue}
        onNavigate={openStation}
      />
    </main>
  )
}
