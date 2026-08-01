import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import type { NpcId } from '../content/npcs'
import { npcById } from '../content/npcs'
import type { StationId } from '../content/stations'
import { restoreFocus } from './focusReturn'

interface NpcDialogueProps {
  npcId: NpcId | null
  returnFocusRef: RefObject<HTMLElement | null>
  onClose: () => void
  onNavigate: (stationId: StationId) => void
}

export function NpcDialogue({ npcId, returnFocusRef, onClose, onNavigate }: NpcDialogueProps) {
  const panel = useRef<HTMLElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)

  useEffect(() => {
    if (!npcId) return
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const fallbackFocus = returnFocusRef.current
    closeButton.current?.focus()
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
      restoreFocus(previousFocus, fallbackFocus)
    }
  }, [npcId, onClose, returnFocusRef])

  if (!npcId) return null
  const npc = npcById[npcId]
  const selectedPrompt = npc.prompts.find(({ id }) => id === selectedPromptId)

  return (
    <aside
      ref={panel}
      className="station-panel npc-dialogue"
      data-npc={npc.id}
      style={{ '--station-accent': npc.accent } as CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-labelledby="npc-dialogue-title"
    >
      <span className="panel-location" aria-hidden="true">LOCAL CHARACTER CHANNEL</span>
      <header>
        <div>
          <span>{npc.role}</span>
          <h2 id="npc-dialogue-title">{npc.name}</h2>
        </div>
        <button ref={closeButton} className="panel-close" onClick={onClose} aria-label="Close dialogue">
          Close
        </button>
      </header>

      <div className="npc-status">
        <i aria-hidden="true" />
        <span>{npc.status}</span>
      </div>
      <p className="panel-summary">{npc.summary}</p>

      <section className="companion-console" aria-labelledby="npc-query-title">
        <div className="section-heading">
          <span>CH</span>
          <h3 id="npc-query-title">Choose a question</h3>
        </div>
        <div className="companion-questions" role="group" aria-label={`Questions for ${npc.name}`}>
          {npc.prompts.map((prompt) => (
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
              <span>{npc.name} reply</span>
              <p>{selectedPrompt.answer}</p>
              <button type="button" onClick={() => onNavigate(selectedPrompt.route.stationId)}>
                {selectedPrompt.route.label}<i aria-hidden="true">→</i>
              </button>
            </>
          ) : (
            <p>Select a question to open this character’s authored dialogue.</p>
          )}
        </div>
      </section>
    </aside>
  )
}
