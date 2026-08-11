export interface BlogSection {
  heading: string
  paragraphs: readonly string[]
}

export interface BlogPost {
  slug: string
  index: string
  title: string
  summary: string
  category: string
  published: string
  readingTime: string
  sections: readonly BlogSection[]
}

export const blogPosts: readonly BlogPost[] = [
  {
    slug: 'why-this-lab-uses-two-runtimes',
    index: 'LOG-001',
    title: 'Why This Lab Uses Two Runtimes',
    summary: 'A short architecture note on letting React own readable interface state while Phaser owns movement and space.',
    category: 'Frontend & Interaction',
    published: '2026-08-11',
    readingTime: '4 min',
    sections: [
      {
        heading: 'Space and interface are different jobs',
        paragraphs: [
          'The laboratory needs movement, collision, depth, and environmental animation. The portfolio content needs semantic headings, links, keyboard focus, responsive layouts, and reliable reading. Treating those as the same rendering problem would make both sides weaker.',
          'Phaser therefore owns the room as a place. React owns the information visitors need to understand and use.',
        ],
      },
      {
        heading: 'The bridge stays deliberately small',
        paragraphs: [
          'The two runtimes exchange typed events: a station becomes nearby, an NPC is activated, a panel opens, or a room transition is requested. Neither side reaches into the other side’s internal state.',
          'That boundary keeps the game layer replaceable and the public content accessible even when Canvas is unavailable.',
        ],
      },
      {
        heading: 'The result should feel like one product',
        paragraphs: [
          'Architecture is only useful when it improves the visit. Movement pauses when readable content opens. Focus returns to the correct place when it closes. Mobile visitors get the same information without being forced through desktop controls.',
          'The goal is not to demonstrate two frameworks. It is to make an explorable portfolio and a dependable website behave as one experience.',
        ],
      },
    ],
  },
]

export const blogPostBySlug = Object.fromEntries(
  blogPosts.map((post) => [post.slug, post]),
) as Record<string, BlogPost>

export function getBlogSlug(pathname: string) {
  const match = pathname.match(/^\/blog\/([^/]+)\/?$/)
  return match?.[1] ?? null
}
