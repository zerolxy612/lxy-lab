import { useState } from 'react'
import { selectedProjects } from '../content/projects'

type ProjectChannel = 'brief' | 'system' | 'decisions' | 'outcome'

const channels: readonly { id: ProjectChannel; label: string }[] = [
  { id: 'brief', label: 'Brief' },
  { id: 'system', label: 'System' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'outcome', label: 'Outcome' },
]

export function SelectedWork() {
  const [activeProject, setActiveProject] = useState(0)
  const [activeChannel, setActiveChannel] = useState<ProjectChannel>('brief')
  const project = selectedProjects[activeProject]

  const selectProject = (index: number) => {
    setActiveProject(index)
    setActiveChannel('brief')
  }

  return (
    <section className="work-console" aria-label="Selected project diagnostic console">
      <header className="work-console__header">
        <div>
          <span>DUAL-BAY PROJECT READER</span>
          <p>Select a shipped system, then inspect one channel.</p>
        </div>
        <i>2 MODULES ONLINE</i>
      </header>

      <div className="work-cartridges" role="group" aria-label="Project modules">
        {selectedProjects.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={activeProject === index}
            aria-controls="project-diagnostic"
            onClick={() => selectProject(index)}
          >
            <span>{item.index}</span>
            <strong>{item.name}</strong>
            <small>{item.period}</small>
            <i aria-hidden="true">{activeProject === index ? 'LOADED' : 'INSERT'}</i>
          </button>
        ))}
      </div>

      <article id="project-diagnostic" className="project-diagnostic" aria-live="polite">
        <header>
          <div>
            <span>{project.type}</span>
            <h3>{project.name}</h3>
          </div>
          <b>{project.index}</b>
        </header>

        <nav className="project-channels" aria-label={`${project.name} record channels`}>
          {channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              aria-pressed={activeChannel === channel.id}
              onClick={() => setActiveChannel(channel.id)}
            >
              {channel.label}
            </button>
          ))}
        </nav>

        <div className="project-channel" aria-live="polite">
          {activeChannel === 'brief' && (
            <>
              <span>What shipped</span>
              <p className="project-channel__lead">{project.summary}</p>
              <dl>
                <div><dt>Ownership</dt><dd>{project.ownership}</dd></div>
                <div><dt>Disclosure</dt><dd>{project.publicBoundary}</dd></div>
              </dl>
            </>
          )}
          {activeChannel === 'system' && (
            <>
              <span>System trace</span>
              <code>{project.signal}</code>
              <p>{project.challenge}</p>
            </>
          )}
          {activeChannel === 'decisions' && (
            <>
              <span>Engineering decisions</span>
              <ol>{project.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ol>
            </>
          )}
          {activeChannel === 'outcome' && (
            <>
              <span>Delivered result</span>
              <p className="project-channel__outcome">{project.outcome}</p>
            </>
          )}
        </div>
      </article>
    </section>
  )
}
