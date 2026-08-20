import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles/global.css'

const root = createRoot(document.getElementById('root')!)

if (window.location.pathname === '/author') {
  if (import.meta.env.DEV) {
    import('./author/AuthorStudio').then(({ AuthorStudio }) => {
      root.render(<StrictMode><AuthorStudio /></StrictMode>)
    })
  } else {
    root.render(
      <StrictMode>
        <main className="author-unavailable">
          <span>LOCAL AUTHOR SYSTEM</span>
          <h1>Author Studio is not published.</h1>
          <p>Run the project locally with <code>npm run dev</code>, then open <code>/author</code>.</p>
          <a href="/library">Return to Archive Library</a>
        </main>
      </StrictMode>,
    )
  }
} else {
  root.render(<StrictMode><App /></StrictMode>)
}
