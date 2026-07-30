# Xiangyu's AI Lab — Asset Ledger

最后更新：2026-07-30

所有进入运行时的正式美术素材都必须保留来源、处理方式和当前状态。第三方素材在未确认许可前不得进入 `public/assets/game/`。

## Runtime Assets

| Asset | Runtime file | Source file | Production method | Status |
|---|---|---|---|---|
| Xiangyu player v1 | `public/assets/game/sprites/xiangyu-player-v1.png` | `design/sources/xiangyu-player-source-v1.png` | OpenAI built-in image generation；纯色键控背景移除；统一裁切、最近邻缩放、32 色量化；无外部参考图 | v0.3 integrated |
| Living AI Core v1 | `public/assets/game/sprites/living-ai-core-v1.png` | `design/sources/living-ai-core-source-v1.png` | OpenAI built-in image generation + single proportion edit；纯色键控背景移除；裁切、比例校正、最近邻缩放、48 色量化；无外部参考图 | v0.3 integrated |
| Experience Archive v1 | `public/assets/game/sprites/experience-archive-v1.png` | `design/sources/experience-archive-source-v1.png` | OpenAI built-in image generation；纯色键控背景移除；裁切、最近邻缩放、48 色量化；无外部参考图 | v0.3 integrated |
| Room base tileset v1 | `public/assets/game/tilesets/room-base-v1.png` | `design/sources/room-tileset-source-v1.png` | OpenAI built-in image generation；16 个概念单元规范化为 256 个 16 px tiles；48 色统一量化；无外部参考图 | v0.3 integrated |
| Lab room background v1 | `public/assets/game/backgrounds/lab-room-background-v1.png` | `design/sources/lab-room-background-source-v1.png` | OpenAI built-in image generation；使用当前房间截图与项目自有 room tileset / Living Core 源图作为布局、材质和像素密度参考；整理为 960 × 540 px | v0.5 integrated |
| Lab Companion v1 | `public/assets/game/sprites/lab-companion-v1.png` | `design/sources/lab-companion-source-v1.png` | OpenAI built-in image generation；使用项目自有背景、Living Core 与 Archive 源图作风格参考；绿色键控移除、统一裁切、48 色量化 | v0.5 integrated |
| Selected Work console v1 | `public/assets/game/sprites/selected-work-console-v1.png` | `design/sources/selected-work-console-source-v1.png` | OpenAI built-in image generation；使用项目自有背景与正式站点源图作风格参考；绿色键控移除、统一裁切、64 色量化 | v0.5 integrated |
| Future Gate v1 | `public/assets/game/sprites/future-gate-v1.png` | `design/sources/future-gate-source-v1.png` | OpenAI built-in image generation；使用项目自有背景、Living Core 与 tileset 源图作风格参考；绿色键控移除、统一裁切、48 色量化 | v0.5 integrated |
| RAG Pipeline v1 | `public/assets/game/sprites/rag-pipeline-v1.png` | `design/sources/rag-pipeline-source-v1.png` | OpenAI built-in image generation；使用项目自有背景与正式工作台作比例和材质参考；绿色键控移除、统一裁切、64 色量化 | v0.5 integrated |
| Offline Corner v1 | `public/assets/game/sprites/offline-corner-v1.png` | `design/sources/offline-corner-source-v1.png` | OpenAI built-in image generation；使用项目自有背景、Archive 与玩家源图作比例和叙事参考；绿色键控移除、统一裁切、64 色量化 | v0.5 integrated |
| Open Graph card v1 | `public/assets/brand/og-xiangyu-ai-lab-v1.png` | `design/sources/og-xiangyu-ai-lab-source-v1.png` | OpenAI built-in image generation；使用本项目 Living AI Core、Xiangyu 角色与 room tileset 源图作为参考；精确导出 1200 × 630 px | v0.4 integrated |
| Lab favicon | `public/favicon.svg` | code-native SVG | 手工构建的 64 × 64 几何核心标记；使用项目色彩 tokens；无生成或外部素材 | v0.4 integrated |

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

## Lab Room Background v1 Prompt

```text
Use case: stylized-concept
Asset type: production background layer for a Phaser pixel-art portfolio game, exact 16:9 landscape composition intended for 960 × 540 logical pixels
Primary request: create the finished architectural environment for Xiangyu’s single-room future Hong Kong AI laboratory, using the current room screenshot only as a layout reference and the tileset/core references for pixel scale, material language, and palette
Input images: Image 1 is the current room layout reference; preserve its room bounds, large upper-center window position, broad open walkable floor, and station-negative-space distribution, but remove all UI and interactive objects. Image 2 is the existing graphite and ink-blue room material reference. Image 3 is a style and scale reference only for premium pixel density and cyan/amber lighting; do not include the device.
Scene/backdrop: one enclosed top-down three-quarter RPG laboratory room at rainy night in Hong Kong. A deep industrial back wall, a large framed harbor window centered across the upper wall, ink-blue metal floor, restrained side-wall machinery, and a substantial lower foreground threshold that gives the room depth.
Subject: architecture only. Build a cohesive shell with heavy segmented window frame, structural columns, ceiling shadow, wall vents, floor access hatches, cable trenches, drainage grates, small maintenance panels, contact shadows, and a few purposeful amber maintenance lights. The window shows a layered Hong Kong harbor skyline with rainy glass, dense small windows, atmospheric depth, and subtle warm ferry/harbor signals. Keep the central and lower-middle floor broadly open and walkable.
Style/medium: authentic premium hand-authored 16-bit RPG pixel art, crisp square pixels, chunky deliberate clusters, top-down three-quarter room perspective, limited palette, strong silhouettes, no antialiasing, no painterly rendering, no smooth 3D
Composition/framing: match a fixed 960 × 540 game canvas. Room interior begins around x 42/y 54 and ends around x 918/y 524. Window approximately x 265–695 and y 65–166. Leave clear visual zones for a companion at upper-left, archive workstation at mid-left, large core at upper-center, project terminal at mid-right, future gate at lower-right, and player spawn at lower-center. Do not draw those objects; only architecture, shadows, and floor beneath them.
Lighting/mood: rainy Hong Kong night, quiet late-working-hour atmosphere; cyan light is concentrated near the future core zone, warm amber is concentrated near the left personal/archive zone, subtle vermilion signals near the right future zone. Lighting should visibly touch floor and wall surfaces without neon haze.
Color palette: dominant ink-black, green-black, deep navy and graphite; cyan used sparingly for system seams; warm amber and muted vermilion for human maintenance lights; violet only in a few tiny junction nodes
Materials/textures: worn powder-coated metal, bolted floor panels, brushed graphite frames, inset cable channels, rain-streaked glass, small scuffs and repair patches; purposeful variation rather than uniform noise
Constraints: architecture and environment only; no characters; no robot; no AI core; no furniture; no desks; no server racks; no terminals; no doors or future gate; no labels; no letters; no numbers; no logos; no UI; no HUD; no watermark. Preserve large clean negative-space footprints for later interactive sprites. The image must read as a playable room background rather than concept art.
Avoid: generic neon cyberpunk poster, purple-blue gradient wash, excessive glow, floating holograms, glassmorphism, smooth gradients, photorealism, isometric cutaway, side-view room, tiny clutter everywhere, repeated identical panels, text of any kind
```

Processing notes:

- Reference inputs are the current project screenshot, room tileset source and Living AI Core source; all are project-owned and no external image was used.
- Built-in generation output: 1672 × 941 px.
- Runtime background: 960 × 540 px opaque PNG, loaded with Phaser `NEAREST` filtering.
- Interactive objects, labels, player and UI were intentionally excluded so Tiled remains the source of station positions, collisions and player spawn.
- The former Tiled visual tile layers remain in the `.tmj` as an editable v0.3 reference; v0.5 renders this fixed-canvas background as the primary architectural layer.

## Lab Companion v1 Prompt

```text
Use case: stylized-concept
Asset type: isolated production source for a Phaser pixel-art interactive station
Primary request: create one distinctive Lab Companion for Xiangyu’s future Hong Kong AI laboratory: a compact autonomous research assistant resting in a low charging dock, friendly and observant but clearly a capable laboratory instrument rather than a toy mascot
Input images: Image 1 is the finished lab background and establishes the graphite materials, rainy-night palette, and top-down three-quarter room perspective. Image 2 is the Living AI Core style and pixel-density reference. Image 3 is the Experience Archive scale and material-detail reference.
Subject: one small graphite and warm off-white robot with a horizontal dark face screen, two restrained cyan pixel eyes, small articulated side modules, one folded sensor mast, and a sturdy semicircular charging cradle beneath it. The dock should make the object feel grounded in the room. Add one tiny magenta station beacon and one tiny amber maintenance light.
Style/medium: premium hand-authored 16-bit RPG pixel art, crisp square pixels, chunky readable clusters, limited palette, strong dark outlines, no antialiasing, no painterly rendering, no smooth 3D
Composition/framing: one isolated complete device, centered, approximately 4:3 width-to-height, top-down three-quarter RPG room perspective. It must remain readable beside a 40 × 48 pixel player and fit a final visual footprint near 108 × 82 logical pixels. Generous clean padding on every side.
Lighting/mood: approachable late-night research companion; contained cyan face light, sparse magenta identification light, small warm amber dock light; no large aura
Scene/backdrop: perfectly flat solid #00FF00 chroma-key background for removal. One uniform green with no shadow, gradient, texture, reflection, floor plane, or lighting variation.
Constraints: exactly one robot and its attached charging dock; no text; no letters; no numbers; no logo; no speech bubble; no UI; no loose props; no cast shadow; no contact shadow; no watermark. Do not use #00FF00 anywhere in the subject. Keep all edges crisp and fully separated from the background.
Avoid: generic rounded app mascot, floating chat icon, cute plush proportions, humanoid android, white plastic toy, oversized head, glossy 3D render, neon haze, transparent glass
```

Processing notes:

- Source generation: 1438 × 1094 px; project-owned references only.
- Runtime texture: 128 × 112 px; visible subject approximately 94 × 100 px.
- Border-sampled chroma-key removal uses soft matte and despill; final runtime alpha is binary.
- Runtime RGB is reduced to a shared 48-color palette.

## Selected Work Console v1 Prompt

```text
Use case: stylized-concept
Asset type: isolated production source for a Phaser pixel-art interactive station
Primary request: create one wide Selected Work console for Xiangyu’s future Hong Kong AI laboratory, presenting two shipped-work traces as one coherent physical workstation rather than two generic flat screens
Input images: Image 1 establishes the final lab architecture, graphite materials and rainy-night palette. Image 2 establishes the wide workstation scale and premium pixel density. Image 3 establishes the engineered machinery language and contained system lighting.
Subject: one asymmetrical dual-bay engineering console on a heavy low graphite cabinet. The left bay represents an interactive Web3 game through a small physical controller, orbital network nodes, cartridge-like modules, and a compact magenta-violet gameplay display with no readable text. The right bay represents a confidential government-facing Legal AI application through stacked document silhouettes, citation-link markers, a slim cyan response stream, and an amber approval/status lamp, with no readable text. Connect both bays through visible shared wiring and one central event-bus junction module so the object reads as one engineering system.
Style/medium: premium hand-authored 16-bit RPG pixel art, crisp square pixels, chunky readable clusters, limited palette, strong dark outlines, no antialiasing, no painterly rendering, no smooth 3D
Composition/framing: one isolated complete wide workstation, centered, approximately 3:2 width-to-height, top-down three-quarter RPG room perspective. It must fit a final texture around 192 × 128 logical pixels and remain readable beside a 40 × 48 pixel player. Keep a stable broad base and generous clean padding.
Lighting/mood: capable and production-minded; restrained violet-magenta on the game side, cyan with one small amber status light on the Legal AI side, shared graphite and ink-blue materials across both
Scene/backdrop: perfectly flat solid #00FF00 chroma-key background for removal. One uniform green with no shadow, gradient, texture, reflection, floor plane, or lighting variation.
Constraints: one connected workstation only; no text; no letters; no numbers; no logos; no company marks; no crypto coin symbol; no government crest; no legal scales icon; no browser UI; no separate floating screens; no cast shadow; no contact shadow; no watermark. Do not use #00FF00 anywhere in the subject. Keep all edges crisp and separated from the background.
Avoid: two generic rectangles, dashboard mockup, glassmorphism, corporate office desk, casino imagery, cryptocurrency logos, official institutional branding, excessive neon, smooth 3D render, holographic clutter
```

Processing notes:

- Source generation: 1536 × 1024 px; project-owned references only.
- Runtime texture: 192 × 128 px; visible subject approximately 180 × 97 px.
- Border-sampled chroma-key removal uses soft matte and despill; final runtime alpha is binary.
- Runtime RGB is reduced to a shared 64-color palette to preserve the two narrative bays.
- The Legal AI half contains only abstract document and citation forms; it does not reproduce a sensitive interface or project identity.

## Future Gate v1 Prompt

```text
Use case: stylized-concept
Asset type: isolated production source for a Phaser pixel-art interactive station
Primary request: create one Future Gate for Xiangyu’s future Hong Kong AI laboratory as a visibly unfinished experimental aperture for ideas still taking shape, not a generic door
Input images: Image 1 establishes the final room architecture, dark graphite surfaces and right-side vermilion maintenance light. Image 2 establishes premium engineered machinery and pixel density. Image 3 establishes the restrained cyan/violet conduit language.
Subject: one compact low prototype aperture built from an incomplete segmented graphite ring mounted on a heavy floor base. Several ring segments are installed while one upper-right segment remains open, exposing cables, alignment arms and a small calibration emitter. Inside the aperture is deep ink-black space crossed by only two or three sparse cyan construction lines and one muted vermilion scan slit. Add a small violet junction at the base and two warm amber service lights. The silhouette should communicate an experiment under construction and an invitation to continue, not a finished portal.
Style/medium: premium hand-authored 16-bit RPG pixel art, crisp square pixels, chunky readable clusters, limited palette, strong dark outlines, no antialiasing, no painterly rendering, no smooth 3D
Composition/framing: one isolated complete device, centered, approximately 3:2 width-to-height, top-down three-quarter RPG room perspective. It must fit a final visual footprint near 126 × 82 logical pixels and remain readable beside a 40 × 48 pixel player. Stable floor base, generous clean padding, no cropped parts.
Lighting/mood: uncertain but optimistic; muted vermilion calibration signal, sparse cyan construction lines, tiny violet and amber service lights; mostly dark machinery with no large glow
Scene/backdrop: perfectly flat solid #00FF00 chroma-key background for removal. One uniform green with no shadow, gradient, texture, reflection, floor plane, or lighting variation.
Constraints: one prototype aperture only; no text; no letters; no numbers; no logos; no character; no floating icon; no scene; no cast shadow; no contact shadow; no watermark. Do not use #00FF00 anywhere in the subject. Keep all edges crisp and separated from the background.
Avoid: ordinary double door, fantasy stone portal, glowing magic ring, Stargate imitation, generic sci-fi airlock, perfect symmetry, bright vortex, excessive neon, holographic HUD, smooth 3D render
```

Processing notes:

- Source generation: 1555 × 1012 px; project-owned references only.
- Runtime texture: 144 × 112 px; visible subject approximately 95 × 100 px.
- Border-sampled chroma-key removal uses soft matte and despill; final runtime alpha is binary.
- Runtime RGB is reduced to a shared 48-color palette.

## RAG Pipeline v1 Prompt

```text
Use case: stylized-concept
Asset type: isolated production source for a Phaser pixel-art environmental machine
Primary request: create one believable RAG Pipeline machine for Xiangyu’s future Hong Kong AI laboratory: a compact wall-side retrieval and response rack that visibly moves information through physical stages, replacing a generic row of server rectangles
Input images: Image 1 establishes the final room architecture, graphite wall materials and top-down three-quarter perspective. Image 2 establishes the compact workstation scale and dense-but-readable pixel language. Image 3 establishes the engineered machinery language and contained cyan/amber lighting.
Subject: one connected low server rack with four unequal physical stages: document cartridge intake, cyan retrieval index, violet reranking junction, and a narrow response buffer. Show the stages through different cartridge silhouettes, small cable bundles and a single readable light path that travels left to right. Include one removable maintenance panel, a tiny fan vent, one amber health light and sparse cyan/violet indicators. The unit should feel mounted against the laboratory wall, not like a floating UI panel.
Style/medium: premium hand-authored 16-bit RPG pixel art, crisp square pixels, chunky readable clusters, limited palette, strong dark outlines, no antialiasing, no painterly rendering, no smooth 3D
Composition/framing: one isolated complete wide machine, centered, approximately 2:1 width-to-height, top-down three-quarter RPG room perspective. It must fit a final visual footprint near 168 × 82 logical pixels and remain readable beside a 40 × 48 pixel player. Keep a stable base and generous clean padding.
Lighting/mood: quiet production infrastructure running during a Hong Kong night shift; one restrained cyan data path, sparse violet junction lights and a tiny warm amber health indicator; no large glow
Scene/backdrop: perfectly flat solid #00FF00 chroma-key background for removal. One uniform green with no shadow, gradient, texture, reflection, floor plane, or lighting variation.
Constraints: exactly one connected machine; no text; no letters; no numbers; no logos; no company marks; no document text; no UI overlay; no floating panels; no cast shadow; no contact shadow; no watermark. Do not use #00FF00 anywhere in the subject. Keep every edge crisp and fully separated from the background.
Avoid: four identical server cards, dashboard widget, generic data-center photo, glassmorphism, holographic arrows, excessive neon, perfectly repeated modules, smooth 3D render
```

Processing notes:

- Source generation: 1796 × 876 px; project-owned references only.
- Runtime texture: 192 × 112 px; visible subject approximately 180 × 71 px.
- Border-sampled chroma-key removal uses soft matte and despill; final runtime alpha is binary.
- Runtime RGB is reduced to a shared 64-color palette.
- The document intake, retrieval index, reranking junction and response buffer are expressed as physical modules, without reproducing a real product interface or confidential workflow.

## Offline Corner v1 Prompt

```text
Use case: stylized-concept
Asset type: isolated production source for a Phaser pixel-art environmental storytelling cluster
Primary request: create one cohesive Offline Corner for Xiangyu’s future Hong Kong AI laboratory, a believable personal rest-and-tinker corner that reveals a real person behind the technical lab
Input images: Image 1 establishes the final room architecture, graphite materials, Hong Kong night mood and top-down three-quarter perspective. Image 2 establishes the dense handcrafted archive furniture language and warm lived-in detail. Image 3 establishes player scale and the crisp compact pixel language.
Subject: one connected wide low lounge-and-hobby cluster. On the left, a slightly worn low graphite bench with one dark navy cushion and a folded rust-colored blanket. Place one small original black-and-white penguin plush on the bench, designed as a generic charming keepsake with no resemblance to a protected mascot and no logo. Beside the bench, include a slim wet umbrella stand holding one closed dark Hong Kong rain umbrella with a tiny cyan edge. On the right, a low practical tea-and-tinker table or crate containing a warm ceramic mug, compact thermos, closed notebook with no writing, tiny original handheld game device with blank screen, screwdriver and rolled tool cloth. Add one small slightly neglected potted plant. Arrange all pieces as one readable composition, not scattered props.
Style/medium: premium hand-authored 16-bit RPG pixel art, crisp square pixels, chunky readable clusters, limited palette, strong dark outlines, no antialiasing, no painterly rendering, no smooth 3D
Composition/framing: one isolated complete wide cluster, centered, approximately 2.6:1 width-to-height, top-down three-quarter RPG room perspective. It must fit a final visual footprint near 270 × 96 logical pixels and remain readable beside a 40 × 48 pixel player. Preserve an open front edge so the player appears able to walk past it. Generous clean padding.
Lighting/mood: quiet personal corner during a rainy Hong Kong night shift; warm amber task light is dominant, with only tiny restrained cyan reflections from the lab; intimate, practical, slightly imperfect
Scene/backdrop: perfectly flat solid #00FF00 chroma-key background for removal. One uniform green with no shadow, gradient, texture, reflection, floor plane, or lighting variation.
Constraints: exactly one cohesive furniture cluster; no people; no text; no letters; no numbers; no logos; no company marks; no official university or employer symbols; no legible documents; no UI overlay; no floating panels; no cast shadow; no contact shadow; no watermark. Do not use #00FF00 anywhere in the subject. Keep every edge crisp and fully separated from the background.
Avoid: generic coffee shop, luxury lounge, chaotic clutter pile, official mascot, recognizable brand device, corporate logo, glassmorphism, excessive neon, smooth 3D render
```

Processing notes:

- Source generation: 2103 × 748 px; project-owned references only.
- Runtime texture: 304 × 128 px; visible subject approximately 292 × 92 px.
- Border-sampled chroma-key removal uses soft matte and despill; final runtime alpha is binary.
- Runtime RGB is reduced to a shared 64-color palette.
- The penguin, handheld device and research notebook are original non-branded props; no Tencent, HKUST, HKGAI or third-party logo is reproduced.

## Open Graph Card v1 Prompt

```text
Use case: ads-marketing
Asset type: Open Graph social sharing image for a personal interactive portfolio, exact wide aspect ratio 1200:630
Primary request: create a polished wide pixel-art key visual for Xiangyu's explorable AI laboratory, faithfully reusing the visual language and recognizable subjects from the reference images
Input images: Image 1 is the Living AI Core subject reference; Image 2 is Xiangyu character reference; Image 3 is the laboratory wall and floor texture reference
Scene/backdrop: future Hong Kong research laboratory at rainy night, subtle skyline window, dark navy industrial wall panels
Subject: large Living AI Core on the right half, small Xiangyu character near its base, generous clean negative space on the left
Style/medium: deliberate high-quality pixel art, crisp hard pixel edges, restrained retro-futuristic composition, no smooth 3D rendering
Lighting/mood: cyan core light, restrained violet signals, tiny warm amber personal accents, atmospheric but readable
Color palette: deep navy and blue-black dominant; cyan primary light; violet secondary; amber sparingly
Text (verbatim): "XIANGYU’S AI LAB" and "AI APPLICATION ENGINEER · HONG KONG"
Typography: clean bold pixel-compatible sans serif, left aligned, exact spelling, high contrast, no gradient text
Constraints: landscape social-card composition; title remains readable at thumbnail size; preserve the core's cylindrical tree-of-light identity and Xiangyu's dark jacket, glasses, black hair, and white shoes; no green background; no logos; no project names
Avoid: generic neon cyberpunk city poster, excessive glow, holographic HUD clutter, glassmorphism, watermarks, illegible or extra text, corporate logos
```

Processing notes:

- Reference inputs are project-owned v1 source assets; no external image or third-party brand reference was used.
- Built-in generation output: 1730 × 909 px.
- Runtime Open Graph export: 1200 × 630 px PNG.
- Exact title and subtitle spelling, character identity, Living AI Core silhouette and safe thumbnail composition were visually verified after export.
