export interface ProjectSummary {
  id: string
  name: string
  type: string
  summary: string
}

export const selectedProjects: readonly ProjectSummary[] = [
  {
    id: 'interactive-experiences',
    name: 'Interactive Web Experiences',
    type: 'Frontend engineering',
    summary: 'Performance-minded interactive work shaped by product and visual craft.',
  },
  {
    id: 'lexihk',
    name: 'LexiHK',
    type: 'AI product system',
    summary: 'One selected example of applied retrieval and document intelligence work.',
  },
  {
    id: 'experiments',
    name: 'Lab Experiments',
    type: 'Work in progress',
    summary: 'Smaller systems used to test ideas before they become products.',
  },
]
