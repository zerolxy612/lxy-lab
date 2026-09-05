import { describe, expect, it } from 'vitest'
import { blogPosts } from './blog'
import { defaultPageTitle, resolvePageMetadata, toAbsoluteUrl } from './pageMetadata'

describe('page metadata', () => {
  it('describes Library and Catalog as public discovery routes', () => {
    expect(resolvePageMetadata('/library/', blogPosts)).toMatchObject({
      title: `Archive Library — ${defaultPageTitle}`,
      robots: 'index, follow',
      path: '/library',
    })
    expect(resolvePageMetadata('/blog', blogPosts).path).toBe('/blog')
  })

  it('uses article frontmatter for stable article metadata', () => {
    const post = blogPosts[0]
    expect(resolvePageMetadata(`/blog/${post.slug}`, blogPosts)).toMatchObject({
      title: `${post.title} — ${defaultPageTitle}`,
      description: post.summary,
      type: 'article',
      article: { category: post.category, published: post.published },
    })
  })

  it('keeps private and unknown routes out of search results', () => {
    expect(resolvePageMetadata('/author', blogPosts).robots).toBe('noindex, follow')
    expect(resolvePageMetadata('/blog/missing-record', blogPosts).robots).toBe('noindex, follow')
    expect(resolvePageMetadata('/unknown', blogPosts).robots).toBe('noindex, follow')
  })

  it('only creates absolute URLs from a valid configured public origin', () => {
    expect(toAbsoluteUrl('https://lab.example.com/', '/blog/a')).toBe('https://lab.example.com/blog/a')
    expect(toAbsoluteUrl('', '/blog/a')).toBeUndefined()
    expect(toAbsoluteUrl('not a url', '/blog/a')).toBeUndefined()
  })
})
