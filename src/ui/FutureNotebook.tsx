import { currentQuestions, independentBuild, researchSignals } from '../content/personal'

export function FutureNotebook() {
  return (
    <div className="future-notebook">
      <section className="future-notebook__lead" aria-labelledby="future-workbench-title">
        <div>
          <span>{independentBuild.index}</span>
          <p>{independentBuild.label}</p>
        </div>
        <h3 id="future-workbench-title">{independentBuild.title}</h3>
        <p>{independentBuild.summary}</p>
        <ul>
          {independentBuild.signals.map((signal) => <li key={signal}>{signal}</li>)}
        </ul>
      </section>

      <section aria-labelledby="future-questions-title">
        <div className="section-heading">
          <span>02</span>
          <h3 id="future-questions-title">Questions on the bench</h3>
        </div>
        <ol className="future-notebook__questions">
          {currentQuestions.map((question, index) => (
            <li key={question}>
              <span>0{index + 1}</span>
              <p>{question}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="future-research-title">
        <div className="section-heading">
          <span>03</span>
          <h3 id="future-research-title">Research transmissions</h3>
        </div>
        <div className="future-notebook__research">
          {researchSignals.map((signal) => (
            <article key={signal.index}>
              <span>{signal.index} · {signal.context}</span>
              <h4>{signal.title}</h4>
              <p>{signal.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
