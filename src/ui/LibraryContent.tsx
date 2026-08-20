import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { blogPostBySlug, blogPosts } from '../content/blog'
import { restoreFocus } from './focusReturn'
import { getCatalogCategories, selectCatalogPosts } from './libraryCatalog'
import type { CatalogSort } from './libraryCatalog'

export type LibrarySurface =
  | { type: 'catalog' }
  | { type: 'article'; slug: string; presentation: 'desk' | 'standalone' }
  | null

interface LibraryContentProps {
  surface: LibrarySurface
  returnFocusRef: RefObject<HTMLElement | null>
  onClose: () => void
  onOpenArticle: (slug: string, presentation?: 'desk' | 'standalone') => void
}

export function LibraryContent({
  surface,
  returnFocusRef,
  onClose,
  onOpenArticle,
}: LibraryContentProps) {
  const layer = useRef<HTMLElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const [catalogQuery, setCatalogQuery] = useState('')
  const [catalogCategory, setCatalogCategory] = useState('All records')
  const [catalogSort, setCatalogSort] = useState<CatalogSort>('recommended')
  const catalogCategories = useMemo(() => getCatalogCategories(blogPosts), [])
  const catalogPosts = useMemo(
    () => selectCatalogPosts(blogPosts, catalogQuery, catalogCategory, catalogSort),
    [catalogCategory, catalogQuery, catalogSort],
  )

  useEffect(() => {
    if (!surface) return
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const fallbackFocus = returnFocusRef.current
    closeButton.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isEditing = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement
        || (target instanceof HTMLElement && target.isContentEditable)
      if (surface.type === 'catalog' && event.key === '/' && !isEditing) {
        event.preventDefault()
        searchInput.current?.focus()
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = layer.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      restoreFocus(previousFocus, fallbackFocus)
    }
  }, [onClose, returnFocusRef, surface])

  if (!surface) return null

  if (surface.type === 'catalog') {
    return (
      <aside
        ref={layer}
        className="library-catalog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-catalog-title"
      >
        <header>
          <div>
            <span>ARCHIVE LIBRARY / CATALOG</span>
            <h2 id="library-catalog-title">Reading index</h2>
          </div>
          <button ref={closeButton} type="button" onClick={onClose}>Close <kbd>Esc</kbd></button>
        </header>
        <p>The first shelf holds {blogPosts.length} public field notes. Search the decisions, or narrow the archive by classification.</p>
        <section className="library-catalog__controls" aria-label="Catalog controls">
          <label className="library-catalog__search">
            <span>Search records</span>
            <span>
              <input
                ref={searchInput}
                type="search"
                aria-label="Search records"
                value={catalogQuery}
                placeholder="Title, subject, or decision"
                onChange={(event) => setCatalogQuery(event.target.value)}
              />
              <kbd>/</kbd>
            </span>
          </label>
          <label className="library-catalog__sort">
            <span>Sequence</span>
            <select aria-label="Sequence" value={catalogSort} onChange={(event) => setCatalogSort(event.target.value as CatalogSort)}>
              <option value="recommended">Recommended</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
          <div className="library-catalog__categories" aria-label="Filter by classification">
            {['All records', ...catalogCategories].map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={catalogCategory === category}
                onClick={() => setCatalogCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="library-catalog__results" aria-live="polite">
            <span>{catalogPosts.length} {catalogPosts.length === 1 ? 'record' : 'records'} located</span>
            {(catalogQuery || catalogCategory !== 'All records') && (
              <button type="button" onClick={() => { setCatalogQuery(''); setCatalogCategory('All records') }}>Clear filters</button>
            )}
          </div>
        </section>
        <div className="library-catalog__list">
          {catalogPosts.map((post) => (
            <button
              key={post.slug}
              type="button"
              className={post.featured ? 'is-featured' : undefined}
              onClick={() => onOpenArticle(post.slug)}
            >
              <span className="library-catalog__record">
                <b>{post.index}</b>
                <small>{post.readingTime}</small>
                <small>{post.published}</small>
              </span>
              <span className="library-catalog__entry">
                <i>{post.featured ? `Featured / ${post.category}` : post.category}</i>
                <b>{post.title}</b>
                <small>{post.summary}</small>
                <strong>{post.catalogSignal}</strong>
              </span>
              <i className="library-catalog__open" aria-hidden="true">→</i>
            </button>
          ))}
          {catalogPosts.length === 0 && (
            <div className="library-catalog__empty">
              <span>NO MATCHING SIGNAL</span>
              <strong>Nothing in this shelf matches those coordinates.</strong>
              <button type="button" onClick={() => { setCatalogQuery(''); setCatalogCategory('All records'); searchInput.current?.focus() }}>
                Reset catalog
              </button>
            </div>
          )}
        </div>
        <footer>
          <span>CATALOG STATUS</span>
          <b>{catalogPosts.length} SHOWN / {blogPosts.length} PUBLIC NOTES</b>
        </footer>
      </aside>
    )
  }

  const post = blogPostBySlug[surface.slug]
  if (!post) return null
  const postIndex = blogPosts.findIndex(({ slug }) => slug === post.slug)
  const previousPost = blogPosts[(postIndex - 1 + blogPosts.length) % blogPosts.length]
  const nextPost = blogPosts[(postIndex + 1) % blogPosts.length]
  const sectionBodies = post.body.split(/^##\s+/m).slice(1).map((section) => {
    const [heading, ...content] = section.split('\n')
    return { heading: heading.trim(), content: content.join('\n').trim() }
  })

  return (
    <article
      ref={layer}
      className="blog-reader"
      data-presentation={surface.presentation}
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-reader-title"
    >
      <aside className="blog-reader__room" aria-label="Archive reading desk">
        <header>
          <span>ARCHIVE LIBRARY</span>
          <strong>READING DESK / 01</strong>
        </header>
        <div className="blog-reader__room-view" aria-hidden="true">
          <span>SESSION HELD</span>
        </div>
        <div className="blog-reader__record">
          <span>{post.index}</span>
          <dl>
            <div><dt>Published</dt><dd>{post.published}</dd></div>
            <div><dt>Reading time</dt><dd>{post.readingTime}</dd></div>
            <div><dt>Classification</dt><dd>Public note</dd></div>
          </dl>
        </div>
        <nav aria-label="Article sections">
          {post.sections.map((section, index) => (
            <a key={section.heading} href={`#record-section-${index + 1}`}>
              <span>0{index + 1}</span>
              {section.heading}
            </a>
          ))}
        </nav>
        <i>ROOM PAUSED / RECORD OPEN</i>
      </aside>
      <section className="blog-reader__desk">
        <header className="blog-reader__topline">
          <span>{post.category} / {post.index}</span>
          <button ref={closeButton} type="button" onClick={onClose}>Return to library <kbd>Esc</kbd></button>
        </header>
        <div className="blog-reader__document" tabIndex={-1}>
          <header>
            <p>{post.featured ? 'Featured field note' : 'Public field note'}</p>
            <h1 id="blog-reader-title">{post.title}</h1>
            <strong>{post.summary}</strong>
            <blockquote>{post.catalogSignal}</blockquote>
          </header>
          {sectionBodies.map((section, index) => (
            <section key={section.heading} id={`record-section-${index + 1}`}>
              <span>0{index + 1}</span>
              <div>
                <h2>{section.heading}</h2>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ children, ...props }) => <a {...props} target="_blank" rel="noreferrer">{children}</a>,
                    img: ({ alt, ...props }) => (
                      <span className="blog-reader__image">
                        <img {...props} alt={alt ?? ''} />
                        {alt && <small>{alt}</small>}
                      </span>
                    ),
                  }}
                >
                  {section.content}
                </ReactMarkdown>
              </div>
            </section>
          ))}
          <footer>
            <span>END OF {post.index}</span>
            <div className="blog-reader__navigation">
              <button type="button" className="blog-reader__return" onClick={onClose}>Return to library</button>
              {previousPost.slug !== post.slug && <button type="button" onClick={() => onOpenArticle(previousPost.slug, surface.presentation)}><small>Previous record</small><strong>← {previousPost.index}</strong><span>{previousPost.title} · {previousPost.readingTime}</span></button>}
              {nextPost.slug !== post.slug && <button type="button" onClick={() => onOpenArticle(nextPost.slug, surface.presentation)}><small>Next record</small><strong>{nextPost.index} →</strong><span>{nextPost.title} · {nextPost.readingTime}</span></button>}
            </div>
          </footer>
        </div>
      </section>
    </article>
  )
}
