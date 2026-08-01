import { describe, expect, it } from 'vitest'
import { companionPrompts } from './companion'
import { contactLinks } from './contact'
import { selectedProjects } from './projects'
import { npcs } from './npcs'

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
    expect(selectedProjects.every(({ decisions }) => decisions.length === 3)).toBe(true)
    expect(selectedProjects.every(({ ownership, challenge, outcome }) => (
      ownership.length > 0 && challenge.length > 0 && outcome.length > 0
    ))).toBe(true)
  })

  it('states the public boundary for every project field note', () => {
    expect(selectedProjects.every(({ publicBoundary }) => publicBoundary.length > 0)).toBe(true)
    expect(selectedProjects.find(({ id }) => id === 'government-legal-ai')?.publicBoundary).toContain(
      'Project name, client identity, data, documents, and internal interfaces are not public.',
    )
  })

  it('routes each Companion question to a distinct real station', () => {
    expect(companionPrompts).toHaveLength(3)
    expect(new Set(companionPrompts.map(({ route }) => route.stationId)).size).toBe(3)
    expect(companionPrompts.every(({ route }) => route.stationId !== 'assistant')).toBe(true)
  })

  it('publishes only the confirmed direct contact channels', () => {
    expect(contactLinks).toEqual([
      expect.objectContaining({
        id: 'email',
        href: 'mailto:zerolxy612@gmail.com',
      }),
      expect.objectContaining({
        id: 'github',
        href: 'https://github.com/zerolxy612',
      }),
    ])
  })

  it('ships only ROOK and MIRA with authored, public-safe dialogue', () => {
    expect(npcs.map(({ id }) => id)).toEqual(['rook', 'mira'])
    expect(npcs.every(({ prompts }) => prompts.length === 3)).toBe(true)
    const dialogue = npcs.flatMap(({ prompts }) => prompts.map(({ answer }) => answer)).join(' ')
    expect(dialogue).not.toMatch(/NULL-03|client name|internal URL/i)
  })
})
