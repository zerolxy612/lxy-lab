import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import type { NpcId, NpcPrompt } from '../content/npcs'
import { npcById, selectNpcOpening } from '../content/npcs'
import type { StationId } from '../content/stations'
import type { NpcDialogueAnchor } from '../game/bridge'
import { useNpcScreenAnchor } from './dialogueAnchor'
import { restoreFocus } from './focusReturn'

interface NpcDialogueProps {
  npcId: NpcId | null
  anchor: NpcDialogueAnchor | null
  talkCount: number
  visitedStations: ReadonlySet<StationId>
  returnFocusRef: RefObject<HTMLElement | null>
  onClose: () => void
  onNavigate: (stationId: StationId) => void
}

interface ActiveNpcDialogueProps extends Omit<NpcDialogueProps, 'npcId'> {
  npcId: NpcId
}

type DialoguePhase = 'opening' | 'choices' | 'response'

type DialogueStyle = CSSProperties & {
  '--dialogue-accent': string
  '--npc-screen-x': string
  '--npc-screen-y': string
  '--game-frame-bottom': string
}

export function NpcDialogue(props: NpcDialogueProps) {
  if (!props.npcId) return null
  return (
    <ActiveNpcDialogue
      key={`${props.npcId}-${props.talkCount}`}
      {...props}
      npcId={props.npcId}
    />
  )
}

function ActiveNpcDialogue({
  npcId,
  anchor,
  talkCount,
  visitedStations,
  returnFocusRef,
  onClose,
  onNavigate,
}: ActiveNpcDialogueProps) {
  const layer = useRef<HTMLElement>(null)
  const advanceButton = useRef<HTMLButtonElement>(null)
  const firstChoice = useRef<HTMLButtonElement>(null)
  const [phase, setPhase] = useState<DialoguePhase>('opening')
  const [lineIndex, setLineIndex] = useState(0)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const npc = npcById[npcId]
  const openingLines = useMemo(
    () => selectNpcOpening(npcId, talkCount, visitedStations),
    [npcId, talkCount, visitedStations],
  )
  const selectedPrompt = npc.prompts.find(({ id }) => id === selectedPromptId) ?? null
  const currentLines = phase === 'opening'
    ? openingLines
    : phase === 'response' && selectedPrompt
      ? selectedPrompt.lines
      : [npc.choicePrompt]
  const currentLine = currentLines[Math.min(lineIndex, currentLines.length - 1)]
  const lastLine = lineIndex >= currentLines.length - 1
  const screenAnchor = useNpcScreenAnchor(anchor)
  const style: DialogueStyle = {
    '--dialogue-accent': npc.accent,
    '--npc-screen-x': `${screenAnchor.x}px`,
    '--npc-screen-y': `${screenAnchor.y}px`,
    '--game-frame-bottom': `${screenAnchor.frameBottom}px`,
  }

  const choosePrompt = useCallback((prompt: NpcPrompt) => {
    setSelectedPromptId(prompt.id)
    setLineIndex(0)
    setPhase('response')
  }, [])

  const advance = useCallback(() => {
    if (phase === 'choices') return
    if (!lastLine) {
      setLineIndex((current) => current + 1)
      return
    }
    setSelectedPromptId(null)
    setLineIndex(0)
    setPhase('choices')
  }, [lastLine, phase])

  useEffect(() => {
    if (phase === 'choices') firstChoice.current?.focus()
    else advanceButton.current?.focus()
  }, [lineIndex, phase])

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const fallbackFocus = returnFocusRef.current

    return () => restoreFocus(previousFocus, fallbackFocus)
  }, [returnFocusRef])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      const shortcutIndex = Number(event.key) - 1
      if (phase === 'choices' && shortcutIndex >= 0 && shortcutIndex < npc.prompts.length) {
        event.preventDefault()
        choosePrompt(npc.prompts[shortcutIndex])
        return
      }

      if (event.key !== 'Tab') return
      const focusable = layer.current?.querySelectorAll<HTMLElement>(
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
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [choosePrompt, npc.prompts, onClose, phase])

  const progressLabel = phase === 'opening'
    ? `ENTRY ${String(lineIndex + 1).padStart(2, '0')} / ${String(openingLines.length).padStart(2, '0')}`
    : phase === 'response' && selectedPrompt
      ? `${selectedPrompt.index} ${String(lineIndex + 1).padStart(2, '0')} / ${String(selectedPrompt.lines.length).padStart(2, '0')}`
      : 'REPLY SELECT'
  const advanceLabel = phase === 'opening' && lastLine
    ? 'Choose a reply'
    : phase === 'response' && lastLine
      ? 'Back to replies'
      : 'Continue'

  return (
    <aside
      ref={layer}
      className="npc-dialogue-layer"
      data-npc={npc.id}
      data-phase={phase}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-labelledby="npc-dialogue-title"
    >
      <div className="npc-dialogue-target" aria-hidden="true"><i /></div>

      <section className="npc-game-dialogue">
        <div className="npc-dialogue-portrait" aria-hidden="true">
          <span>{npc.id === 'rook' ? 'UNIT 07' : 'ARCHIVE 02'}</span>
          <i className="npc-dialogue-sprite" />
          <b>{npc.id === 'rook' ? 'MAINT' : 'KEEPER'}</b>
        </div>

        <div className="npc-dialogue-body">
          <header>
            <div>
              <span>{npc.role}</span>
              <h2 id="npc-dialogue-title">{npc.name}</h2>
            </div>
            <button type="button" className="npc-dialogue-close" onClick={onClose}>
              Close <kbd>Esc</kbd>
            </button>
          </header>

          <div
            key={`${phase}-${selectedPromptId ?? 'entry'}-${lineIndex}`}
            className="npc-dialogue-line"
            aria-live="polite"
          >
            <span>{progressLabel}</span>
            <p>{currentLine}</p>
          </div>

          {phase === 'choices' ? (
            <div className="npc-dialogue-choices" role="group" aria-label={`Replies to ${npc.name}`}>
              {npc.prompts.map((prompt, index) => (
                <button
                  ref={index === 0 ? firstChoice : undefined}
                  key={prompt.id}
                  type="button"
                  onClick={() => choosePrompt(prompt)}
                >
                  <span>{index + 1}</span>
                  <strong>{prompt.question}</strong>
                  <i aria-hidden="true">›</i>
                </button>
              ))}
            </div>
          ) : (
            <footer className="npc-dialogue-actions">
              {phase === 'response' && lastLine && selectedPrompt?.route ? (
                <button
                  type="button"
                  className="npc-dialogue-route"
                  onClick={() => onNavigate(selectedPrompt.route!.stationId)}
                >
                  {selectedPrompt.route.label}<i aria-hidden="true">→</i>
                </button>
              ) : <span>{npc.status}</span>}
              <button
                ref={advanceButton}
                type="button"
                className="npc-dialogue-advance"
                onClick={advance}
              >
                {advanceLabel}<kbd>Enter</kbd><i aria-hidden="true">▼</i>
              </button>
            </footer>
          )}
        </div>
      </section>
    </aside>
  )
}
