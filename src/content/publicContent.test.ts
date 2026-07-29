import { describe, expect, it } from 'vitest'
import { companionPrompts } from './companion'
import { selectedProjects } from './projects'

describe('public portfolio content', () => {
  it('keeps Selected Work focused on approved anonymous project identities', () => {
    expect(selectedProjects.map(({ id }) => id)).toEqual([
      'ton-web3-game',
      'government-legal-ai',
    ])
    expect(selectedProjects.map(({ name }) => name)).toEqual([
      'TON Ecosystem Web3 Game',
      'Government-facing Legal AI',
    ])
  })

  it('routes each Companion question to a distinct real station', () => {
    expect(companionPrompts).toHaveLength(3)
    expect(new Set(companionPrompts.map(({ route }) => route.stationId)).size).toBe(3)
    expect(companionPrompts.every(({ route }) => route.stationId !== 'assistant')).toBe(true)
  })
})
