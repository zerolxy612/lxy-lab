import type { AuthorDocument } from './authorTypes'

export interface PublicationCheck {
  id: string
  label: string
  detail: string
  status: 'pass' | 'warning' | 'error'
}

interface MarkdownImage {
  alt: string
  url: string
}

function readMarkdownImages(body: string): MarkdownImage[] {
  return [...body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)]
    .map((match) => ({ alt: match[1].trim(), url: match[2].trim() }))
}

export function getPublicationChecks(document: AuthorDocument, assets: readonly string[]): PublicationCheck[] {
  const images = readMarkdownImages(document.body)
  const localPrefix = `/assets/blog/${document.slug}/`
  const referencedAssets = new Set(images.flatMap(({ url }) => (
    url.startsWith(localPrefix) ? [url.slice(localPrefix.length)] : []
  )))
  const weakAltImages = images.filter(({ alt }) => !alt || /^describe this image$/i.test(alt))
  const missingAssets = [...referencedAssets].filter((filename) => !assets.includes(filename))
  const unusedAssets = assets.filter((filename) => !referencedAssets.has(filename))
  const sectionCount = document.body.match(/^##\s+.+$/gm)?.length ?? 0
  const summaryReady = !/^add a concise summary/i.test(document.summary)
  const signalReady = !/^add the central decision/i.test(document.catalogSignal)

  return [
    {
      id: 'summary',
      label: 'Catalog summary',
      detail: summaryReady ? 'Ready for the public index.' : 'Replace the draft summary before publishing.',
      status: summaryReady ? 'pass' : 'error',
    },
    {
      id: 'signal',
      label: 'Core signal',
      detail: signalReady ? 'A central decision is present.' : 'Replace the placeholder core signal.',
      status: signalReady ? 'pass' : 'error',
    },
    {
      id: 'structure',
      label: 'Reading structure',
      detail: sectionCount === 1 ? 'One section is valid; two or more usually scan better.' : `${sectionCount} sections detected.`,
      status: sectionCount === 0 ? 'error' : sectionCount === 1 ? 'warning' : 'pass',
    },
    {
      id: 'alt-text',
      label: 'Image descriptions',
      detail: weakAltImages.length === 0 ? 'Every image has useful alternative text.' : `${weakAltImages.length} image${weakAltImages.length === 1 ? '' : 's'} need descriptive alt text.`,
      status: weakAltImages.length === 0 ? 'pass' : 'error',
    },
    {
      id: 'references',
      label: 'Image references',
      detail: missingAssets.length === 0 ? 'All local image references resolve.' : `Missing: ${missingAssets.join(', ')}`,
      status: missingAssets.length === 0 ? 'pass' : 'error',
    },
    {
      id: 'unused-assets',
      label: 'Unused uploads',
      detail: unusedAssets.length === 0 ? 'No orphaned article uploads.' : `Not used in Markdown: ${unusedAssets.join(', ')}`,
      status: unusedAssets.length === 0 ? 'pass' : 'warning',
    },
  ]
}

export function getBlockingPublicationChecks(document: AuthorDocument, assets: readonly string[]) {
  return getPublicationChecks(document, assets).filter(({ status }) => status === 'error')
}
