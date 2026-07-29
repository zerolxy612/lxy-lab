# Xiangyu's AI Lab — Asset Ledger

最后更新：2026-07-29

所有进入运行时的正式美术素材都必须保留来源、处理方式和当前状态。第三方素材在未确认许可前不得进入 `public/assets/game/`。

## Runtime Assets

| Asset | Runtime file | Source file | Production method | Status |
|---|---|---|---|---|
| Xiangyu player v1 | `public/assets/game/sprites/xiangyu-player-v1.png` | `design/sources/xiangyu-player-source-v1.png` | OpenAI built-in image generation；纯色键控背景移除；统一裁切、最近邻缩放、32 色量化；无外部参考图 | v0.3 integrated |
| Living AI Core v1 | `public/assets/game/sprites/living-ai-core-v1.png` | `design/sources/living-ai-core-source-v1.png` | OpenAI built-in image generation + single proportion edit；纯色键控背景移除；裁切、比例校正、最近邻缩放、48 色量化；无外部参考图 | v0.3 integrated |
| Experience Archive v1 | `public/assets/game/sprites/experience-archive-v1.png` | `design/sources/experience-archive-source-v1.png` | OpenAI built-in image generation；纯色键控背景移除；裁切、最近邻缩放、48 色量化；无外部参考图 | v0.3 integrated |
| Room base tileset v1 | `public/assets/game/tilesets/room-base-v1.png` | `design/sources/room-tileset-source-v1.png` | OpenAI built-in image generation；16 个概念单元规范化为 256 个 16 px tiles；48 色统一量化；无外部参考图 | v0.3 integrated |

## Xiangyu Player v1 Prompt

```text
Use case: stylized-concept
Asset type: production source for a Phaser pixel-art player sprite sheet
Primary request: Create a clean 2-column by 4-row character sprite sheet for Xiangyu, a young Chinese AI application engineer in a future Hong Kong cyber laboratory.
Subject: One consistent character only. Black short tousled side-parted hair, square black glasses, warm medium skin, dark ink-black technical jacket over an off-white shirt, dark trousers, light sneakers. Tiny cyan and violet technical accents only. Friendly, capable, curious personality.
Pose grid: exactly 8 isolated full-body sprites. Row 1 faces down, row 2 faces left, row 3 faces right, row 4 faces up. Column 1 is a neutral idle stance, column 2 is one readable walking step. Every frame has the same scale, silhouette proportions, centered foot position, and baseline.
Style/medium: authentic hand-authored 16-bit RPG pixel art, crisp square pixels, chunky readable clusters, limited palette, strong dark outline, top-down three-quarter view. No smooth painting, no antialiasing, no gradients, no soft glow.
Composition: square canvas, perfectly even 2 x 4 grid with generous equal gutters. Each sprite centered in its cell, no overlap. Character should occupy about 60% of each cell height.
Scene/backdrop: perfectly flat solid #00FF00 chroma-key background for removal. One uniform green with no shadows, gradients, texture, reflections, floor plane, or lighting variation.
Constraints: no text, no labels, no numbers, no borders, no grid lines, no UI, no props, no cast shadow, no contact shadow, no watermark. Do not use #00FF00 anywhere on the character. Preserve exact identity, clothing colors, scale, and proportions across all 8 sprites.
```

## Processing Notes

- Source generation size: 1254 × 1254 px.
- Runtime sheet: 80 × 192 px, 2 columns × 4 rows.
- Frame contract: 40 × 48 px; rows are down, left, right, up; columns are idle, walk.
- Chroma-key removal sampled the source border and produced an RGBA intermediate.
- All frames use one shared scale and a common foot baseline before nearest-neighbor downscaling.
- Runtime alpha is binary and the sheet is reduced to a 32-color palette.

## Living AI Core v1 Prompts

Initial generation:

```text
Use case: stylized-concept
Asset type: isolated production source for a Phaser pixel-art environment prop
Primary request: Create one iconic Living AI Core for Xiangyu's future Hong Kong AI laboratory: a cylindrical research chamber on a heavy circular machine base, containing a luminous branching knowledge tree made of neural-network connections and data nodes.
Subject details: symmetrical dark graphite and ink-blue metal base with layered circular rings, small maintenance panels, cables and vents; tall sealed chamber with readable opaque pixel-art glass highlights; inside, one elegant cyan branching data tree rising from the base with sparse violet nodes and a bright central pulse. Add only two or three tiny warm amber maintenance lights for human contrast.
Style/medium: premium hand-authored 16-bit RPG pixel art, crisp square pixels, limited palette, chunky readable clusters, strong dark outlines, no antialiasing, no smooth gradients, no painterly rendering. Match the scale and density of a 40 x 48 pixel player character.
Composition/framing: one isolated full device, centered, symmetrical, top-down three-quarter RPG room perspective with the front and top rings visible. The device should be taller than wide but keep a broad circular base. Generous padding on all sides. No other objects.
Lighting/mood: cyan system light contained inside the chamber, restrained violet accents, dark industrial materials; distinctive and engineered, not generic neon.
Scene/backdrop: perfectly flat solid #00FF00 chroma-key background for removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation.
Constraints: no text, no letters, no labels, no numbers, no logos, no UI, no border, no grid, no cast shadow, no contact shadow, no watermark. Do not use #00FF00 anywhere in the device. Keep all edges crisp and fully separated from the background. Express glass through opaque cyan and pale-blue pixel highlights rather than transparency.
```

Proportion edit:

```text
Use case: precise-object-edit
Asset type: isolated production source for a Phaser pixel-art environment prop
Primary request: Adjust only the proportions of the Living AI Core. Make the complete device approximately 20 percent shorter and slightly broader, with a shorter glass chamber and a wider circular base, so the overall silhouette is closer to 4:5 width-to-height while remaining clearly taller than wide.
Input image: the provided Living AI Core is the edit target.
Invariants: preserve the exact knowledge tree concept, dark graphite machinery, cyan glass highlights, violet data nodes, tiny amber maintenance lights, pixel-art rendering, top-down three-quarter perspective, centered symmetry, and flat solid #00FF00 chroma-key background. Keep one isolated device only.
Constraints: change proportions only; no text, labels, logos, extra objects, floor, shadow, reflection, border, UI, watermark, or background variation.
```

Processing notes:

- Final source generation size: 1254 × 1254 px.
- Runtime texture: 192 × 160 px; visible art is approximately 153 × 154 px.
- The source was widened by 1.25× before uniform nearest-neighbor reduction to preserve the intended room footprint.
- Runtime alpha is binary and RGB is reduced to a 48-color palette.
- Phaser uses a 0.62 vertical origin and a separate 128 × 56 px floor collision rectangle.

## Experience Archive v1 Prompt

```text
Use case: stylized-concept
Asset type: isolated production source for a Phaser pixel-art environment workstation
Primary request: Create one wide Experience Archive workstation for Xiangyu's future Hong Kong AI laboratory. It should feel like a personal memory desk evolving into a current AI research desk, with two readable halves connected as one piece of furniture.
Left memory side: dark graphite archive drawers, stacked memory cards, books, printed photos and one small original black-and-white penguin plush as a warm career keepsake. The penguin must be a generic original toy with no brand logo and must not copy any official Tencent or QQ mascot. Use restrained amber and vermilion highlights.
Right research side: a dark navy and muted gold research notebook, a slim research folder or access pass with abstract geometric markings, a small cyan data screen, mug and compact plant. These objects should subtly suggest an HKUST-affiliated research environment without using the HKUST crest, name, initials, official logo, or copying any branded item.
Style/medium: premium hand-authored 16-bit RPG pixel art, crisp square pixels, limited palette, chunky readable clusters, strong dark outlines, no antialiasing, no smooth gradients, no painterly rendering. Match the scale of a 40 x 48 pixel player and the existing Living AI Core.
Composition/framing: one isolated wide workstation, centered, top-down three-quarter RPG room perspective, approximately 3:2 width-to-height. Show desktop objects clearly and a sturdy low cabinet base. Generous padding on all sides. No other furniture.
Lighting/mood: left side warm and autobiographical; right side cool cyan and research-focused; dark ink-blue and graphite materials unify both halves. Keep glow restrained and contained inside pixels.
Scene/backdrop: perfectly flat solid #00FF00 chroma-key background for removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation.
Constraints: no text, no letters, no labels, no numbers, no logos, no official mascots, no crests, no UI overlay, no border, no grid, no cast shadow, no contact shadow, no watermark. Do not use #00FF00 anywhere in the workstation. Keep all edges crisp and fully separated from the background.
```

Processing notes:

- Source generation size: 1536 × 1024 px.
- Runtime texture: 192 × 128 px; visible art is approximately 176 × 105 px.
- Chroma-key removal produced an RGBA intermediate before nearest-neighbor reduction.
- Runtime alpha is binary and RGB is reduced to a 48-color palette.
- Phaser uses a 0.62 vertical origin and a separate 160 × 48 px floor collision rectangle.
- The penguin and research-institution cues are original, non-logo details; no external reference image was used.

## Room Base Tileset v1 Prompt

```text
Use case: stylized-concept
Asset type: production reference sheet for a 16 x 16 pixel Tiled room tileset in a Phaser portfolio game
Primary request: Create a clean 4-column by 4-row sheet of exactly 16 isolated square cyber-laboratory environment tile concepts for Xiangyu's future Hong Kong AI lab. Include a coherent family of dark ink-blue floor panels, graphite wall panels, inner and outer wall edges, small cyan conduit lines, restrained violet junctions, vents, seam plates, and two subtle warm amber maintenance details. Each tile must be usable as a repeating top-down orthographic room surface, not an object or scene.
Style/medium: premium hand-authored 16-bit RPG pixel art, crisp square pixels, chunky clusters, limited palette, strong dark outlines, no antialiasing, no smooth gradients, no painterly texture, no 3D render.
Composition/framing: exact evenly spaced 4 x 4 grid on a square canvas. Every tile is the same square size, shown straight-on with no perspective, centered inside its cell, and fills about 82 percent of the cell. Use thick perfectly flat solid #00FF00 gutters around and between every tile so cells are easy to isolate.
Color palette: #050612, #090C1D, #10152A, #253154, #5CDFFF, #8A63FF, #CD55FF, and very sparse #FFC45C. Cyan and violet must remain accents rather than filling every tile.
Constraints: exactly 16 tiles; no text, letters, numbers, labels, UI, icons, characters, furniture, logos, watermark, cast shadows, floor scene, room mockup, perspective view, irregular cell sizes, overlapping tiles, or decorative border. Do not use #00FF00 inside any tile.
```

Processing notes:

- Source generation size: 1254 × 1254 px with 16 isolated concept cells.
- Each concept is normalized to 64 × 64 px and subdivided into 4 × 4 production tiles.
- Runtime atlas: 256 × 256 px, 16 columns × 16 rows, 256 tiles at 16 × 16 px.
- Area reduction preserves small conduit accents before the atlas is reduced to a shared 48-color palette.
- Runtime texture is opaque RGBA; no external reference image or third-party asset was used.
