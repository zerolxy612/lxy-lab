import { parseBlogSource } from './blogSchema'
import type { BlogPost } from './blogSchema'

export { parseBlogSource }
export type { BlogPost, BlogSection } from './blogSchema'

const markdownSources = import.meta.glob<string>(
  '../../content/blog/*/index.md',
  { eager: true, query: '?raw', import: 'default' },
)

const allBlogPosts = Object.entries(markdownSources).map(([path, source]) => {
  const slug = path.match(/\/content\/blog\/([^/]+)\/index\.md$/)?.[1]
  if (!slug) throw new Error(`Invalid blog content path: ${path}`)
  return parseBlogSource(slug, source)
})

export const blogPosts: readonly BlogPost[] = allBlogPosts
  .filter(({ draft }) => !draft)
  .sort((left, right) => left.index.localeCompare(right.index))

if (new Set(blogPosts.map(({ slug }) => slug)).size !== blogPosts.length) {
  throw new Error('Blog slugs must be unique')
}
if (new Set(blogPosts.map(({ index }) => index)).size !== blogPosts.length) {
  throw new Error('Blog record indexes must be unique')
}
if (blogPosts.filter(({ featured }) => featured).length !== 1) {
  throw new Error('Exactly one published blog post must be featured')
}

export const blogPostBySlug = Object.fromEntries(
  blogPosts.map((post) => [post.slug, post]),
) as Record<string, BlogPost>

export const featuredBlogPost = blogPosts.find(({ featured }) => featured)!

export function getBlogSlug(pathname: string) {
  const match = pathname.match(/^\/blog\/([^/]+)\/?$/)
  return match?.[1] ?? null
}
