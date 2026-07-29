import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const readText = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

const indexHtml = readText('../../index.html')
const packageJson = JSON.parse(readText('../../package.json')) as { version: string }
const packageLock = JSON.parse(readText('../../package-lock.json')) as {
  version: string
  packages: Record<string, { version?: string }>
}

describe('v0.4 release readiness', () => {
  it('keeps package metadata on the v0.4 release line', () => {
    expect(packageJson.version).toBe('0.4.0')
    expect(packageLock.version).toBe(packageJson.version)
    expect(packageLock.packages['']?.version).toBe(packageJson.version)
  })

  it('ships the required discovery and social metadata', () => {
    const requiredMetadata = [
      'name="description"',
      'name="author"',
      'name="robots"',
      'property="og:type"',
      'property="og:title"',
      'property="og:description"',
      'property="og:image"',
      'property="og:image:width" content="1200"',
      'property="og:image:height" content="630"',
      'name="twitter:card" content="summary_large_image"',
      'name="twitter:title"',
      'name="twitter:description"',
      'name="twitter:image"',
      'rel="icon" href="/favicon.svg"',
      'rel="me" href="https://github.com/zerolxy612"',
    ]

    requiredMetadata.forEach((metadata) => expect(indexHtml).toContain(metadata))
  })

  it('keeps the Open Graph image at the declared dimensions', () => {
    const imagePath = '/assets/brand/og-xiangyu-ai-lab-v1.png'
    expect(indexHtml).toContain(`property="og:image" content="${imagePath}"`)
    expect(indexHtml).toContain(`name="twitter:image" content="${imagePath}"`)

    const image = readFileSync(new URL(`../../public${imagePath}`, import.meta.url))
    expect(image.subarray(1, 4).toString('ascii')).toBe('PNG')
    expect(image.readUInt32BE(16)).toBe(1200)
    expect(image.readUInt32BE(20)).toBe(630)
  })

  it('ships crawl and favicon fallbacks without a final-domain assumption', () => {
    const robots = readText('../../public/robots.txt')
    const favicon = readText('../../public/favicon.svg')

    expect(robots.trim()).toBe('User-agent: *\nAllow: /')
    expect(favicon).toContain('<title id="title">Xiangyu\'s AI Lab</title>')
    expect(indexHtml).not.toContain('rel="canonical"')
    expect(indexHtml).not.toContain('property="og:url"')
  })
})
