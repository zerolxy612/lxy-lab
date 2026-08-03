import { useLayoutEffect, useState } from 'react'
import type { NpcDialogueAnchor } from '../game/bridge'
import { LAB_HEIGHT, LAB_WIDTH } from '../game/dimensions'

interface DialogueFrameRect {
  left: number
  top: number
  width: number
  height: number
}

export function toNpcScreenAnchor(
  anchor: NpcDialogueAnchor | null,
  frame: DialogueFrameRect,
) {
  const safeAnchor = anchor ?? { x: LAB_WIDTH / 2, y: LAB_HEIGHT / 2 }
  return {
    x: frame.left + Math.min(1, Math.max(0, safeAnchor.x / LAB_WIDTH)) * frame.width,
    y: frame.top + Math.min(1, Math.max(0, safeAnchor.y / LAB_HEIGHT)) * frame.height,
  }
}

export function useNpcScreenAnchor(anchor: NpcDialogueAnchor | null) {
  const [screenAnchor, setScreenAnchor] = useState(() => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    frameBottom: 0,
  }))

  useLayoutEffect(() => {
    const gameFrame = document.querySelector<HTMLElement>('.game-frame')
    if (!gameFrame) return
    const updateAnchor = () => {
      const frame = gameFrame.getBoundingClientRect()
      setScreenAnchor({
        ...toNpcScreenAnchor(anchor, frame),
        frameBottom: Math.max(0, window.innerHeight - frame.bottom),
      })
    }
    updateAnchor()
    const observer = new ResizeObserver(updateAnchor)
    observer.observe(gameFrame)
    window.addEventListener('resize', updateAnchor)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateAnchor)
    }
  }, [anchor])

  return screenAnchor
}
