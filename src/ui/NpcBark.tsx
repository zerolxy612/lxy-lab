import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { NpcId } from '../content/npcs'
import { npcById } from '../content/npcs'
import type { NpcDialogueAnchor } from '../game/bridge'
import { useNpcScreenAnchor } from './dialogueAnchor'

export interface ActiveNpcBark {
  id: number
  npcId: NpcId
  anchor: NpcDialogueAnchor
  line: string
}

interface NpcBarkProps {
  bark: ActiveNpcBark
}

type BarkStyle = CSSProperties & {
  '--dialogue-accent': string
  '--npc-screen-x': string
  '--npc-screen-y': string
}

export function NpcBark({ bark }: NpcBarkProps) {
  const [state, setState] = useState<'visible' | 'leaving'>('visible')
  const npc = npcById[bark.npcId]
  const screenAnchor = useNpcScreenAnchor(bark.anchor)
  const style: BarkStyle = {
    '--dialogue-accent': npc.accent,
    '--npc-screen-x': `${screenAnchor.x}px`,
    '--npc-screen-y': `${screenAnchor.y}px`,
  }

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setState('leaving'), 2700)
    return () => window.clearTimeout(leaveTimer)
  }, [])

  return (
    <aside
      className="npc-bark"
      data-npc={npc.id}
      data-state={state}
      style={style}
      aria-live="polite"
    >
      <span>{npc.name}</span>
      <p>{bark.line}</p>
    </aside>
  )
}
