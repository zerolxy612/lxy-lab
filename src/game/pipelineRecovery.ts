export type PipelineLane = 'evidence' | 'tool' | 'response' | 'quarantine'

export interface PipelinePacket {
  id: string
  code: 'DOC' | 'TOOL' | 'TXT' | 'ERR'
  label: string
  detail: string
  lane: PipelineLane
}

export interface PipelineRunState {
  score: number
  stability: number
  streak: number
  correct: number
  routed: number
}

export interface PipelineRouteResult {
  state: PipelineRunState
  correct: boolean
  delta: number
}

export interface PipelineRecord {
  score: number
  accuracy: number
  stability: number
}

export const pipelineRecordKey = 'xiangyu-lab:pipeline-recovery-v1'

export const pipelinePacketPool: readonly PipelinePacket[] = [
  { id: 'judgment-hit', code: 'DOC', label: 'Judgment passage', detail: 'retrieval hit / source intact', lane: 'evidence' },
  { id: 'statute-hit', code: 'DOC', label: 'Statute excerpt', detail: 'authority / section matched', lane: 'evidence' },
  { id: 'citation-source', code: 'DOC', label: 'Citation source', detail: 'document anchor verified', lane: 'evidence' },
  { id: 'search-result', code: 'TOOL', label: 'Search complete', detail: 'tool result / 18 records', lane: 'tool' },
  { id: 'rerank-result', code: 'TOOL', label: 'Rerank result', detail: 'tool result / top evidence', lane: 'tool' },
  { id: 'graph-result', code: 'TOOL', label: 'Graph traversal', detail: 'tool result / relation path', lane: 'tool' },
  { id: 'answer-delta', code: 'TXT', label: 'Answer delta', detail: 'stream chunk / sequence valid', lane: 'response' },
  { id: 'citation-marker', code: 'TXT', label: 'Citation marker', detail: 'response field / source linked', lane: 'response' },
  { id: 'structured-field', code: 'TXT', label: 'Structured field', detail: 'response payload / schema valid', lane: 'response' },
  { id: 'orphan-citation', code: 'ERR', label: 'Orphan citation', detail: 'no matching source anchor', lane: 'quarantine' },
  { id: 'stale-result', code: 'ERR', label: 'Stale result', detail: 'request version mismatch', lane: 'quarantine' },
  { id: 'empty-payload', code: 'ERR', label: 'Empty payload', detail: 'partial event / body missing', lane: 'quarantine' },
]

export const initialPipelineRun: PipelineRunState = {
  score: 0,
  stability: 72,
  streak: 0,
  correct: 0,
  routed: 0,
}

export function createPipelineDeck(random: () => number = Math.random) {
  return [...pipelinePacketPool]
    .map((packet) => ({ packet, order: random() }))
    .sort((left, right) => left.order - right.order)
    .map(({ packet }) => packet)
}

export function routePipelinePacket(
  state: PipelineRunState,
  packet: PipelinePacket,
  lane: PipelineLane,
): PipelineRouteResult {
  const correct = packet.lane === lane
  const nextStreak = correct ? state.streak + 1 : 0
  const delta = correct ? 100 + Math.min(nextStreak - 1, 5) * 15 : -35

  return {
    correct,
    delta,
    state: {
      score: Math.max(0, state.score + delta),
      stability: correct
        ? Math.min(100, state.stability + 2)
        : Math.max(0, state.stability - 14),
      streak: nextStreak,
      correct: state.correct + (correct ? 1 : 0),
      routed: state.routed + 1,
    },
  }
}

export function getPipelineAccuracy(state: PipelineRunState) {
  return state.routed === 0 ? 0 : Math.round((state.correct / state.routed) * 100)
}

export function readPipelineRecord(storage: Storage | null): PipelineRecord | null {
  if (!storage) return null
  try {
    const parsed = JSON.parse(storage.getItem(pipelineRecordKey) ?? 'null') as Partial<PipelineRecord> | null
    if (
      !parsed
      || typeof parsed.score !== 'number'
      || typeof parsed.accuracy !== 'number'
      || typeof parsed.stability !== 'number'
    ) return null
    return {
      score: parsed.score,
      accuracy: parsed.accuracy,
      stability: parsed.stability,
    }
  } catch {
    return null
  }
}

export function savePipelineRecord(storage: Storage | null, record: PipelineRecord) {
  const current = readPipelineRecord(storage)
  const next = !current || record.score > current.score ? record : current
  if (storage) {
    try {
      storage.setItem(pipelineRecordKey, JSON.stringify(next))
    } catch {
      // A local best is optional; the drill remains fully playable without storage.
    }
  }
  return next
}
