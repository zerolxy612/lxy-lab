export interface BlogSection {
  heading: string
}

export interface BlogPost {
  slug: string
  index: string
  title: string
  summary: string
  category: string
  published: string
  readingTime: string
  catalogSignal: string
  featured: boolean
  draft: boolean
  body: string
  sections: readonly BlogSection[]
}

const markdownSources = import.meta.glob<string>(
  '../../content/blog/*/index.md',
  { eager: true, query: '?raw', import: 'default' },
)

const requiredStringFields = [
  'index', 'title', 'summary', 'category', 'published', 'readingTime', 'catalogSignal',
] as const

function parseScalar(value: string) {
  const trimmed = value.trim()
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed) as unknown
    } catch {
      throw new Error(`Invalid quoted frontmatter value: ${trimmed}`)
    }
  }
  return trimmed
}

export function parseBlogSource(slug: string, source: string): BlogPost {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) throw new Error(`Invalid blog post "${slug}": frontmatter is required`)

  const metadata: Record<string, unknown> = {}
  match[1].split(/\r?\n/).forEach((line, index) => {
    if (!line.trim()) return
    const separator = line.indexOf(':')
    if (separator < 1) {
      throw new Error(`Invalid blog post "${slug}": frontmatter line ${index + 1}`)
    }
    metadata[line.slice(0, separator).trim()] = parseScalar(line.slice(separator + 1))
  })

  requiredStringFields.forEach((field) => {
    if (typeof metadata[field] !== 'string' || metadata[field].trim().length === 0) {
      throw new Error(`Invalid blog post "${slug}": ${field} is required`)
    }
  })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(metadata.published))) {
    throw new Error(`Invalid blog post "${slug}": published must use YYYY-MM-DD`)
  }

  const body = match[2].trim()
  if (!body) throw new Error(`Invalid blog post "${slug}": body is required`)
  const sections = [...body.matchAll(/^##\s+(.+)$/gm)].map((section) => ({
    heading: section[1].trim(),
  }))
  if (sections.length === 0) {
    throw new Error(`Invalid blog post "${slug}": at least one level-two heading is required`)
  }

  return {
    slug,
    index: String(metadata.index),
    title: String(metadata.title),
    summary: String(metadata.summary),
    category: String(metadata.category),
    published: String(metadata.published),
    readingTime: String(metadata.readingTime),
    catalogSignal: String(metadata.catalogSignal),
    featured: metadata.featured === true,
    draft: metadata.draft === true,
    body,
    sections,
  }
}

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
