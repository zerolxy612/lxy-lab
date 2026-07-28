import { useEffect, useRef, useState } from 'react'

export function GameViewport() {
  const gameRoot = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!gameRoot.current) return

    const parent = gameRoot.current
    let cancelled = false
    let destroyGame: () => void = () => undefined

    void import('../game/createGame').then(({ createLabGame }) => {
      if (cancelled) return

      const game = createLabGame(parent)
      setReady(true)
      destroyGame = () => game.destroy(true)
    })

    return () => {
      cancelled = true
      destroyGame()
    }
  }, [])

  return (
    <div className="game-stage" data-ready={ready}>
      {!ready && <span className="game-loading">Initialising Lab-01</span>}
      <div
        className="game-viewport"
        ref={gameRoot}
        role="application"
        aria-label="Interactive AI laboratory. Move with WASD or arrow keys and press E to interact."
      />
    </div>
  )
}
