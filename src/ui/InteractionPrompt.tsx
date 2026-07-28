import type { StationId } from '../content/stations'
import { stationById } from '../content/stations'

interface InteractionPromptProps {
  stationId: StationId | null
}

export function InteractionPrompt({ stationId }: InteractionPromptProps) {
  return (
    <div className="interaction-prompt" aria-live="polite">
      {stationId ? (
        <>
          <kbd>E</kbd>
          <span>Explore {stationById[stationId].title}</span>
        </>
      ) : (
        <span>WASD / Arrow keys to move</span>
      )}
    </div>
  )
}
