import type { StationId } from '../content/stations'
import { stationById } from '../content/stations'
import type { NpcId } from '../content/npcs'
import { npcById } from '../content/npcs'

interface InteractionPromptProps {
  hasMoved: boolean
  stationId: StationId | null
  npcId: NpcId | null
  visited: boolean
}

export function InteractionPrompt({ hasMoved, stationId, npcId, visited }: InteractionPromptProps) {
  return (
    <div className="interaction-prompt" aria-live="polite">
      {npcId ? (
        <>
          <kbd>E</kbd>
          <span>Talk to {npcById[npcId].name}</span>
        </>
      ) : stationId ? (
        <>
          <kbd>E</kbd>
          <span>{visited ? 'Revisit' : 'Explore'} {stationById[stationId].title}</span>
        </>
      ) : !hasMoved ? (
        <>
          <kbd>WASD</kbd>
          <span>Move through the lab</span>
        </>
      ) : (
        <span>Walk close to a system to interact</span>
      )}
    </div>
  )
}
