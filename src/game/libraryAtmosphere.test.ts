import { describe, expect, it } from 'vitest'
import { blogPosts, featuredBlogPost } from '../content/blog'
import { getReturnablePosts, selectReturnPost } from './libraryAtmosphere'

describe('Archive Library atmosphere', () => {
  it('reserves the return slot for records outside the featured reading desk', () => {
    const records = getReturnablePosts(blogPosts)

    expect(records).not.toContain(featuredBlogPost)
    expect(records.map(({ index }) => index)).toEqual(['LOG-001', 'LOG-002'])
  })

  it('cycles old records without introducing randomness or dead ends', () => {
    expect(selectReturnPost(blogPosts, 0)?.index).toBe('LOG-001')
    expect(selectReturnPost(blogPosts, 1)?.index).toBe('LOG-002')
    expect(selectReturnPost(blogPosts, 2)?.index).toBe('LOG-001')
  })
})
