import type { StationId } from '../content/stations'
import { stationById } from '../content/stations'
import type { NpcId } from '../content/npcs'
import { npcById } from '../content/npcs'
import type { LabActivityId } from '../game/activities'

interface InteractionPromptProps {
  hasMoved: boolean
  stationId: StationId | null
  npcId: NpcId | null
  visited: boolean
  roomTargetLabel?: string | null
  activityId?: LabActivityId | null
  activityLabel?: string | null
}

export function InteractionPrompt({
  hasMoved,
  stationId,
  npcId,
  visited,
  roomTargetLabel = null,
  activityId = null,
  activityLabel = null,
}: InteractionPromptProps) {
  return (
    <div className="interaction-prompt" aria-live="polite">
      {activityId && activityLabel ? (
        <>
          <kbd>E</kbd>
          <span>{activityLabel}</span>
        </>
      ) : roomTargetLabel ? (
        <>
          <kbd>E</kbd>
          <span>{roomTargetLabel}</span>
        </>
      ) : npcId ? (
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
