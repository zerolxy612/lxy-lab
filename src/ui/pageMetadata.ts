import { blogPosts } from '../content/blog'
import {
  defaultSocialImage,
  resolvePageMetadata,
  toAbsoluteUrl,
  type PageMetadata,
} from '../content/pageMetadata'

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.content = content
}

function removeMeta(attribute: 'name' | 'property', key: string) {
  document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove()
}

function setCanonical(url: string | undefined) {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!url) return existing?.remove()
  const link = existing ?? document.createElement('link')
  link.rel = 'canonical'
  link.href = url
  if (!existing) document.head.append(link)
}

function setStructuredData(metadata: PageMetadata, canonicalUrl: string | undefined, imageUrl: string | undefined) {
  const existing = document.head.querySelector<HTMLScriptElement>('script[data-page-structured-data]')
  if (!metadata.article) return existing?.remove()
  const script = existing ?? document.createElement('script')
  script.type = 'application/ld+json'
  script.dataset.pageStructuredData = ''
  script.text = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metadata.article.title,
    description: metadata.description,
    datePublished: metadata.article.published,
    articleSection: metadata.article.category,
    author: { '@type': 'Person', name: 'Xiangyu' },
    ...(canonicalUrl ? { mainEntityOfPage: canonicalUrl } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  }).replace(/</g, '\\u003c')
  if (!existing) document.head.append(script)
}

export function syncPageMetadata(pathname: string) {
  const metadata = resolvePageMetadata(pathname, blogPosts)
  const canonicalUrl = toAbsoluteUrl(import.meta.env.VITE_SITE_URL, metadata.path)
  const imageUrl = toAbsoluteUrl(import.meta.env.VITE_SITE_URL, defaultSocialImage)

  document.title = metadata.title
  setMeta('name', 'description', metadata.description)
  setMeta('name', 'robots', metadata.robots)
  setMeta('property', 'og:type', metadata.type)
  setMeta('property', 'og:title', metadata.title)
  setMeta('property', 'og:description', metadata.description)
  setMeta('name', 'twitter:title', metadata.title)
  setMeta('name', 'twitter:description', metadata.description)
  setCanonical(canonicalUrl)
  if (canonicalUrl) setMeta('property', 'og:url', canonicalUrl)
  else removeMeta('property', 'og:url')
  if (imageUrl) {
    setMeta('property', 'og:image', imageUrl)
    setMeta('name', 'twitter:image', imageUrl)
  }
  if (metadata.article) {
    setMeta('property', 'article:published_time', metadata.article.published)
    setMeta('property', 'article:section', metadata.article.category)
  } else {
    removeMeta('property', 'article:published_time')
    removeMeta('property', 'article:section')
  }
  setStructuredData(metadata, canonicalUrl, imageUrl)
}
