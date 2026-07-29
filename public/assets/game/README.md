# Game assets

Runtime assets loaded by Phaser live here so Tiled maps can keep stable relative URLs.

Expected folders:

- `maps/` — exported Tiled JSON/TMJ maps；`lab-v1.tmj` 是当前房间空间数据的唯一来源
- `tilesets/` — tileset images and metadata
- `sprites/` — player, companion, NPC, and object sprite sheets
- `audio/` — interaction and interface sounds
- `ambience/` — room and Hong Kong background ambience

Track the source and license of every third-party asset before it is committed.
Generation sources live outside `public/` under `design/sources/` so they are not copied into production builds.

Production dimensions, palette, export rules, and the first v0.3 slice are defined in [`docs/pixel-art-spec.md`](../../../docs/pixel-art-spec.md).
Tiled object names, layers, properties, and validation rules are defined in [`docs/tiled-map-schema.md`](../../../docs/tiled-map-schema.md).
