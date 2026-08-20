import type { BlogPost } from '../content/blog'

export function getReturnablePosts(posts: readonly BlogPost[]) {
  const nonFeatured = posts.filter(({ featured }) => !featured)
  return nonFeatured.length > 0 ? nonFeatured : [...posts]
}

export function selectReturnPost(posts: readonly BlogPost[], cursor: number) {
  const returnable = getReturnablePosts(posts)
  if (returnable.length === 0) return null
  return returnable[((cursor % returnable.length) + returnable.length) % returnable.length]
}
