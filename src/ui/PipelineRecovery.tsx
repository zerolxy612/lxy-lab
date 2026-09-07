import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  createPipelineDeck,
  getPipelineAccuracy,
  initialPipelineRun,
  readPipelineRecord,
  routePipelinePacket,
  savePipelineRecord,
  type PipelineLane,
  type PipelineRecord,
  type PipelineRunState,
} from '../game/pipelineRecovery'
import { restoreFocus } from './focusReturn'

type DrillPhase = 'briefing' | 'running' | 'complete'

const runDuration = 45

const lanes: readonly {
  id: PipelineLane
  key: string
  code: string
  label: string
  description: string
}[] = [
  { id: 'evidence', key: '1', code: 'DOC', label: 'Evidence', description: 'Source material' },
  { id: 'tool', key: '2', code: 'TOOL', label: 'Tool bus', description: 'Machine results' },
  { id: 'response', key: '3', code: 'TXT', label: 'Response', description: 'User-facing output' },
  { id: 'quarantine', key: '4', code: 'ERR', label: 'Quarantine', description: 'Broken events' },
]

interface PipelineRecoveryProps {
  onClose: () => void
}

function getLocalStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function PipelineRecovery({ onClose }: PipelineRecoveryProps) {
  const panel = useRef<HTMLElement>(null)
  const startButton = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const [phase, setPhase] = useState<DrillPhase>('briefing')
  const [deck, setDeck] = useState(() => createPipelineDeck())
  const [packetIndex, setPacketIndex] = useState(0)
  const [run, setRun] = useState<PipelineRunState>(initialPipelineRun)
  const [timeLeft, setTimeLeft] = useState(runDuration)
  const [feedback, setFeedback] = useState('Awaiting first packet')
  const [record, setRecord] = useState<PipelineRecord | null>(() => (
    readPipelineRecord(getLocalStorage())
  ))
  const [newRecord, setNewRecord] = useState(false)
  const packet = deck[packetIndex]
  const accuracy = getPipelineAccuracy(run)
  const progressStyle = useMemo(() => ({
    '--pipeline-time': Math.max(0, timeLeft / runDuration),
  }) as CSSProperties, [timeLeft])

  const startRun = useCallback(() => {
    setDeck(createPipelineDeck())
    setPacketIndex(0)
    setRun(initialPipelineRun)
    setTimeLeft(runDuration)
    setFeedback('Route by signal type, not by colour')
    setNewRecord(false)
    setPhase('running')
  }, [])

  const finishRun = useCallback((finalRun: PipelineRunState) => {
    const finalAccuracy = getPipelineAccuracy(finalRun)
    const storage = getLocalStorage()
    const previous = readPipelineRecord(storage)
    setNewRecord(!previous || finalRun.score > previous.score)
    setRecord(savePipelineRecord(storage, {
      score: finalRun.score,
      accuracy: finalAccuracy,
      stability: finalRun.stability,
    }))
    setPhase('complete')
  }, [])

  const routePacket = useCallback((lane: PipelineLane) => {
    if (phase !== 'running' || !packet) return
    const result = routePipelinePacket(run, packet, lane)
    setRun(result.state)
    setFeedback(result.correct
      ? `Accepted · +${result.delta} integrity`
      : `Misroute · expected ${packet.lane}`)
    if (packetIndex >= deck.length - 1) finishRun(result.state)
    else setPacketIndex((current) => current + 1)
  }, [deck.length, finishRun, packet, packetIndex, phase, run])

  useEffect(() => {
    previousFocus.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    startButton.current?.focus()

    return () => {
      const fallback = document.querySelector<HTMLElement>('.game-viewport')
      restoreFocus(previousFocus.current, fallback)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'running') return
    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0)
        finishRun(run)
      } else {
        setTimeLeft(timeLeft - 1)
      }
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [finishRun, phase, run, timeLeft])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (phase === 'briefing' && event.key === 'Enter') {
        event.preventDefault()
        startRun()
        return
      }
      if (phase === 'running') {
        const lane = lanes.find(({ key }) => key === event.key)?.id
        if (lane) {
          event.preventDefault()
          routePacket(lane)
        }
      }
      if (event.key !== 'Tab') return
      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, phase, routePacket, startRun])

  return (
    <div className="pipeline-recovery-layer">
      <section
        ref={panel}
        className="pipeline-recovery"
        data-phase={phase}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pipeline-recovery-title"
      >
        <header className="pipeline-recovery__header">
          <div>
            <span>LAB-01 / MAINTENANCE ACCESS</span>
            <h2 id="pipeline-recovery-title">Pipeline Recovery</h2>
          </div>
          <button type="button" className="pipeline-recovery__close" onClick={onClose}>
            Exit <kbd>Esc</kbd>
          </button>
        </header>

        {phase === 'briefing' && (
          <div className="pipeline-briefing">
            <div className="pipeline-briefing__diagram" aria-hidden="true">
              <span>IN</span><i /><i /><i /><i /><b>CORE</b>
            </div>
            <div className="pipeline-briefing__copy">
              <span>RECOVERY DRILL / 45 SEC</span>
              <h3>The event stream has lost its routing table.</h3>
              <p>Send each packet to the matching port. Labels and shapes carry the signal; colour is only a secondary cue.</p>
              <ul>
                <li><b>DOC</b> source material</li>
                <li><b>TOOL</b> machine results</li>
                <li><b>TXT</b> response output</li>
                <li><b>ERR</b> quarantine</li>
              </ul>
              {record && (
                <p className="pipeline-record">Local record <strong>{record.score}</strong> · {record.accuracy}% clean</p>
              )}
              <button ref={startButton} type="button" className="pipeline-recovery__start" onClick={startRun}>
                Begin recovery <i aria-hidden="true">→</i>
              </button>
            </div>
          </div>
        )}

        {phase === 'running' && packet && (
          <div className="pipeline-run">
            <div className="pipeline-run__status">
              <div><span>Integrity</span><strong>{run.score.toString().padStart(4, '0')}</strong></div>
              <div><span>Stability</span><strong>{run.stability}%</strong></div>
              <div><span>Chain</span><strong>×{run.streak}</strong></div>
              <div><span>Packets</span><strong>{run.routed}/{deck.length}</strong></div>
            </div>

            <div className="pipeline-clock" style={progressStyle}>
              <i aria-hidden="true" />
              <span>{timeLeft}s</span>
            </div>

            <div className="pipeline-belt">
              <span>INCOMING EVENT / {String(packetIndex + 1).padStart(2, '0')}</span>
              <article key={packet.id} data-code={packet.code}>
                <b>{packet.code}</b>
                <div><strong>{packet.label}</strong><small>{packet.detail}</small></div>
              </article>
              <p aria-live="polite">{feedback}</p>
            </div>

            <div className="pipeline-ports" role="group" aria-label="Routing ports">
              {lanes.map((lane) => (
                <button key={lane.id} type="button" data-lane={lane.id} onClick={() => routePacket(lane.id)}>
                  <kbd>{lane.key}</kbd>
                  <span><b>{lane.code}</b><strong>{lane.label}</strong><small>{lane.description}</small></span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'complete' && (
          <div className="pipeline-result">
            <div className="pipeline-result__stamp" data-stable={run.stability >= 60}>
              <span>{run.stability >= 60 ? 'PIPELINE STABLE' : 'RECOVERY PARTIAL'}</span>
              <strong>{run.score}</strong>
              <small>integrity points</small>
            </div>
            <div className="pipeline-result__report">
              <span>MAINTENANCE REPORT</span>
              <h3>{newRecord ? 'New local record filed.' : 'Recovery sequence closed.'}</h3>
              <dl>
                <div><dt>Packets routed</dt><dd>{run.routed}/{deck.length}</dd></div>
                <div><dt>Clean routes</dt><dd>{accuracy}%</dd></div>
                <div><dt>Final stability</dt><dd>{run.stability}%</dd></div>
                <div><dt>Best local score</dt><dd>{record?.score ?? run.score}</dd></div>
              </dl>
              <blockquote>“The dramatic failures are easy. It is the polite little failures that live longest.” <cite>— ROOK</cite></blockquote>
              <div className="pipeline-result__actions">
                <button type="button" onClick={startRun}>Run again</button>
                <button type="button" onClick={onClose}>Return to lab</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
