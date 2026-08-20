import { describe, expect, it } from 'vitest'
import { blogPosts, featuredBlogPost, getBlogSlug, parseBlogSource } from './blog'

describe('public blog content', () => {
  it('ships three complete public notes with stable unique records', () => {
    expect(blogPosts).toHaveLength(3)
    expect(new Set(blogPosts.map(({ slug }) => slug)).size).toBe(3)
    expect(new Set(blogPosts.map(({ index }) => index)).size).toBe(3)
    expect(blogPosts.every(({ sections }) => sections.length >= 3)).toBe(true)
    expect(blogPosts.every(({ body }) => body.length > 0)).toBe(true)
    expect(blogPosts.every(({ catalogSignal }) => catalogSignal.length <= 64)).toBe(true)
    expect(new Set(blogPosts.map(({ category }) => category)).size).toBe(3)
  })

  it('defines one stable featured record for the Library reading table', () => {
    expect(blogPosts.filter(({ featured }) => featured)).toHaveLength(1)
    expect(featuredBlogPost.index).toBe('LOG-003')
    expect(featuredBlogPost.slug).toBe('the-elevator-is-part-of-the-portfolio')
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
    const article = npcPost?.body ?? ''

    expect(article).toMatch(/ROOK and MIRA/)
    expect(article).toMatch(/Say nothing/)
    expect(article).not.toMatch(/client name|internal URL|system prompt|api key/i)
  })

  it('grounds the elevator article in the shipped entrance choices', () => {
    const elevatorPost = blogPosts.find(({ slug }) => slug === 'the-elevator-is-part-of-the-portfolio')
    const article = elevatorPost?.body ?? ''

    expect(article).toMatch(/same small character/)
    expect(article).toMatch(/browser session/)
    expect(article).toMatch(/Enter confirms the ride, Escape skips it/)
  })

  it('parses repository Markdown into the public article contract', () => {
    const post = parseBlogSource('test-note', `---
index: "LOG-099"
title: "Test note"
summary: "A safe fixture."
category: "Field Notes"
published: "2026-08-20"
readingTime: "2 min"
catalogSignal: "A small verified decision."
featured: false
draft: true
---

## First section

Markdown body.`)

    expect(post.slug).toBe('test-note')
    expect(post.draft).toBe(true)
    expect(post.sections).toEqual([{ heading: 'First section' }])
  })

  it('rejects malformed Markdown before it reaches the Library', () => {
    expect(() => parseBlogSource('broken', '# Missing frontmatter')).toThrow(/frontmatter/i)
    expect(() => parseBlogSource('broken', `---
index: "LOG-099"
title: "Broken"
summary: "No section."
category: "Field Notes"
published: "2026-08-20"
readingTime: "2 min"
catalogSignal: "Missing structure."
featured: false
draft: true
---

Body without a level-two heading.`)).toThrow(/level-two heading/i)
  })
})
