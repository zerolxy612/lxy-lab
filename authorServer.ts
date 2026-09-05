import { mkdir, readFile, readdir, rename, rm, stat, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import type { AuthorDocument, AuthorPostSummary, AuthorTrashSummary } from './src/author/authorTypes'
import { getBlockingPublicationChecks } from './src/author/publicationChecks'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const assetPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:png|jpe?g|webp|gif)$/i
const allowedAssetTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const fields = ['index', 'title', 'summary', 'category', 'published', 'readingTime', 'catalogSignal'] as const

function parseScalar(value: string) {
  const trimmed = value.trim()
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return JSON.parse(trimmed) as unknown
  return trimmed
}

function parseDocument(slug: string, source: string): AuthorDocument {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) throw new Error('Frontmatter is required.')
  const metadata: Record<string, unknown> = {}
  match[1].split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return
    const separator = line.indexOf(':')
    if (separator < 1) throw new Error(`Invalid frontmatter line: ${line}`)
    metadata[line.slice(0, separator).trim()] = parseScalar(line.slice(separator + 1))
  })
  fields.forEach((field) => {
    if (typeof metadata[field] !== 'string' || !metadata[field].trim()) {
      throw new Error(`${field} is required.`)
    }
  })
  const body = match[2].trim()
  return validateDocument({
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
  })
}

function validateDocument(value: unknown): AuthorDocument {
  if (!value || typeof value !== 'object') throw new Error('Article data is required.')
  const input = value as Record<string, unknown>
  const document = Object.fromEntries([
    ...fields.map((field) => [field, typeof input[field] === 'string' ? input[field].trim() : '']),
    ['slug', typeof input.slug === 'string' ? input.slug.trim() : ''],
    ['body', typeof input.body === 'string' ? input.body.trim() : ''],
    ['featured', input.featured === true],
    ['draft', input.draft !== false],
  ]) as unknown as AuthorDocument
  if (!slugPattern.test(document.slug)) throw new Error('Slug must use lowercase letters, numbers, and hyphens.')
  fields.forEach((field) => {
    if (!document[field]) throw new Error(`${field} is required.`)
  })
  if (!/^LOG-\d{3,}$/.test(document.index)) throw new Error('Index must look like LOG-004.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(document.published)) throw new Error('Published date must use YYYY-MM-DD.')
  if (document.title.length > 120) throw new Error('Title must be 120 characters or fewer.')
  if (document.summary.length > 240) throw new Error('Summary must be 240 characters or fewer.')
  if (document.catalogSignal.length > 90) throw new Error('Catalog signal must be 90 characters or fewer.')
  if (document.body.length > 500_000) throw new Error('Article body is too large.')
  if (!document.body.match(/^##\s+.+$/m)) throw new Error('Add at least one level-two heading (##).')
  if (/<script\b|javascript:/i.test(document.body)) throw new Error('Executable HTML is not allowed.')
  return document
}

function serializeDocument(document: AuthorDocument) {
  const stringField = (key: keyof AuthorDocument) => `${key}: ${JSON.stringify(document[key])}`
  return [
    '---',
    ...fields.map(stringField),
    `featured: ${document.featured}`,
    `draft: ${document.draft}`,
    '---',
    '',
    document.body.trim(),
    '',
  ].join('\n')
}

async function readBody(request: IncomingMessage, maxBytes = 700_000) {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > maxBytes) throw new Error('Request is too large.')
    chunks.push(buffer)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
  } catch {
    throw new Error('Request body must be valid JSON.')
  }
}

function sendJson(response: ServerResponse, status: number, value: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(value))
}

export function authorStudioPlugin(): Plugin {
  const root = process.cwd()
  const contentRoot = path.join(root, 'content', 'blog')
  const assetRoot = path.join(root, 'public', 'assets', 'blog')
  const trashRoot = path.join(root, '.trash', 'blog')
  const articlePath = (slug: string) => path.join(contentRoot, slug, 'index.md')

  const readAll = async () => {
    await mkdir(contentRoot, { recursive: true })
    const entries = await readdir(contentRoot, { withFileTypes: true })
    const documents: AuthorDocument[] = []
    for (const entry of entries) {
      if (!entry.isDirectory() || !slugPattern.test(entry.name)) continue
      documents.push(parseDocument(entry.name, await readFile(articlePath(entry.name), 'utf8')))
    }
    return documents.sort((left, right) => left.index.localeCompare(right.index))
  }

  const ensureCollection = (documents: AuthorDocument[]) => {
    const indexes = documents.map(({ index }) => index)
    if (new Set(indexes).size !== indexes.length) throw new Error('Record indexes must be unique.')
    const published = documents.filter(({ draft }) => !draft)
    if (published.length > 0 && published.filter(({ featured }) => featured).length !== 1) {
      throw new Error('Exactly one published article must be featured.')
    }
  }

  return {
    name: 'local-author-studio',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (!request.url?.startsWith('/__author/')) return next()
        try {
          const url = new URL(request.url, 'http://localhost')
          const parts = url.pathname.split('/').filter(Boolean)

          if (parts[1] === 'trash') {
            await mkdir(trashRoot, { recursive: true })
            if (request.method === 'GET' && parts.length === 2) {
              const entries = await readdir(trashRoot, { withFileTypes: true })
              const trash: AuthorTrashSummary[] = []
              for (const entry of entries) {
                if (!entry.isDirectory() || !/^[a-z0-9-]+-\d+$/.test(entry.name)) continue
                try {
                  const source = await readFile(path.join(trashRoot, entry.name, 'content', 'index.md'), 'utf8')
                  const slug = entry.name.replace(/-\d+$/, '')
                  const document = parseDocument(slug, source)
                  const timestamp = Number(entry.name.match(/(\d+)$/)?.[1])
                  trash.push({
                    id: entry.name,
                    slug,
                    index: document.index,
                    title: document.title,
                    deletedAt: new Date(timestamp).toISOString(),
                  })
                } catch {
                  // Ignore incomplete manual entries in the trash folder.
                }
              }
              return sendJson(response, 200, { trash: trash.sort((left, right) => right.deletedAt.localeCompare(left.deletedAt)) })
            }

            if (request.method === 'POST' && parts.length === 4 && parts[3] === 'restore') {
              const trashId = decodeURIComponent(parts[2] ?? '')
              if (!/^[a-z0-9-]+-\d+$/.test(trashId)) throw new Error('Invalid trash record.')
              const sourceDirectory = path.join(trashRoot, trashId, 'content')
              const source = await readFile(path.join(sourceDirectory, 'index.md'), 'utf8')
              const slug = trashId.replace(/-\d+$/, '')
              const restored = parseDocument(slug, source)
              try {
                await stat(articlePath(slug))
                throw new Error('A current article already uses this slug.')
              } catch (error) {
                if (error instanceof Error && error.message === 'A current article already uses this slug.') throw error
              }
              ensureCollection([...(await readAll()), restored])
              await rename(sourceDirectory, path.join(contentRoot, slug))
              const trashedAssets = path.join(trashRoot, trashId, 'assets')
              try {
                await rename(trashedAssets, path.join(assetRoot, slug))
              } catch {
                // The restored article may not have uploaded assets.
              }
              await rm(path.join(trashRoot, trashId), { recursive: true, force: true })
              return sendJson(response, 200, { restored: slug })
            }

            return sendJson(response, 404, { error: 'Not found.' })
          }

          if (parts[1] !== 'posts') return sendJson(response, 404, { error: 'Not found.' })

          if (request.method === 'GET' && parts.length === 2) {
            const posts: AuthorPostSummary[] = (await readAll()).map((document) => ({
              slug: document.slug,
              index: document.index,
              title: document.title,
              category: document.category,
              published: document.published,
              featured: document.featured,
              draft: document.draft,
            }))
            return sendJson(response, 200, { posts })
          }

          if (request.method === 'POST' && parts.length === 2) {
            const payload = await readBody(request) as Record<string, unknown>
            const title = typeof payload.title === 'string' ? payload.title.trim() : ''
            const requestedSlug = typeof payload.slug === 'string' ? payload.slug.trim() : ''
            if (!title || !slugPattern.test(requestedSlug)) throw new Error('A title and valid slug are required.')
            try {
              await stat(articlePath(requestedSlug))
              throw new Error('That slug already exists.')
            } catch (error) {
              if (error instanceof Error && error.message === 'That slug already exists.') throw error
            }
            const documents = await readAll()
            const nextIndex = Math.max(0, ...documents.map(({ index }) => Number(index.replace('LOG-', '')) || 0)) + 1
            const document: AuthorDocument = {
              slug: requestedSlug,
              index: `LOG-${String(nextIndex).padStart(3, '0')}`,
              title,
              summary: 'Add a concise summary before publishing.',
              category: 'Field Notes',
              published: new Date().toISOString().slice(0, 10),
              readingTime: '5 min',
              catalogSignal: 'Add the central decision or observation.',
              featured: false,
              draft: true,
              body: '## First section\n\nStart writing here.',
            }
            await mkdir(path.dirname(articlePath(requestedSlug)), { recursive: true })
            await writeFile(articlePath(requestedSlug), serializeDocument(document), { flag: 'wx' })
            await mkdir(path.join(assetRoot, requestedSlug), { recursive: true })
            return sendJson(response, 201, { document, assets: [] })
          }

          const slug = decodeURIComponent(parts[2] ?? '')
          if (!slugPattern.test(slug)) return sendJson(response, 400, { error: 'Invalid slug.' })

          if (request.method === 'GET' && parts.length === 3) {
            const document = parseDocument(slug, await readFile(articlePath(slug), 'utf8'))
            const directory = path.join(assetRoot, slug)
            const assets = await readdir(directory).catch(() => [])
            return sendJson(response, 200, { document, assets: assets.filter((name) => assetPattern.test(name)) })
          }

          if (request.method === 'PUT' && parts.length === 3) {
            const candidate = validateDocument(await readBody(request))
            if (candidate.slug !== slug) throw new Error('Changing a slug after creation is not supported.')
            const assetDirectory = path.join(assetRoot, slug)
            const assets = (await readdir(assetDirectory).catch(() => []))
              .filter((name) => assetPattern.test(name))
            if (!candidate.draft) {
              const blockingChecks = getBlockingPublicationChecks(candidate, assets)
              if (blockingChecks.length > 0) {
                throw new Error(`Publishing checks failed: ${blockingChecks.map(({ label }) => label).join(', ')}.`)
              }
            }
            const documents = await readAll()
            let nextDocuments = documents.map((document) => document.slug === slug ? candidate : document)
            if (candidate.featured && !candidate.draft) {
              nextDocuments = nextDocuments.map((document) => (
                document.slug === slug ? document : { ...document, featured: false }
              ))
            }
            ensureCollection(nextDocuments)
            for (const document of nextDocuments) {
              const previous = documents.find(({ slug: previousSlug }) => previousSlug === document.slug)
              if (!previous || previous.featured === document.featured) continue
              await writeFile(articlePath(document.slug), serializeDocument(document))
            }
            const temporary = `${articlePath(slug)}.tmp`
            await writeFile(temporary, serializeDocument(candidate))
            await rename(temporary, articlePath(slug))
            return sendJson(response, 200, { document: candidate })
          }

          if (request.method === 'DELETE' && parts.length === 3) {
            const documents = await readAll()
            ensureCollection(documents.filter((document) => document.slug !== slug))
            const trash = path.join(trashRoot, `${slug}-${Date.now()}`)
            await mkdir(trash, { recursive: true })
            await rename(path.dirname(articlePath(slug)), path.join(trash, 'content'))
            const assets = path.join(assetRoot, slug)
            try {
              await rename(assets, path.join(trash, 'assets'))
            } catch {
              // An article may not have uploaded assets.
            }
            return sendJson(response, 200, { recoverableFrom: path.relative(root, trash) })
          }

          if (parts[3] === 'assets' && request.method === 'POST' && parts.length === 4) {
            const payload = await readBody(request, 11_000_000) as Record<string, unknown>
            const filename = typeof payload.filename === 'string' ? path.basename(payload.filename) : ''
            const dataUrl = typeof payload.dataUrl === 'string' ? payload.dataUrl : ''
            if (!assetPattern.test(filename)) throw new Error('Use PNG, JPEG, WebP, or GIF with a safe filename.')
            const match = dataUrl.match(/^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/)
            if (!match || !allowedAssetTypes.has(match[1])) throw new Error('Unsupported image type.')
            const bytes = Buffer.from(match[2], 'base64')
            if (bytes.length > 8_000_000) throw new Error('Images must be smaller than 8 MB.')
            const directory = path.join(assetRoot, slug)
            await mkdir(directory, { recursive: true })
            await writeFile(path.join(directory, filename), bytes, { flag: 'wx' })
            return sendJson(response, 201, { filename, url: `/assets/blog/${slug}/${filename}` })
          }

          if (parts[3] === 'assets' && request.method === 'DELETE' && parts.length === 5) {
            const filename = decodeURIComponent(parts[4])
            if (!assetPattern.test(filename) || path.basename(filename) !== filename) throw new Error('Invalid asset name.')
            await unlink(path.join(assetRoot, slug, filename))
            return sendJson(response, 200, { deleted: filename })
          }

          return sendJson(response, 404, { error: 'Not found.' })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Author operation failed.'
          return sendJson(response, 400, { error: message })
        }
      })
    },
  }
}
