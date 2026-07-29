# Xiangyu's AI Lab — Development Roadmap

最后更新：2026-07-29

本文档记录当前实现、技术决策、限制和下一轮方向。稳定的产品愿景仍维护在根目录的 [`readme.md`](../readme.md)。

## 1. Confirmed Product Decisions

| 主题 | 当前决定 | 对实现的影响 |
|---|---|---|
| 网站主角 | Xiangyu 本人、经历、工程方法与整体 AI Lab | 任何单一项目都不能成为首页或房间的绝对焦点 |
| LexiHK | Selected Work 中的一个案例 | 不作为默认项目、主标题或核心视觉装置 |
| 核心体验 | 一个可以自由移动的完整房间 | Phaser 负责移动、碰撞、站点范围与场景动画 |
| 快速浏览 | 探索是选择，不是门槛 | React Quick Access 始终可以绕过 Canvas 访问内容 |
| 移动端 | 内容优先，暂不模拟桌面游戏控制 | 小屏依靠 Quick Access，不做低质量虚拟摇杆 |
| 视觉方向 | 青紫系统光为主，香港雨夜与个人物品建立辨识度 | 暖色只用于记忆、生活区域和少量强调 |
| AI Assistant | 后期能力，不是当前核心 | 先做策划问题和导航，再决定是否连接 LLM |

## 2. Current Implementation — v0.2

### 2.1 Stack and Runtime Boundary

- Node.js 24 LTS（`.nvmrc`）
- Vite 8、React 19、TypeScript
- Phaser 3.90 + Arcade Physics
- ESLint + Vitest

```text
React DOM Layer
├── Identity and Quick Access
├── First-move / nearby guidance
├── Visited-state ownership
└── Accessible content panels

        ↕ typed LabBridge events

Phaser Canvas Layer
├── Player movement and collision
├── Station proximity / activation
├── Active / nearby / visited visuals
└── Room ambience and debug overlay
```

Phaser 保存角色坐标、碰撞、附近站点和场景动画；React 保存当前面板、访问记录和快捷导航状态。`src/game/bridge.ts` 是两层间唯一业务通信边界。Phaser 动态导入，身份信息和 Quick Access 可以先显示。

### 2.2 Implemented in This Iteration

- 房间布局、出生点、障碍物和五个站点从 `LabScene.ts` 抽离到 `src/game/layout/labLayout.ts`。
- 角色具有上、下、左、右 idle / walk 程序化占位帧；对角移动归一化。
- 首次移动前显示 WASD 引导，移动后提示转为靠近站点探索。
- 五个站点统一支持 nearby、hover、active 和 visited 视觉状态。
- 房间与 Quick Access 共享访问记录；访问过的站点显示菱形标记和进度 `n/5`。
- Experience Archive 使用独立内容数据，展示真实经历方向与工作原则，不突出 LexiHK。
- Quick Access 与房间站点打开同一个 React 面板，避免两套内容漂移。
- 面板支持 Escape 关闭和焦点恢复；Canvas 可获取键盘焦点。
- `prefers-reduced-motion` 同时影响 DOM 与 Phaser 场景动画。
- `F2` 可显示房间边界、碰撞体、交互范围和出生点。
- 小屏切换为内容优先的底部面板，并保留 44px 级触控目标。

### 2.3 Verification

当前通过：

- `npm run typecheck`
- `npm run lint`
- `npm run test`（2 个文件，4 项测试）
- `npm run build`

布局测试会检查站点注册表一致性和出生点安全性；事件桥测试覆盖激活与访问状态同步。

生产构建中 React 初始块约 201 kB（gzip 64 kB），延迟加载的 Phaser 块约 1.21 MB（gzip 324 kB）。Phaser 的体积提示仍存在，但不会阻塞 DOM 首屏。

## 3. v0.2 Acceptance Status

| 验收项 | 状态 | 说明 |
|---|---|---|
| 五站点可通过移动和键盘交互 | 完成 | WASD / 方向键 + E / 空格 |
| 无已知卡死点或不可关闭面板 | 完成 | 布局配置化；面板支持 Escape |
| 四方向 idle / walk 动画 | 完成 | 当前为程序化占位帧 |
| Experience Archive 发布级内容 | 部分完成 | 结构与真实经历已就位，公开证据和量化结果仍待补充 |
| 房间与 Quick Access 访问状态一致 | 完成 | React 状态通过 typed bridge 同步 |
| 键盘可浏览全部核心内容 | 完成 | Canvas、Quick Access、面板均可键盘操作 |
| 类型、Lint、测试、构建通过 | 完成 | 2026-07-29 验证 |

## 4. Known Limitations

- 房间、城市、设备和角色仍由 Phaser Graphics 程序化绘制，不是最终像素美术。
- 角色帧验证了方向和节奏，但还没有人物辨识度与完整 sprite sheet。
- 碰撞体是简化矩形，需在正式家具素材确定后重新贴合。
- 布局已配置化，但尚未接入 Tiled 对象层。
- Experience Archive 缺少可公开截图、案例链接、量化影响和简历下载。
- 其余站点仍以结构性内容为主，Selected Work 的案例深度不足。
- 访问状态只保存在当前 React 会话，刷新后不会保留。
- 手机端以 Quick Access 为主，不提供触控移动。
- 没有声音、Boot sequence、真实 NPC 路径或在线 AI Assistant。
- 暂无正式像素素材清单、尺寸规范和版权台账。

## 5. Next Iteration — v0.3 Art and Map Pipeline

### Goal

保持现有交互契约不变，把程序化原型升级为有个人辨识度、可持续生产的房间美术系统。重点是先锁规范和一小块代表性正式素材，不一次性重画整个房间。

本轮从“像素尺寸规范 + Xiangyu 玩家角色设计”开始。玩家比例作为后续家具、站点和房间素材的统一尺度基准。

### Priority 1 — Visual Specification

- 锁定 tile size、角色逻辑尺寸、家具占地和像素缩放规则。
- 定义青紫主光、暖色生活区、背景黑阶和状态色 token。
- 建立 sprite、tileset、prop、portrait、ambience 的命名及导出规范。
- 建立素材来源、生成方式、人工修改和版权台账。

### Priority 2 — Representative Art Slice

- 优先正式绘制玩家、中央 Living AI Core 和 Experience Archive 区域。
- 给角色补四方向 sprite sheet、idle 姿态和可辨识的个人细节。
- 用香港窗景、双语标记与桌面物品建立地域和人物记忆点。
- 保持当前青紫主色，但减少平均铺满的霓虹发光。

### Priority 3 — Map Pipeline

- 评估并接入 Tiled：地图层、碰撞层、出生点和站点对象层。
- 将 `labLayout.ts` 作为迁移前的稳定数据契约，而不是立即删除。
- 给地图数据增加构建时校验，确保站点 ID 继续匹配内容注册表。

### Priority 4 — Content Evidence

- 与用户确认可公开的职位表述、项目责任、截图和链接。
- 为 Experience Archive 补“背景 → 负责内容 → 关键决策 → 结果 / 证据”。
- 为 Selected Work 选择 2–3 个代表案例；LexiHK 保持其中之一。
- 增加 Resume、Contact 和必要外部链接。

### Acceptance Criteria

- 玩家和至少两个核心区域使用同一套正式像素规范。
- 正式角色在 960 × 540 逻辑分辨率下方向清晰、比例合理。
- 至少一个房间局部达到接近最终品质，玩家可在其中正常移动并与站点交互。
- 地图数据可以表达碰撞、出生点和五个站点，且通过自动校验。
- 替换素材后现有移动、访问状态、Quick Access 和无障碍路径不回退。
- Experience Archive 至少有一条经确认、可公开的证据。
- 类型、Lint、测试和生产构建继续通过。

### Explicit Non-goals

- 第二个房间或开放大地图
- 战斗、任务、背包和游戏经济
- 复杂 NPC 路径系统
- LLM、数据库和后端 API
- 大规模声音系统

## 6. Later Milestones

### v0.4 — Portfolio Content and Publishing

- 完成个人介绍、经历与 Selected Work。
- 加入 Resume、Contact、SEO、Open Graph 和分享预览。
- 做一次招聘者阅读路径测试和跨浏览器验证。

### v0.5 — Atmosphere and AI Evaluation

- 可跳过的短 Boot sequence、环境音和默认静音策略。
- 少量有目的的 NPC 或隐藏细节。
- 评估 AI Companion 是否需要 LLM；若需要，再设计服务端、成本和安全边界。

## 7. Decision Log

### 2026-07-28

- 采用一个固定房间而不是 Peter Oravec 式开放地图。
- React 管内容、Phaser 管世界，中间使用薄事件桥。
- Quick Access 是招聘者和无障碍用户的必要路径。

### 2026-07-29

- 自由移动成为核心体验，不使用纯点击场景。
- 青紫确认为偏好方向；差异化来自香港环境、个人细节和真实内容。
- LexiHK 降为 Selected Work 中的一个案例，不承担网站主叙事。
- 完成 v0.1 程序化房间骨架。
- 完成 v0.2 交互垂直切片：布局配置化、四向反馈、访问状态、Experience Archive、调试层和响应式内容路径。
- v0.3 转向正式美术规范、代表性区域和地图数据管线。
