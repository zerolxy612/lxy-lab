import { useEffect, useRef } from 'react'
import { contactLinks } from '../content/contact'
import { experienceTimeline } from '../content/experience'
import { profile } from '../content/profile'
import { selectedProjects } from '../content/projects'

export type VisitorEntryView = 'closed' | 'choice' | 'briefing'

interface VisitorEntryProps {
  view: VisitorEntryView
  onOpenBriefing: () => void
  onExplore: () => void
}

export function VisitorEntry({ view, onOpenBriefing, onExplore }: VisitorEntryProps) {
  const layer = useRef<HTMLDivElement>(null)
  const briefingButton = useRef<HTMLButtonElement>(null)
  const exploreButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (view === 'closed') return

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const initialFocus = view === 'choice' ? briefingButton.current : layer.current
    initialFocus?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (view === 'choice' && !event.repeat) {
        if (event.key === '1' || event.key.toLowerCase() === 'q') {
          event.preventDefault()
          onOpenBriefing()
          return
        }
        if (event.key === '2' || event.key.toLowerCase() === 'e') {
          event.preventDefault()
          onExplore()
          return
        }
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        onExplore()
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
      if (view !== 'briefing') previousFocus?.focus()
    }
  }, [onExplore, onOpenBriefing, view])

  if (view === 'closed') return null

  if (view === 'choice') {
    return (
      <div ref={layer} className="visitor-entry" role="dialog" aria-modal="true" aria-labelledby="visitor-entry-title">
        <div className="visitor-entry__scan" aria-hidden="true" />
        <section className="visitor-entry__manifest">
          <header>
            <span>VISITOR ROUTING / 07</span>
            <i>LAB-01 · ACCESS GRANTED</i>
          </header>
          <div className="visitor-entry__heading">
            <p>Welcome, visitor.</p>
            <h2 id="visitor-entry-title">Choose how this visit unfolds.</h2>
            <small>A concise briefing or the room at your own pace.</small>
          </div>
          <div className="visitor-entry__routes">
            <button ref={briefingButton} type="button" data-route="briefing" onClick={onOpenBriefing}>
              <span className="visitor-entry__route-number">01</span>
              <span className="visitor-entry__route-copy">
                <b>Quick briefing</b>
                <small>About, selected work, CV snapshot, and contact.</small>
              </span>
              <span className="visitor-entry__route-meta">
                <i>~90 sec</i>
                <kbd>Q</kbd>
              </span>
            </button>
            <button ref={exploreButton} type="button" data-route="explore" onClick={onExplore}>
              <span className="visitor-entry__route-number">02</span>
              <span className="visitor-entry__route-copy">
                <b className="visitor-entry__desktop-copy">Explore the lab</b>
                <b className="visitor-entry__mobile-copy">Browse lab stations</b>
                <small className="visitor-entry__desktop-copy">Walk the room, meet its characters, and follow the signals.</small>
                <small className="visitor-entry__mobile-copy">Open any station without steering the character.</small>
              </span>
              <span className="visitor-entry__route-meta">
                <i>Open route</i>
                <kbd>E</kbd>
              </span>
            </button>
          </div>
          <footer>
            <span>↑↓ Select route</span>
            <span>Esc enters exploration</span>
          </footer>
        </section>
      </div>
    )
  }

  return (
    <div
      ref={layer}
      className="visitor-entry visitor-entry--briefing"
      role="dialog"
      aria-modal="true"
      aria-labelledby="visitor-briefing-title"
      tabIndex={-1}
    >
      <article className="visitor-briefing">
        <aside className="visitor-briefing__rail" aria-label="Briefing index">
          <span>VISITOR FILE</span>
          <b>XY<br />/07</b>
          <nav>
            <a href="#brief-about">01 About</a>
            <a href="#brief-work">02 Work</a>
            <a href="#brief-cv">03 CV</a>
            <a href="#brief-contact">04 Contact</a>
          </nav>
          <i>PUBLIC RECORD</i>
        </aside>

        <div className="visitor-briefing__document">
          <header className="visitor-briefing__topline">
            <span>QUICK BRIEFING / ~90 SEC</span>
            <button type="button" onClick={onExplore}>Close <kbd>Esc</kbd></button>
          </header>

          <section id="brief-about" className="visitor-briefing__hero">
            <p>AI APPLICATION ENGINEER</p>
            <h2 id="visitor-briefing-title">{profile.name}</h2>
            <strong>{profile.introduction}</strong>
            <p>{profile.currentFocus}</p>
            <ul aria-label="Core capabilities">
              {profile.capabilities.map((capability) => <li key={capability}>{capability}</li>)}
            </ul>
          </section>

          <section id="brief-work" className="visitor-briefing__section">
            <header><span>02</span><h3>Selected work</h3></header>
            <div className="visitor-briefing__projects">
              {selectedProjects.map((project) => (
                <article key={project.id}>
                  <span>{project.period} / {project.index}</span>
                  <h4>{project.name}</h4>
                  <p>{project.summary}</p>
                  <strong>{project.ownership}</strong>
                </article>
              ))}
            </div>
          </section>

          <section id="brief-cv" className="visitor-briefing__section">
            <header><span>03</span><h3>CV snapshot</h3></header>
            <div className="visitor-briefing__timeline">
              {experienceTimeline.map((entry) => (
                <article key={`${entry.period}-${entry.organization}`}>
                  <span>{entry.period}</span>
                  <div>
                    <h4>{entry.organization}</h4>
                    <strong>{entry.role}</strong>
                    <p>{entry.context}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="brief-contact" className="visitor-briefing__section visitor-briefing__contact">
            <header><span>04</span><h3>Open a channel</h3></header>
            <div>
              {contactLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'me noopener noreferrer' : undefined}
                >
                  <span>{link.label}</span>
                  <strong>{link.display}</strong>
                  <i aria-hidden="true">↗</i>
                </a>
              ))}
            </div>
          </section>
        </div>

        <footer className="visitor-briefing__continue">
          <span>Briefing complete · The room remains yours to explore.</span>
          <button type="button" onClick={onExplore}>Continue exploring the lab <i aria-hidden="true">→</i></button>
        </footer>
      </article>
    </div>
  )
}
