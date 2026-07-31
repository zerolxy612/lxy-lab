import { selectedProjects } from '../content/projects'

export function SelectedWork() {
  return (
    <section className="selected-work" aria-label="Selected project field notes">
      <div className="selected-work__context">
        <span>Public-safe archive</span>
        <p>Two shipped systems. Open a field note for ownership, decisions, and delivery context.</p>
      </div>

      <div className="project-list">
        {selectedProjects.map((project) => (
          <article key={project.id} data-project={project.id}>
            <div className="project-list__heading">
              <span>{project.index} / {project.period}</span>
              <i aria-hidden="true">{project.id === 'ton-web3-game' ? 'GAME SYSTEM' : 'AI WORKFLOW'}</i>
            </div>
            <h3>{project.name}</h3>
            <p className="project-list__type">{project.type}</p>
            <p>{project.summary}</p>

            <dl className="project-facts">
              <div>
                <dt>Ownership</dt>
                <dd>{project.ownership}</dd>
              </div>
              <div>
                <dt>System</dt>
                <dd>{project.signal}</dd>
              </div>
            </dl>

            <details className="project-note">
              <summary>
                Inspect field note
                <i aria-hidden="true">＋</i>
              </summary>
              <div className="project-note__body">
                <section>
                  <span>Challenge</span>
                  <p>{project.challenge}</p>
                </section>
                <section>
                  <span>Engineering decisions</span>
                  <ul>
                    {project.decisions.map((decision) => <li key={decision}>{decision}</li>)}
                  </ul>
                </section>
                <section>
                  <span>Delivery</span>
                  <p>{project.outcome}</p>
                </section>
                <p className="project-note__boundary">
                  <span>Disclosure</span>
                  {project.publicBoundary}
                </p>
              </div>
            </details>
          </article>
        ))}
      </div>
    </section>
  )
}
