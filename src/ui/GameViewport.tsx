import { useEffect, useRef, useState } from 'react'
import { labBridge } from '../game/bridge'

const gameStartTimeoutMs = 20_000

export function GameViewport() {
  const gameRoot = useRef<HTMLDivElement>(null)
  const retryButton = useRef<HTMLButtonElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!gameRoot.current) return

    const parent = gameRoot.current
    let cancelled = false
    let failed = false
    let activeGame: { destroy: (removeCanvas: boolean) => void } | null = null
    setReady(false)
    setError(null)

    const destroyGame = () => {
      if (!activeGame) return
      activeGame.destroy(true)
      activeGame = null
    }
    const fail = (message: string) => {
      if (cancelled || failed) return
      failed = true
      window.clearTimeout(startTimeout)
      destroyGame()
      setReady(false)
      setError(message)
    }
    const removeReadyListener = labBridge.on('game:ready', () => {
      if (cancelled || failed) return
      window.clearTimeout(startTimeout)
      setReady(true)
    })
    const removeErrorListener = labBridge.on('game:error', ({ message }) => fail(message))
    const startTimeout = window.setTimeout(() => {
      fail('The interactive room took too long to start.')
    }, gameStartTimeoutMs)

    void import('../game/createGame')
      .then(({ createLabGame }) => {
        if (cancelled || failed) return

        const game = createLabGame(parent)
        if (cancelled || failed) {
          game.destroy(true)
          return
        }
        activeGame = game
      })
      .catch(() => fail('The interactive room could not start.'))

    return () => {
      cancelled = true
      window.clearTimeout(startTimeout)
      removeReadyListener()
      removeErrorListener()
      destroyGame()
    }
  }, [attempt])

  useEffect(() => {
    if (error) retryButton.current?.focus()
  }, [error])

  const retry = () => setAttempt((current) => current + 1)

  return (
    <div className="game-stage" data-state={error ? 'error' : ready ? 'ready' : 'loading'}>
      {!ready && !error && (
        <span className="game-loading" role="status">Initialising Lab-01</span>
      )}
      {error && (
        <div className="game-error" role="alert">
          <span>Lab-01 offline</span>
          <strong>Interactive room unavailable.</strong>
          <p>{error} The Archive Index still contains the complete public record.</p>
          <button ref={retryButton} type="button" onClick={retry}>Retry room</button>
        </div>
      )}
      <div
        className="game-viewport"
        ref={gameRoot}
        role="application"
        tabIndex={error ? -1 : 0}
        aria-hidden={error ? true : undefined}
        aria-busy={!ready && !error}
        aria-label="Interactive AI laboratory. Move with WASD or arrow keys and press E or Space to interact."
        onPointerDown={() => gameRoot.current?.focus()}
      />
    </div>
  )
}
