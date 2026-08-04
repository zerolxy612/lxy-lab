import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { StationId } from '../content/stations'
import type { NpcId } from '../content/npcs'
import { npcById } from '../content/npcs'
import { labBridge, type NpcDialogueAnchor } from '../game/bridge'
import { BootSequence } from '../ui/BootSequence'
import { ContactLinks } from '../ui/ContactLinks'
import { GameViewport } from '../ui/GameViewport'
import { InteractionPrompt } from '../ui/InteractionPrompt'
import { PanelHost } from '../ui/PanelHost'
import { QuickAccess } from '../ui/QuickAccess'
import { RoomAmbienceControl } from '../ui/RoomAmbienceControl'
import { NpcDialogue } from '../ui/NpcDialogue'
import { NpcBark, type ActiveNpcBark } from '../ui/NpcBark'
import { registerNpcTalk, takeNextNpcBark } from '../ui/npcSessionState'
import { ElevatorEntrance } from '../ui/ElevatorEntrance'
import { VisitorEntry, type VisitorEntryView } from '../ui/VisitorEntry'
import {
  hasChosenVisitorEntry,
  markVisitorEntryChoice,
} from '../ui/visitorEntrySession'

function readSessionStorage() {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function App() {
  const quickAccessTrigger = useRef<HTMLButtonElement>(null)
  const barkId = useRef(0)
  const [nearbyStation, setNearbyStation] = useState<StationId | null>(null)
  const [activeStation, setActiveStation] = useState<StationId | null>(null)
  const [nearbyNpc, setNearbyNpc] = useState<NpcId | null>(null)
  const [activeNpc, setActiveNpc] = useState<NpcId | null>(null)
  const [activeNpcTalkCount, setActiveNpcTalkCount] = useState(0)
  const [activeBark, setActiveBark] = useState<ActiveNpcBark | null>(null)
  const [dialogueAnchor, setDialogueAnchor] = useState<NpcDialogueAnchor | null>(null)
  const [visitedStations, setVisitedStations] = useState<StationId[]>([])
  const [hasMoved, setHasMoved] = useState(false)
  const [gameReady, setGameReady] = useState(false)
  const [gameFailed, setGameFailed] = useState(false)
  const [visitorEntryView, setVisitorEntryView] = useState<VisitorEntryView>('closed')
  const labChromeVisible = (gameReady || gameFailed) && visitorEntryView === 'closed'
  const visitedStationSet = useMemo(() => new Set(visitedStations), [visitedStations])
  const closePanel = useCallback(() => setActiveStation(null), [])
  const closeDialogue = useCallback(() => {
    setActiveNpc(null)
    setDialogueAnchor(null)
  }, [])
  const openStation = useCallback((stationId: StationId) => {
    setVisitedStations((current) => (
      current.includes(stationId) ? current : [...current, stationId]
    ))
    setActiveStation(stationId)
    setActiveNpc(null)
    setDialogueAnchor(null)
    setActiveBark(null)
  }, [])
  const openNpc = useCallback((npcId: NpcId, anchor: NpcDialogueAnchor) => {
    setActiveStation(null)
    setActiveBark(null)
    setActiveNpc(npcId)
    setDialogueAnchor(anchor)
    setActiveNpcTalkCount(registerNpcTalk(readSessionStorage(), npcId))
  }, [])
  const requestNpc = useCallback((npcId: NpcId) => {
    labBridge.emit('ui:npc-request', { npcId })
  }, [])
  const openVisitorBriefing = useCallback(() => {
    markVisitorEntryChoice(readSessionStorage(), 'briefing')
    setActiveStation(null)
    setActiveNpc(null)
    setActiveBark(null)
    setDialogueAnchor(null)
    setVisitorEntryView('briefing')
  }, [])
  const exploreLab = useCallback(() => {
    markVisitorEntryChoice(readSessionStorage(), 'explore')
    setVisitorEntryView('closed')
    window.requestAnimationFrame(() => {
      const compactViewport = window.matchMedia('(max-width: 900px)').matches
      if (compactViewport) {
        if (quickAccessTrigger.current?.getAttribute('aria-expanded') === 'false') {
          quickAccessTrigger.current.click()
        }
        quickAccessTrigger.current?.focus()
        return
      }
      document.querySelector<HTMLElement>('.game-viewport')?.focus()
    })
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
      ({ npcId, anchor }) => {
        setNearbyNpc(npcId)
        if (!npcId || !anchor) {
          setActiveBark(null)
          return
        }
        const npc = npcById[npcId]
        const barkIndex = takeNextNpcBark(readSessionStorage(), npcId)
        barkId.current += 1
        setActiveBark({
          id: barkId.current,
          npcId,
          anchor,
          line: npc.barks[barkIndex % npc.barks.length],
        })
      },
    )
    const removeNpcActivateListener = labBridge.on(
      'npc:activate',
      ({ npcId, anchor }) => openNpc(npcId, anchor),
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
    labBridge.emit('ui:entry-change', {
      open: visitorEntryView !== 'closed',
    })
  }, [visitorEntryView])

  useEffect(() => {
    labBridge.emit('ui:visited-change', { visited: visitedStations })
  }, [visitedStations])

  useEffect(() => labBridge.on('game:ready', () => {
    setGameReady(true)
    if (!hasChosenVisitorEntry(readSessionStorage())) {
      setVisitorEntryView('choice')
    }
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
            onOpenBriefing={openVisitorBriefing}
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
      <VisitorEntry
        view={visitorEntryView}
        onOpenBriefing={openVisitorBriefing}
        onExplore={exploreLab}
      />
      <PanelHost
        stationId={activeStation}
        returnFocusRef={quickAccessTrigger}
        onClose={closePanel}
        onNavigate={openStation}
        onOpenNpc={requestNpc}
      />
      {activeBark && !activeNpc && !activeStation && (
        <NpcBark key={activeBark.id} bark={activeBark} />
      )}
      <NpcDialogue
        npcId={activeNpc}
        anchor={dialogueAnchor}
        talkCount={activeNpcTalkCount}
        visitedStations={visitedStationSet}
        returnFocusRef={quickAccessTrigger}
        onClose={closeDialogue}
        onNavigate={openStation}
      />
    </main>
  )
}
