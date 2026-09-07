import { useState } from 'react'
import { experiencePrinciples, experienceTimeline } from '../content/experience'

export function ExperienceArchive() {
  const [activeRecord, setActiveRecord] = useState(0)
  const record = experienceTimeline[activeRecord]

  return (
    <div className="experience-archive">
      <section className="archive-cabinet" aria-labelledby="experience-timeline-title">
        <header className="archive-cabinet__header">
          <div>
            <span>PERSONNEL DRAWER / 02</span>
            <h3 id="experience-timeline-title">Pull a field record</h3>
          </div>
          <p>{experienceTimeline.length} public-safe files</p>
        </header>

        <div className="archive-cabinet__drawers" role="group" aria-label="Experience records">
          {experienceTimeline.map((entry, index) => (
            <button
              key={`${entry.period}-${entry.organization}`}
              type="button"
              aria-pressed={activeRecord === index}
              aria-controls="experience-record-sheet"
              onClick={() => setActiveRecord(index)}
            >
              <span>{entry.period}</span>
              <strong>{entry.organization}</strong>
              <small>{entry.role}</small>
              <i aria-hidden="true">{activeRecord === index ? 'OPEN' : 'PULL'}</i>
            </button>
          ))}
        </div>

        <article
          id="experience-record-sheet"
          className="archive-record-sheet"
          role="region"
          aria-label={`${record.organization} experience record`}
          aria-live="polite"
        >
          <header>
            <span>FILE 0{activeRecord + 1}</span>
            <i>{activeRecord === 0 ? 'ACTIVE RECORD' : 'ARCHIVED ROLE'}</i>
          </header>
          <p className="archive-record-sheet__period">{record.period}</p>
          <h4>{record.organization}</h4>
          <strong>{record.role}</strong>
          <p>{record.context}</p>
          <ul aria-label={`${record.organization} focus areas`}>
            {record.focus.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <footer>PUBLIC EXTRACT · INTERNAL DETAILS WITHHELD</footer>
        </article>
      </section>

      <section className="archive-rules" aria-labelledby="experience-principles-title">
        <div className="section-heading">
          <span>RULES</span>
          <h3 id="experience-principles-title">Kept between roles</h3>
        </div>
        <ol>
          {experiencePrinciples.map((principle, index) => (
            <li key={principle}><span>0{index + 1}</span>{principle}</li>
          ))}
        </ol>
      </section>
    </div>
  )
}
