import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { blogPostBySlug, blogPosts } from '../content/blog'
import { restoreFocus } from './focusReturn'

export type LibrarySurface =
  | { type: 'catalog' }
  | { type: 'article'; slug: string }
  | null

interface LibraryContentProps {
  surface: LibrarySurface
  returnFocusRef: RefObject<HTMLElement | null>
  onClose: () => void
  onOpenArticle: (slug: string) => void
}

export function LibraryContent({
  surface,
  returnFocusRef,
  onClose,
  onOpenArticle,
}: LibraryContentProps) {
  const layer = useRef<HTMLElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!surface) return
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const fallbackFocus = returnFocusRef.current
    closeButton.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = layer.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
        <p>One public note is wired into this prototype. Future shelves will grow from real writing, not placeholder books.</p>
        <div className="library-catalog__list">
          {blogPosts.map((post) => (
            <button key={post.slug} type="button" onClick={() => onOpenArticle(post.slug)}>
              <span>{post.index}</span>
              <span>
                <b>{post.title}</b>
                <small>{post.summary}</small>
              </span>
              <i>{post.readingTime} →</i>
            </button>
          ))}
        </div>
        <footer>
          <span>CATALOG STATUS</span>
          <b>1 PUBLIC NOTE / PROTOTYPE</b>
        </footer>
      </aside>
    )
  }

  const post = blogPostBySlug[surface.slug]
  if (!post) return null

  return (
    <article
      ref={layer}
      className="blog-reader"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-reader-title"
    >
      <header className="blog-reader__topline">
        <span>ARCHIVE LIBRARY / {post.index}</span>
        <button ref={closeButton} type="button" onClick={onClose}>Return to library <kbd>Esc</kbd></button>
      </header>
      <div className="blog-reader__layout">
        <aside aria-label="Article metadata">
          <span>{post.category}</span>
          <dl>
            <div><dt>Published</dt><dd>{post.published}</dd></div>
            <div><dt>Reading time</dt><dd>{post.readingTime}</dd></div>
            <div><dt>Record</dt><dd>{post.index}</dd></div>
          </dl>
          <i>PUBLIC NOTE</i>
        </aside>
        <div className="blog-reader__document">
          <header>
            <p>{post.category}</p>
            <h1 id="blog-reader-title">{post.title}</h1>
            <strong>{post.summary}</strong>
          </header>
          {post.sections.map((section, index) => (
            <section key={section.heading}>
              <span>0{index + 1}</span>
              <div>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
          <footer>
            <span>END OF RECORD</span>
            <button type="button" onClick={onClose}>Return to Archive Library <i aria-hidden="true">→</i></button>
          </footer>
        </div>
      </div>
    </article>
  )
}
