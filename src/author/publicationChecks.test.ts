import { describe, expect, it } from 'vitest'
import type { AuthorDocument } from './authorTypes'
import { getBlockingPublicationChecks, getPublicationChecks } from './publicationChecks'

const document: AuthorDocument = {
  slug: 'test-record',
  index: 'LOG-099',
  title: 'Test record',
  summary: 'A concise public summary.',
  category: 'Architecture',
  published: '2026-09-05',
  readingTime: '3 min',
  catalogSignal: 'A clear decision belongs here.',
  featured: false,
  draft: false,
  body: '## First\n\nText.\n\n## Second\n\n![System diagram](/assets/blog/test-record/diagram.png)',
}

describe('publication checks', () => {
  it('passes a complete record with a referenced, described image', () => {
    expect(getBlockingPublicationChecks(document, ['diagram.png'])).toEqual([])
    expect(getPublicationChecks(document, ['diagram.png']).every(({ status }) => status === 'pass')).toBe(true)
  })

  it('blocks placeholder copy, missing sections, weak alt text, and missing assets', () => {
    const broken = {
      ...document,
      summary: 'Add a concise summary before publishing.',
      catalogSignal: 'Add the central decision or observation.',
      body: '![Describe this image](/assets/blog/test-record/missing.png)',
    }
    expect(getBlockingPublicationChecks(broken, []).map(({ id }) => id)).toEqual([
      'summary',
      'signal',
      'structure',
      'alt-text',
      'references',
    ])
  })

  it('warns about uploaded assets that are not used without blocking publication', () => {
    const checks = getPublicationChecks({ ...document, body: '## First\n\nText.' }, ['unused.png'])
    expect(checks.find(({ id }) => id === 'structure')?.status).toBe('warning')
    expect(checks.find(({ id }) => id === 'unused-assets')?.status).toBe('warning')
    expect(getBlockingPublicationChecks({ ...document, body: '## First\n\nText.' }, ['unused.png'])).toEqual([])
  })
})
