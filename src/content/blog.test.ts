import { describe, expect, it } from 'vitest'
import { blogPosts, getBlogSlug } from './blog'

describe('public blog content', () => {
  it('ships the library prototype with one complete public note', () => {
    expect(blogPosts).toHaveLength(1)
    expect(blogPosts[0].sections).toHaveLength(3)
    expect(blogPosts[0].sections.every(({ paragraphs }) => paragraphs.length > 0)).toBe(true)
  })

  it('resolves stable article paths without accepting nested guesses', () => {
    expect(getBlogSlug('/blog/why-this-lab-uses-two-runtimes')).toBe('why-this-lab-uses-two-runtimes')
    expect(getBlogSlug('/blog/why-this-lab-uses-two-runtimes/')).toBe('why-this-lab-uses-two-runtimes')
    expect(getBlogSlug('/blog')).toBeNull()
    expect(getBlogSlug('/blog/a/extra')).toBeNull()
  })
})
