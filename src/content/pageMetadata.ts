import type { BlogPost } from './blogSchema'

export const defaultPageTitle = "Xiangyu's AI Lab"
export const defaultPageDescription = "Explore Xiangyu's pixel-art AI laboratory: interactive systems, government-facing Legal AI, and engineering ideas shaped in Hong Kong."
export const defaultSocialImage = '/assets/brand/og-xiangyu-ai-lab-v1.png'

export interface PageMetadata {
  title: string
  description: string
  type: 'website' | 'article'
  robots: 'index, follow' | 'noindex, follow'
  path: string
  article?: Pick<BlogPost, 'category' | 'published' | 'title'>
}

export function resolvePageMetadata(pathname: string, posts: readonly BlogPost[]): PageMetadata {
  const normalizedPath = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/'
  const articleSlug = normalizedPath.match(/^\/blog\/([^/]+)$/)?.[1]
  const article = articleSlug ? posts.find(({ slug }) => slug === articleSlug) : undefined

  if (article) {
    return {
      title: `${article.title} — Xiangyu's AI Lab`,
      description: article.summary,
      type: 'article',
      robots: 'index, follow',
      path: `/blog/${article.slug}`,
      article: {
        category: article.category,
        published: article.published,
        title: article.title,
      },
    }
  }
  if (normalizedPath === '/library' || normalizedPath === '/blog') {
    return {
      title: `Archive Library — ${defaultPageTitle}`,
      description: 'Browse Xiangyu’s public engineering field notes, architecture decisions, character systems, and experience design records.',
      type: 'website',
      robots: 'index, follow',
      path: normalizedPath,
    }
  }
  if (articleSlug) {
    return {
      title: `Record not found — ${defaultPageTitle}`,
      description: 'The requested archive record is unavailable. Browse the public Archive Library index instead.',
      type: 'website',
      robots: 'noindex, follow',
      path: normalizedPath,
    }
  }
  if (normalizedPath === '/author') {
    return {
      title: `Local Author Studio — ${defaultPageTitle}`,
      description: 'Local-only publishing tools for the Archive Library.',
      type: 'website',
      robots: 'noindex, follow',
      path: normalizedPath,
    }
  }
  return {
    title: defaultPageTitle,
    description: defaultPageDescription,
    type: 'website',
    robots: normalizedPath === '/' || normalizedPath === '/lab' ? 'index, follow' : 'noindex, follow',
    path: normalizedPath,
  }
}

export function toAbsoluteUrl(siteUrl: string | undefined, path: string) {
  if (!siteUrl?.trim()) return undefined
  try {
    return new URL(path, `${siteUrl.replace(/\/+$/, '')}/`).toString()
  } catch {
    return undefined
  }
}
