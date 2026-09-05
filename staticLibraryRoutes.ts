import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from 'vite'
import { parseBlogSource, type BlogPost } from './src/content/blogSchema'
import {
  defaultSocialImage,
  resolvePageMetadata,
  toAbsoluteUrl,
  type PageMetadata,
} from './src/content/pageMetadata'

function escapeAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function replaceMeta(html: string, attribute: 'name' | 'property', key: string, content: string) {
  const tag = `<meta ${attribute}="${key}" content="${escapeAttribute(content)}" />`
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`, 'i')
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

function renderStructuredData(metadata: PageMetadata, canonicalUrl: string | undefined, imageUrl: string | undefined) {
  if (!metadata.article) return ''
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metadata.article.title,
    description: metadata.description,
    datePublished: metadata.article.published,
    articleSection: metadata.article.category,
    author: { '@type': 'Person', name: 'Xiangyu' },
    ...(canonicalUrl ? { mainEntityOfPage: canonicalUrl } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  }
  return `    <script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>\n`
}

export function renderRouteHtml(
  source: string,
  metadata: PageMetadata,
  siteUrl?: string,
) {
  const canonicalUrl = toAbsoluteUrl(siteUrl, metadata.path)
  const imageUrl = toAbsoluteUrl(siteUrl, defaultSocialImage) ?? defaultSocialImage
  let html = source.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttribute(metadata.title)}</title>`)
  html = replaceMeta(html, 'name', 'description', metadata.description)
  html = replaceMeta(html, 'name', 'robots', metadata.robots)
  html = replaceMeta(html, 'property', 'og:type', metadata.type)
  html = replaceMeta(html, 'property', 'og:title', metadata.title)
  html = replaceMeta(html, 'property', 'og:description', metadata.description)
  html = replaceMeta(html, 'property', 'og:image', imageUrl)
  html = replaceMeta(html, 'name', 'twitter:title', metadata.title)
  html = replaceMeta(html, 'name', 'twitter:description', metadata.description)
  html = replaceMeta(html, 'name', 'twitter:image', imageUrl)
  if (metadata.article) {
    html = replaceMeta(html, 'property', 'article:published_time', metadata.article.published)
    html = replaceMeta(html, 'property', 'article:section', metadata.article.category)
  }
  const routeMarkup = [
    canonicalUrl ? `    <link rel="canonical" href="${escapeAttribute(canonicalUrl)}" />\n` : '',
    canonicalUrl ? `    <meta property="og:url" content="${escapeAttribute(canonicalUrl)}" />\n` : '',
    renderStructuredData(metadata, canonicalUrl, imageUrl),
  ].join('')
  return routeMarkup ? html.replace('</head>', `${routeMarkup}  </head>`) : html
}

async function readBlogPosts(root: string) {
  const contentRoot = path.join(root, 'content', 'blog')
  const entries = await readdir(contentRoot, { withFileTypes: true })
  const posts: BlogPost[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const source = await readFile(path.join(contentRoot, entry.name, 'index.md'), 'utf8')
    const post = parseBlogSource(entry.name, source)
    if (!post.draft) posts.push(post)
  }
  return posts.sort((left, right) => left.index.localeCompare(right.index))
}

function routeFile(pathname: string) {
  return pathname === '/' ? 'index.html' : `${pathname.replace(/^\//, '')}/index.html`
}

function renderSitemap(siteUrl: string, paths: readonly string[]) {
  const urls = paths.map((pathname) => `  <url><loc>${escapeAttribute(toAbsoluteUrl(siteUrl, pathname)!)}</loc></url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

export function staticLibraryRoutesPlugin(siteUrl?: string): Plugin {
  let root = process.cwd()
  let outDir = path.join(root, 'dist')
  return {
    name: 'static-library-routes',
    configResolved(config) {
      root = config.root
      outDir = path.resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const source = await readFile(path.join(outDir, 'index.html'), 'utf8')
      const posts = await readBlogPosts(root)
      const paths = ['/', '/lab', '/library', '/blog', ...posts.map(({ slug }) => `/blog/${slug}`)]
      for (const pathname of paths.slice(1)) {
        const destination = path.join(outDir, routeFile(pathname))
        await mkdir(path.dirname(destination), { recursive: true })
        await writeFile(destination, renderRouteHtml(source, resolvePageMetadata(pathname, posts), siteUrl))
      }
      if (toAbsoluteUrl(siteUrl, '/')) {
        await writeFile(path.join(outDir, 'sitemap.xml'), renderSitemap(siteUrl!, paths))
      }
    },
  }
}
