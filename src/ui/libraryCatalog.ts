import type { BlogPost } from '../content/blog'

export type CatalogSort = 'recommended' | 'newest' | 'oldest'

export function getCatalogCategories(posts: readonly BlogPost[]) {
  return [...new Set(posts.map(({ category }) => category))].sort((left, right) => left.localeCompare(right))
}

export function selectCatalogPosts(
  posts: readonly BlogPost[],
  query: string,
  category: string,
  sort: CatalogSort,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const selected = posts.filter((post) => {
    if (category !== 'All records' && post.category !== category) return false
    if (!normalizedQuery) return true
    return [post.index, post.title, post.summary, post.category, post.catalogSignal]
      .some((value) => value.toLocaleLowerCase().includes(normalizedQuery))
  })

  return [...selected].sort((left, right) => {
    if (sort === 'recommended' && left.featured !== right.featured) return left.featured ? -1 : 1
    const dateOrder = left.published.localeCompare(right.published)
    if (sort === 'newest') return dateOrder === 0 ? left.index.localeCompare(right.index) : -dateOrder
    if (sort === 'oldest') return dateOrder === 0 ? left.index.localeCompare(right.index) : dateOrder
    return left.index.localeCompare(right.index)
  })
}
