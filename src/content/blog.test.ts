import { describe, expect, it } from 'vitest'
import { blogPosts, getBlogSlug } from './blog'

describe('public blog content', () => {
  it('ships three complete public notes with stable unique records', () => {
    expect(blogPosts).toHaveLength(3)
    expect(new Set(blogPosts.map(({ slug }) => slug)).size).toBe(3)
    expect(new Set(blogPosts.map(({ index }) => index)).size).toBe(3)
    expect(blogPosts.every(({ sections }) => sections.length >= 3)).toBe(true)
    expect(blogPosts.flatMap(({ sections }) => sections)
      .every(({ paragraphs }) => paragraphs.length > 0)).toBe(true)
  })

  it('resolves stable article paths without accepting nested guesses', () => {
    expect(getBlogSlug('/blog/why-this-lab-uses-two-runtimes')).toBe('why-this-lab-uses-two-runtimes')
    expect(getBlogSlug('/blog/why-this-lab-uses-two-runtimes/')).toBe('why-this-lab-uses-two-runtimes')
    expect(getBlogSlug('/blog/designing-npc-dialogue-without-an-llm')).toBe('designing-npc-dialogue-without-an-llm')
    expect(getBlogSlug('/blog/the-elevator-is-part-of-the-portfolio')).toBe('the-elevator-is-part-of-the-portfolio')
    expect(getBlogSlug('/blog')).toBeNull()
    expect(getBlogSlug('/blog/a/extra')).toBeNull()
  })

  it('keeps the NPC article public-safe and grounded in the shipped interaction', () => {
    const npcPost = blogPosts.find(({ slug }) => slug === 'designing-npc-dialogue-without-an-llm')
    const article = npcPost?.sections.flatMap(({ paragraphs }) => paragraphs).join(' ') ?? ''

    expect(article).toMatch(/ROOK and MIRA/)
    expect(article).toMatch(/Say nothing/)
    expect(article).not.toMatch(/client name|internal URL|system prompt|api key/i)
  })

  it('grounds the elevator article in the shipped entrance choices', () => {
    const elevatorPost = blogPosts.find(({ slug }) => slug === 'the-elevator-is-part-of-the-portfolio')
    const article = elevatorPost?.sections.flatMap(({ paragraphs }) => paragraphs).join(' ') ?? ''

    expect(article).toMatch(/same small character/)
    expect(article).toMatch(/browser session/)
    expect(article).toMatch(/Enter confirms the ride, Escape skips it/)
  })
})
