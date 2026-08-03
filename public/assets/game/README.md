# Game assets

Runtime assets loaded by Phaser live here so Tiled maps can keep stable relative URLs.

Expected folders:

- `maps/` — exported Tiled JSON/TMJ maps；`lab-v1.tmj` 是当前房间空间数据的唯一来源
- `backgrounds/` — fixed-canvas architectural environment layers; Tiled remains the source of spatial data
- `tilesets/` — tileset images and metadata
- `sprites/` — player, companion, NPC, and object sprite sheets
- `audio/` — interaction and interface sounds
- `ambience/` — room and Hong Kong background ambience

Track the source and license of every third-party asset before it is committed.
Generation sources live outside `public/` under `design/sources/` so they are not copied into production builds.
`elevator-cabin-background-v1.png` was generated for this project with OpenAI ImageGen on 2026-08-03, then resized to the 960 × 540 Phaser canvas. Runtime code splits it into reusable shell, left-door, right-door, and floor frames.
RAG Pipeline 与 Offline Corner 等非交互环境物件也使用独立 sprite；它们不能在背景图中烘焙碰撞、标签或交互状态。
v0.5 环境声由 `src/audio/roomAmbience.ts` 使用 Web Audio 程序化生成，因此 `audio/` 与 `ambience/` 暂无生产文件；未来若加入采样，仍必须先登记来源和许可。

Production dimensions, palette, export rules, and the first v0.3 slice are defined in [`docs/pixel-art-spec.md`](../../../docs/pixel-art-spec.md).
Tiled object names, layers, properties, and validation rules are defined in [`docs/tiled-map-schema.md`](../../../docs/tiled-map-schema.md).
