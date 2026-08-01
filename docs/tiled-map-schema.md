# Xiangyu's AI Lab — Tiled Map Schema v1

最后更新：2026-08-01

运行时地图位于 `public/assets/game/maps/lab-v1.tmj`。它是房间空间数据的唯一来源；不要在 `LabScene.ts` 或 `labLayout.ts` 中复制站点坐标、碰撞或出生点。

## Map Contract

| 项目 | 值 |
|---|---|
| Orientation | Orthogonal |
| Tile size | 16 × 16 px |
| Map size | 60 × 34 tiles |
| Schema property | `schemaVersion = 1` |
| Runtime URL | `/assets/game/maps/lab-v1.tmj` |

当前地图同时包含生产对象层和首版视觉 tile layers。v0.5 起，`lab-room-background-v1.png` 负责运行时建筑、地板与香港窗景；Tiled 继续作为出生点、碰撞、障碍物、五个站点、NPC 固定点与巡逻路线的唯一空间数据来源。

## Visual Tile Layers

| Layer | Tileset | 用途 |
|---|---|---|
| `Floor` | `room-base-v1` | 房间地板面板，低对比度、低透明度 |
| `Structure` | `room-base-v1` | 上墙和两侧结构边缘 |

tileset 位于 `public/assets/game/tilesets/room-base-v1.png`，为 256 × 256 px、16 列 × 16 行。tile layer 使用 Tiled 的未压缩 base64 GID 数据，继续作为可编辑的 v0.3 房间结构参考；当前 Phaser 场景不叠加渲染这两个图层。

## Required Object Layers

### `World`

- `world-bounds`：矩形；定义 Arcade Physics 世界边界。
- `player-spawn`：Point；定义玩家出生位置。

### `Collision`

- 没有 `stationId` 属性的矩形会成为静态障碍物。
- 带 `stationId` 字符串属性的矩形会成为对应站点的落地碰撞。
- 每个已注册站点必须且只能拥有一个碰撞对象。

### `Stations`

每个矩形对象的名称必须与一个 `StationId` 完全一致：

```text
assistant
experience
systems
projects
future
```

必需属性：

| Property | Tiled type | 用途 |
|---|---|---|
| `color` | color | nearby / active / visited 状态色，使用 `#RRGGBB` |
| `interactionPadding` | int | 视觉矩形外扩后的交互范围 |

可选属性：

| Property | Tiled type | 用途 |
|---|---|---|
| `labelGap` | int | 站点视觉底部到标题的距离，默认 12 px |

### `NPCs`

每个 Point 对象名称必须与 `NpcId` 一致。首轮仅允许 `rook` 与 `mira`。

| Property | Tiled type | 用途 |
|---|---|---|
| `movement` | string | `patrol` 或 `stationary` |
| `interactionPadding` | int | sprite 外扩后的对话触发范围 |

### `NpcRoutes`

巡逻点使用 Point 对象；`npcId` 指向 NPC，`order` 为路线顺序。`patrol` 至少需要两个点，`stationary` 不得拥有路线。ROOK 当前使用五点闭环，MIRA 没有路线。

## Runtime Validation

`src/game/layout/labLayout.ts` 在场景创建前解析地图，并拒绝以下情况：

- schema version 或 16 px tile size 不匹配；
- 缺少 `World`、`Collision`、`Stations`、`NPCs` 或 `NpcRoutes`；
- 缺少出生点、世界边界或任一内容站点；
- 未知或重复的 `StationId`；
- 站点缺少独立碰撞；
- 无效颜色、坐标或非正数矩形尺寸。
- 未知 / 重复 NPC、无效移动模式、巡逻点不足或固定 NPC 错配路线。

Phaser 通过 `tilemapTiledJSON` 加载同一份 `.tmj`。对象解析器忽略视觉 tile layers，只校验业务对象层；固定建筑背景不会保存任何站点、碰撞或出生信息，避免空间数据出现第二份来源。

修改 `.tmj` 后必须运行：

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

地图测试直接读取生产 `.tmj`，因此错误不会被另一份测试 fixture 掩盖。
