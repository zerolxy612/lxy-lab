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
  catalogSignal: string
  featured?: boolean
  sections: readonly BlogSection[]
}

export const blogPosts: readonly BlogPost[] = [
  {
    slug: 'why-this-lab-uses-two-runtimes',
    index: 'LOG-001',
    title: 'Why This Lab Uses Two Runtimes',
    summary: 'Why React owns readable interface state while Phaser owns movement and space.',
    category: 'Architecture',
    published: '2026-08-11',
    readingTime: '4 min',
    catalogSignal: 'Two runtimes, one deliberate boundary.',
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
  {
    slug: 'designing-npc-dialogue-without-an-llm',
    index: 'LOG-002',
    title: 'Designing NPC Dialogue Without an LLM',
    summary: 'How authored state and room context give ROOK and MIRA continuity without an always-online model.',
    category: 'Character Systems',
    published: '2026-08-11',
    readingTime: '5 min',
    catalogSignal: 'Consistency can matter more than infinite dialogue.',
    sections: [
      {
        heading: 'Conversation starts before the dialogue box',
        paragraphs: [
          'ROOK and MIRA are not help widgets waiting to be opened. ROOK patrols the systems bay. MIRA keeps watch near the archive. When the player comes close, each character offers a short ambient line without pausing the room.',
          'Those small remarks do more world-building than a welcome message could. The characters seem occupied before the visitor arrives, which makes a later conversation feel like an interruption of their night rather than the launch of a feature.',
        ],
      },
      {
        heading: 'Authored does not have to mean static',
        paragraphs: [
          'Each NPC has a first meeting, repeat openings, a familiar response, rotating ambient lines, and a few reactions to what the visitor has already explored. The state is tiny, but it gives an encounter a past.',
          'This is deliberate variability rather than infinite variability. Every line can preserve the character voice, remain safe for a public portfolio, and arrive instantly without turning the room into a loading indicator.',
        ],
      },
      {
        heading: 'A useful choice is not always a useful question',
        paragraphs: [
          'Early versions treated both characters like career FAQ terminals. The answers were accurate, but the conversations felt like another navigation menu. The better version lets ROOK complain about maintenance variables and lets MIRA discuss omissions, old records, and the strange habits of a night archive.',
          'Both characters also accept silence. “Say nothing” and “Just passing through” are real choices with authored responses. A game conversation becomes more believable when the player is allowed to be curious, awkward, or briefly uninterested.',
        ],
      },
      {
        heading: 'Use uncertainty where it adds something',
        paragraphs: [
          'A live language model could produce more sentences, but more sentences are not automatically more character. For this room, reliable timing, a consistent voice, keyboard accessibility, offline behavior, and clear public boundaries are more valuable than unlimited improvisation.',
          'That decision is not a rejection of AI. It is a choice about where uncertainty belongs. If a future version can answer from verified public material, show its sources, protect private work, and still sound like ROOK or MIRA, then generation may add something the authored system cannot. Until then, restraint is part of the design.',
        ],
      },
    ],
  },
  {
    slug: 'the-elevator-is-part-of-the-portfolio',
    index: 'LOG-003',
    title: 'The Elevator Is Part of the Portfolio',
    summary: 'How a five-second arrival sequence turns navigation into part of the portfolio.',
    category: 'Experience Design',
    published: '2026-08-12',
    readingTime: '5 min',
    catalogSignal: 'The path through the work is part of the work.',
    featured: true,
    sections: [
      {
        heading: 'An entrance makes a promise',
        paragraphs: [
          'The elevator began as a transition between a conventional landing screen and the laboratory. That made it easy to treat as packaging: fade to black, show some system text, open the doors, and get out of the way. But the first few seconds are already teaching the visitor what kind of place this is.',
          'A hidden lift, a descending floor display, and a glimpse of the same small character who will soon walk through the lab establish a simple fiction. You did not open a themed portfolio page. You arrived somewhere, and the person on screen arrived with you.',
        ],
      },
      {
        heading: 'Continuity matters more than spectacle',
        paragraphs: [
          'The earliest version had plenty of motion, but the final cut into the lab felt abrupt. The doors belonged to one composition and the room behind them belonged to another. More particles could not repair that break.',
          'The useful polish came from continuity: holding the character in a believable position, carrying the cyan floor light through the doorway, revealing the destination behind the moving doors, and letting the last elevator motion become the first moment in the lab. The transition became quieter and more convincing at the same time.',
        ],
      },
      {
        heading: 'Ritual should never become a toll',
        paragraphs: [
          'A cinematic entrance is enjoyable once and irritating when it blocks every return. The sequence therefore belongs to the browser session rather than to a permanent profile. It can play on the first visit in a tab, disappear on later room changes, and return naturally in a future session.',
          'Enter confirms the ride, Escape skips it, reduced-motion visitors bypass unnecessary movement, and direct article links remain direct. These exits do not weaken the fiction. They make the invitation respectful enough that the animation can afford to have personality.',
        ],
      },
      {
        heading: 'The portfolio includes the path through it',
        paragraphs: [
          'A portfolio usually treats navigation as neutral plumbing around the work. Here, navigation is one of the works. The elevator shows decisions about pacing, input, state, sound cues, scene boundaries, and visual storytelling before any project panel is opened.',
          'That does not mean every link needs a ceremony. It means the route can carry meaning when the destination is a world. The elevator earns its five seconds by answering a question the lab cannot answer alone: what did it feel like to cross the threshold?',
        ],
      },
    ],
  },
]

export const blogPostBySlug = Object.fromEntries(
  blogPosts.map((post) => [post.slug, post]),
) as Record<string, BlogPost>

export const featuredBlogPost = blogPosts.find(({ featured }) => featured) ?? blogPosts[0]

export function getBlogSlug(pathname: string) {
  const match = pathname.match(/^\/blog\/([^/]+)\/?$/)
  return match?.[1] ?? null
}
