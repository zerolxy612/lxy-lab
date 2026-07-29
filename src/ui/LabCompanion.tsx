import { useState } from 'react'
import { companionPrompts } from '../content/companion'
import type { StationId } from '../content/stations'

interface LabCompanionProps {
  onNavigate: (stationId: StationId) => void
}

export function LabCompanion({ onNavigate }: LabCompanionProps) {
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const selectedPrompt = companionPrompts.find(({ id }) => id === selectedPromptId)

  return (
    <section className="companion-console" aria-labelledby="companion-query-title">
      <div className="section-heading">
        <span>01</span>
        <h3 id="companion-query-title">Choose a signal</h3>
      </div>

      <div className="companion-questions" role="group" aria-label="Questions for the Lab Companion">
        {companionPrompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            aria-pressed={selectedPromptId === prompt.id}
            onClick={() => setSelectedPromptId(prompt.id)}
          >
            <span>{prompt.index}</span>
            <strong>{prompt.question}</strong>
            <i aria-hidden="true">{selectedPromptId === prompt.id ? '◆' : '◇'}</i>
          </button>
        ))}
      </div>

      <div className="companion-answer" aria-live="polite">
        {selectedPrompt ? (
          <>
            <span>Companion reply</span>
            <p>{selectedPrompt.answer}</p>
            <button type="button" onClick={() => onNavigate(selectedPrompt.route.stationId)}>
              {selectedPrompt.route.label}
              <i aria-hidden="true">→</i>
            </button>
          </>
        ) : (
          <p>Select one question. The Companion will point to a real part of the lab.</p>
        )}
      </div>
    </section>
  )
}
