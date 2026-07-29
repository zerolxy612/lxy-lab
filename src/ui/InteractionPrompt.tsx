import type { StationId } from '../content/stations'
import { stationById } from '../content/stations'

interface InteractionPromptProps {
  hasMoved: boolean
  stationId: StationId | null
  visited: boolean
}

export function InteractionPrompt({ hasMoved, stationId, visited }: InteractionPromptProps) {
  return (
    <div className="interaction-prompt" aria-live="polite">
      {stationId ? (
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
