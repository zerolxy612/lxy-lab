export interface AuthorDocument {
  slug: string
  index: string
  title: string
  summary: string
  category: string
  published: string
  readingTime: string
  catalogSignal: string
  featured: boolean
  draft: boolean
  body: string
}

export interface AuthorPostSummary {
  slug: string
  index: string
  title: string
  category: string
  published: string
  featured: boolean
  draft: boolean
}

export interface AuthorPostResponse {
  document: AuthorDocument
  assets: string[]
}

export interface AuthorTrashSummary {
  id: string
  slug: string
  index: string
  title: string
  deletedAt: string
}
