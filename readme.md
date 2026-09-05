# Xiangyu’s AI Lab

An explorable pixel-art portfolio about AI application engineering, interactive systems, and building production software in Hong Kong.

![Xiangyu beside the Living AI Core in a future Hong Kong laboratory](public/assets/brand/og-xiangyu-ai-lab-v1.png)

## About the project

Xiangyu’s AI Lab turns a personal portfolio into a compact explorable world anchored by one walkable research lab. Visitors can explore five stations with a character or use the always-available World Index to enter the Archive Library and reach the same content directly.

This is a focused interactive website, not a full RPG. Atmosphere creates curiosity; readable project details, accessible navigation, and direct contact routes remain the foundation.

Current stable release: **v0.5 — complete**. The Archive Library is now a **feature-complete v0.7 vertical slice**; the next optional world expansion is the Observatory.

## Highlights

- One 960 × 540 pixel-art laboratory set against a rainy future Hong Kong skyline
- Free four-direction movement with collision and station interaction
- Five formal stations: Lab Companion, Experience Archive, Living AI Core, Selected Work, and Future Gate
- Quick Access and semantic React panels that do not require playing the room
- Content-first mobile layout without a low-quality virtual joystick
- Opt-in procedural ambience with rain, machine hum, and sparse system signals
- Two restrained discovery details connecting the Hong Kong window, Living AI Core, and RAG Pipeline
- Loading-driven cinematic desktop boot sequence with skip and reduced-motion support
- A five-second B1–B7 cyberpunk elevator arrival, with Xiangyu visibly riding into the lab
- A session-aware visitor entry that branches into a 90-second professional briefing or free lab exploration
- Game-style ROOK and MIRA encounters with ambient barks, progressive dialogue, repeat reactions, and mobile adaptation
- Tiled-owned spatial data with tested spawn, collision, and station contracts
- A minimal multi-room registry, session-scoped World Index, and independent Archive Library Phaser scene
- A preserved Archive Wing art and interaction prototype, currently held outside the Main Lab map while its physical placement is redesigned
- A searchable, filterable Blog catalog with stable article routes and connected record navigation
- A low-frequency Library atmosphere with shelf activity, terminal indexing, and a discoverable old-record Return Slot
- Direct, refresh-safe Library, Catalog, and article entries with per-page search/social metadata and optional sitemap generation
- A local-only Author Studio for drafting, previewing, uploading images, publishing, editing, recoverable deletion, and pre-publication checks

## Work represented

The public Selected Work area currently references two professional directions:

- An interactive TON ecosystem Web3 game built with React, TypeScript, and Phaser
- An anonymized government-facing Legal AI application focused on streaming responses, citations, document workflows, and production frontend infrastructure

Sensitive project names, client identities, internal documents, data, and private interfaces are intentionally excluded.

## Technology

- React 19 and TypeScript
- Phaser 3 with Arcade Physics
- Vite 8
- Tiled JSON/TMJ map data
- Web Audio API
- Vitest and ESLint

React owns readable content, navigation, accessibility, contact, and sound preferences. Phaser owns movement, collision, proximity, and room visuals. A small typed event bridge connects the two layers.

## Run locally

Requires Node.js 24.

```bash
nvm use
npm ci
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run blog:check
```

Set `VITE_SITE_URL` to the final public origin before a production deployment to emit canonical URLs, `og:url`, and `sitemap.xml`. See `.env.example` and the Blog authoring guide.

## Controls

- Move: `WASD` or arrow keys
- Interact: `E` or `Space`
- Choose an NPC question: `1`, `2`, or `3`
- Choose an entry route: `Q` / `1` for the briefing, `E` / `2` for exploration
- Collision debug: `F2`
- Close panels / skip intro: `Escape`
- Sound: use the `Ambience` / `SND` control; first visit is always muted

On screens below 900 px, use the Archive Index and Quick Access instead of character controls.

## Project documentation

- [Development roadmap](docs/development-roadmap.md)
- [Pixel-art production specification](docs/pixel-art-spec.md)
- [Tiled map contract](docs/tiled-map-schema.md)
- [Asset provenance ledger](docs/asset-ledger.md)
- [Room ambience contract](docs/room-ambience.md)
- [Multi-room world direction](docs/multi-room-world-design.md)
- [Archive Library art direction](docs/archive-library-art-direction.md)
- [Blog authoring guide](docs/blog-authoring.md)
- [AI Companion LLM decision](docs/ai-companion-decision.md)

Generated source art is kept under `design/sources/`; optimized runtime assets live under `public/assets/`. The asset ledger records production methods and confirms where project-owned references were used.

## Contact

- Email: [zerolxy612@gmail.com](mailto:zerolxy612@gmail.com)
- GitHub: [@zerolxy612](https://github.com/zerolxy612)
