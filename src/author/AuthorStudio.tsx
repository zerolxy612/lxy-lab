import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { AuthorDocument, AuthorPostResponse, AuthorPostSummary, AuthorTrashSummary } from './authorTypes'

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
  })
  const payload = await response.json() as T & { error?: string }
  if (!response.ok) throw new Error(payload.error ?? 'The author operation failed.')
  return payload
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image.'))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image.'))
    reader.readAsDataURL(file)
  })
}

export function AuthorStudio() {
  const [posts, setPosts] = useState<AuthorPostSummary[]>([])
  const [trash, setTrash] = useState<AuthorTrashSummary[]>([])
  const [document, setDocument] = useState<AuthorDocument | null>(null)
  const [assets, setAssets] = useState<string[]>([])
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState('Local workspace ready.')
  const [createTitle, setCreateTitle] = useState('')
  const [createSlug, setCreateSlug] = useState('')

  const loadPosts = useCallback(async (preferredSlug?: string) => {
    const [payload, trashPayload] = await Promise.all([
      requestJson<{ posts: AuthorPostSummary[] }>('/__author/posts'),
      requestJson<{ trash: AuthorTrashSummary[] }>('/__author/trash'),
    ])
    setPosts(payload.posts)
    setTrash(trashPayload.trash)
    const slug = preferredSlug ?? document?.slug ?? payload.posts[0]?.slug
    if (!slug) {
      setDocument(null)
      setAssets([])
      return
    }
    const post = await requestJson<AuthorPostResponse>(`/__author/posts/${slug}`)
    setDocument(post.document)
    setAssets(post.assets)
    setDirty(false)
  }, [document?.slug])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadPosts().catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : 'Could not load articles.'))
    }, 0)
    return () => window.clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const update = <Key extends keyof AuthorDocument>(key: Key, value: AuthorDocument[Key]) => {
    setDocument((current) => current ? { ...current, [key]: value } : current)
    setDirty(true)
    setNotice('Unsaved changes.')
  }

  const selectPost = async (slug: string) => {
    if (slug === document?.slug) return
    if (dirty && !window.confirm('Discard unsaved changes and open another article?')) return
    setBusy(true)
    setError(null)
    try {
      const post = await requestJson<AuthorPostResponse>(`/__author/posts/${slug}`)
      setDocument(post.document)
      setAssets(post.assets)
      setDirty(false)
      setNotice(post.document.draft ? 'Draft opened.' : 'Published record opened.')
    } catch (selectionError) {
      setError(selectionError instanceof Error ? selectionError.message : 'Could not open article.')
    } finally {
      setBusy(false)
    }
  }

  const createPost = async () => {
    if (!createTitle.trim() || !createSlug.trim()) return setError('Enter a title and slug.')
    setBusy(true)
    setError(null)
    try {
      const post = await requestJson<AuthorPostResponse>('/__author/posts', {
        method: 'POST',
        body: JSON.stringify({ title: createTitle, slug: createSlug }),
      })
      setCreateTitle('')
      setCreateSlug('')
      await loadPosts(post.document.slug)
      setNotice(`${post.document.index} created as a draft.`)
    } catch (creationError) {
      setError(creationError instanceof Error ? creationError.message : 'Could not create article.')
    } finally {
      setBusy(false)
    }
  }

  const savePost = async () => {
    if (!document) return
    setBusy(true)
    setError(null)
    try {
      await requestJson(`/__author/posts/${document.slug}`, {
        method: 'PUT',
        body: JSON.stringify(document),
      })
      await loadPosts(document.slug)
      setNotice(document.draft ? 'Draft saved.' : 'Published content saved to the repository.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save article.')
    } finally {
      setBusy(false)
    }
  }

  const deletePost = async () => {
    if (!document || !window.confirm(`Move ${document.index} to the recoverable trash?`)) return
    setBusy(true)
    setError(null)
    try {
      const payload = await requestJson<{ recoverableFrom: string }>(`/__author/posts/${document.slug}`, { method: 'DELETE' })
      setDocument(null)
      setAssets([])
      await loadPosts()
      setNotice(`Moved to ${payload.recoverableFrom}.`)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete article.')
    } finally {
      setBusy(false)
    }
  }

  const uploadAsset = async (file: File) => {
    if (!document) return
    setBusy(true)
    setError(null)
    try {
      const dataUrl = await readAsDataUrl(file)
      const payload = await requestJson<{ filename: string; url: string }>(`/__author/posts/${document.slug}/assets`, {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, dataUrl }),
      })
      setAssets((current) => [...current, payload.filename])
      update('body', `${document.body.trim()}\n\n![Describe this image](${payload.url})`)
      setNotice(`${payload.filename} uploaded and inserted. Save the article to keep the reference.`)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload image.')
    } finally {
      setBusy(false)
    }
  }

  const deleteAsset = async (filename: string) => {
    if (!document || !window.confirm(`Delete ${filename}? Remove its Markdown reference as well.`)) return
    setBusy(true)
    setError(null)
    try {
      await requestJson(`/__author/posts/${document.slug}/assets/${encodeURIComponent(filename)}`, { method: 'DELETE' })
      setAssets((current) => current.filter((asset) => asset !== filename))
      setNotice(`${filename} deleted.`)
    } catch (assetError) {
      setError(assetError instanceof Error ? assetError.message : 'Could not delete image.')
    } finally {
      setBusy(false)
    }
  }

  const restorePost = async (trashRecord: AuthorTrashSummary) => {
    setBusy(true)
    setError(null)
    try {
      const payload = await requestJson<{ restored: string }>(`/__author/trash/${encodeURIComponent(trashRecord.id)}/restore`, { method: 'POST' })
      await loadPosts(payload.restored)
      setNotice(`${trashRecord.index} restored from trash.`)
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : 'Could not restore article.')
    } finally {
      setBusy(false)
    }
  }

  const publishedCount = posts.filter(({ draft }) => !draft).length
  const previewSections = useMemo(() => document?.body.match(/^##\s+.+$/gm)?.length ?? 0, [document?.body])

  return (
    <main className="author-studio">
      <header className="author-studio__topbar">
        <div>
          <span>LOCAL AUTHOR SYSTEM / A–02</span>
          <h1>Archive Publisher</h1>
        </div>
        <div className="author-studio__status" aria-live="polite">
          <span>{publishedCount} published / {posts.length - publishedCount} drafts</span>
          <strong data-dirty={dirty}>{dirty ? 'UNSAVED' : 'SAVED'}</strong>
          <a href="/library" target="_blank">Open library ↗</a>
        </div>
      </header>

      <div className="author-studio__workspace">
        <aside className="author-studio__index">
          <section className="author-studio__create" aria-labelledby="author-create-title">
            <span>NEW RECORD</span>
            <h2 id="author-create-title">Start as draft</h2>
            <label>
              <span>Title</span>
              <input
                value={createTitle}
                maxLength={120}
                onChange={(event) => {
                  setCreateTitle(event.target.value)
                  if (!createSlug) setCreateSlug(toSlug(event.target.value))
                }}
              />
            </label>
            <label>
              <span>Slug</span>
              <input value={createSlug} pattern="[a-z0-9-]+" onChange={(event) => setCreateSlug(toSlug(event.target.value))} />
            </label>
            <button type="button" disabled={busy || !createTitle || !createSlug} onClick={createPost}>Create draft</button>
          </section>

          <nav aria-label="Article records">
            <span>RECORDS</span>
            {posts.map((post) => (
              <button
                key={post.slug}
                type="button"
                className={post.slug === document?.slug ? 'is-active' : undefined}
                onClick={() => selectPost(post.slug)}
              >
                <span>{post.index}</span>
                <strong>{post.title}</strong>
                <small>{post.draft ? 'Draft' : post.featured ? 'Published / Featured' : 'Published'}</small>
              </button>
            ))}
          </nav>
          <section className="author-studio__trash">
            <span>RECOVERABLE TRASH / {trash.length}</span>
            {trash.length === 0 ? <p>Deleted records appear here.</p> : trash.map((record) => (
              <div key={record.id}>
                <span>{record.index}</span>
                <strong>{record.title}</strong>
                <small>{new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.deletedAt))}</small>
                <button type="button" disabled={busy} onClick={() => restorePost(record)}>Restore</button>
              </div>
            ))}
          </section>
        </aside>

        {document ? (
          <section className="author-studio__editor">
            <header>
              <div>
                <span>{document.index} / {document.draft ? 'DRAFT' : 'PUBLIC'}</span>
                <h2>{document.title}</h2>
              </div>
              <div>
                <button type="button" className="is-danger" disabled={busy} onClick={deletePost}>Move to trash</button>
                <button type="button" disabled={busy || !dirty} onClick={savePost}>{busy ? 'Working…' : 'Save changes'}</button>
              </div>
            </header>

            {(error || notice) && (
              <p className="author-studio__message" data-error={Boolean(error)}>{error ?? notice}</p>
            )}

            <div className="author-studio__fields">
              <label className="is-wide"><span>Title</span><input value={document.title} maxLength={120} onChange={(event) => update('title', event.target.value)} /></label>
              <label><span>Record</span><input value={document.index} pattern="LOG-[0-9]{3,}" onChange={(event) => update('index', event.target.value.toUpperCase())} /></label>
              <label><span>Category</span><input value={document.category} onChange={(event) => update('category', event.target.value)} /></label>
              <label><span>Published</span><input type="date" value={document.published} onChange={(event) => update('published', event.target.value)} /></label>
              <label><span>Reading time</span><input value={document.readingTime} onChange={(event) => update('readingTime', event.target.value)} /></label>
              <label className="is-wide"><span>Summary</span><textarea rows={2} maxLength={240} value={document.summary} onChange={(event) => update('summary', event.target.value)} /></label>
              <label className="is-wide"><span>Core signal</span><input maxLength={90} value={document.catalogSignal} onChange={(event) => update('catalogSignal', event.target.value)} /></label>
              <div className="author-studio__toggles is-wide">
                <label><input type="checkbox" checked={!document.draft} onChange={(event) => update('draft', !event.target.checked)} /><span>Published</span></label>
                <label><input type="checkbox" checked={document.featured} onChange={(event) => update('featured', event.target.checked)} /><span>Featured reading</span></label>
                <small>Publishing writes immediately after Save. Only one public record can be featured.</small>
              </div>
            </div>

            <div className="author-studio__body">
              <div className="author-studio__markdown">
                <header><span>MARKDOWN</span><small>{previewSections} sections</small></header>
                <textarea
                  aria-label="Article Markdown"
                  value={document.body}
                  spellCheck
                  onChange={(event) => update('body', event.target.value)}
                />
              </div>
              <article className="author-studio__preview">
                <header>
                  <span>{document.category} / {document.index}</span>
                  <h1>{document.title || 'Untitled record'}</h1>
                  <strong>{document.summary}</strong>
                </header>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{document.body}</ReactMarkdown>
              </article>
            </div>

            <section className="author-studio__assets">
              <header><div><span>ARTICLE MEDIA</span><h3>Images</h3></div><label><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadAsset(file); event.target.value = '' }} />Upload image</label></header>
              <div>
                {assets.length === 0 ? <p>No article images yet. Uploading inserts Markdown at the end of the draft.</p> : assets.map((asset) => (
                  <figure key={asset}>
                    <img src={`/assets/blog/${document.slug}/${asset}`} alt="" />
                    <figcaption><span>{asset}</span><button type="button" onClick={() => deleteAsset(asset)}>Delete</button></figcaption>
                  </figure>
                ))}
              </div>
            </section>
          </section>
        ) : (
          <section className="author-studio__empty"><span>NO RECORD SELECTED</span><h2>Create the first draft.</h2></section>
        )}
      </div>
    </main>
  )
}
