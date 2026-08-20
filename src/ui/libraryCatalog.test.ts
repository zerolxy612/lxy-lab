import { describe, expect, it } from 'vitest'
import { blogPosts } from '../content/blog'
import { getCatalogCategories, selectCatalogPosts } from './libraryCatalog'

describe('library catalog selection', () => {
  it('derives stable classifications from public records', () => {
    expect(getCatalogCategories(blogPosts)).toEqual([
      'Architecture',
      'Character Systems',
      'Experience Design',
    ])
  })

  it('searches across title, summary, category, index, and central signal', () => {
    expect(selectCatalogPosts(blogPosts, 'LOG-002', 'All records', 'recommended').map(({ index }) => index)).toEqual(['LOG-002'])
    expect(selectCatalogPosts(blogPosts, 'continuity', 'All records', 'recommended').map(({ index }) => index)).toEqual(['LOG-002'])
    expect(selectCatalogPosts(blogPosts, 'architecture', 'All records', 'recommended').map(({ index }) => index)).toEqual(['LOG-001'])
  })

  it('combines classification filters with deterministic sort orders', () => {
    expect(selectCatalogPosts(blogPosts, '', 'Experience Design', 'recommended').map(({ index }) => index)).toEqual(['LOG-003'])
    expect(selectCatalogPosts(blogPosts, '', 'All records', 'recommended')[0].featured).toBe(true)
    expect(selectCatalogPosts(blogPosts, '', 'All records', 'newest').map(({ index }) => index)).toEqual(['LOG-003', 'LOG-001', 'LOG-002'])
    expect(selectCatalogPosts(blogPosts, '', 'All records', 'oldest').map(({ index }) => index)).toEqual(['LOG-001', 'LOG-002', 'LOG-003'])
  })
})
