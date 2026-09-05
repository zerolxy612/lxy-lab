import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { renderRouteHtml } from '../../staticLibraryRoutes'
import { blogPosts } from './blog'
import { resolvePageMetadata } from './pageMetadata'

const indexHtml = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

describe('static Library routes', () => {
  it('embeds article metadata and structured data in a direct-entry document', () => {
    const post = blogPosts[0]
    const metadata = resolvePageMetadata(`/blog/${post.slug}`, blogPosts)
    const html = renderRouteHtml(indexHtml, metadata, 'https://lab.example.com')

    expect(html).toContain(`<title>${post.title} — Xiangyu's AI Lab</title>`)
    expect(html).toContain(`content="${post.summary}"`)
    expect(html).toContain('property="og:type" content="article"')
    expect(html).toContain(`rel="canonical" href="https://lab.example.com/blog/${post.slug}"`)
    expect(html).toContain('"@type":"BlogPosting"')
  })

  it('does not invent a canonical origin when none is configured', () => {
    const html = renderRouteHtml(indexHtml, resolvePageMetadata('/library', blogPosts))

    expect(html).toContain('<title>Archive Library — Xiangyu\'s AI Lab</title>')
    expect(html).not.toContain('rel="canonical"')
    expect(html).not.toContain('property="og:url"')
  })
})
