import {
  experiencePrinciples,
  experienceTimeline,
  publicEvidenceRequirement,
} from '../content/experience'

export function ExperienceArchive() {
  return (
    <div className="experience-archive">
      <section aria-labelledby="experience-timeline-title">
        <div className="section-heading">
          <span>01</span>
          <h3 id="experience-timeline-title">Field record</h3>
        </div>

        <div className="experience-timeline">
          {experienceTimeline.map((entry) => (
            <article key={`${entry.period}-${entry.organization}`}>
              <p className="experience-period">{entry.period}</p>
              <div>
                <h4>{entry.organization}</h4>
                <strong>{entry.role}</strong>
                <p>{entry.context}</p>
                <ul aria-label={`${entry.organization} focus areas`}>
                  {entry.focus.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="experience-principles-title">
        <div className="section-heading">
          <span>02</span>
          <h3 id="experience-principles-title">Working principles</h3>
        </div>
        <ol className="principle-list">
          {experiencePrinciples.map((principle) => <li key={principle}>{principle}</li>)}
        </ol>
      </section>

      <section className="evidence-card" aria-labelledby="experience-evidence-title">
        <div className="section-heading">
          <span>03</span>
          <h3 id="experience-evidence-title">Public evidence</h3>
        </div>
        <div className="evidence-status">
          <span>{publicEvidenceRequirement.statusLabel}</span>
          <strong>{publicEvidenceRequirement.title}</strong>
        </div>
        <p>{publicEvidenceRequirement.description}</p>
        <ul aria-label="Accepted evidence formats">
          {publicEvidenceRequirement.acceptedFormats.map((format) => (
            <li key={format}>{format}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
