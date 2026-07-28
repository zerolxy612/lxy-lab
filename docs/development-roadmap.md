# Xiangyu's AI Lab — Development Roadmap

最后更新：2026-07-29

本文档记录会随开发变化的实现状态、技术决策、已知限制和下一轮方向。稳定的产品愿景和公开项目说明仍维护在根目录的 [`readme.md`](../readme.md)。

## 1. Confirmed Product Decisions

| 主题 | 当前决定 | 对实现的影响 |
|---|---|---|
| 网站主角 | Xiangyu 本人、经历、工程方法与整体 AI Lab | 任何单一项目都不能成为首页或房间的绝对焦点 |
| LexiHK | Selected Work 中的一个案例 | 不作为默认项目、主标题或核心视觉装置 |
| 核心体验 | 一个可以自由移动的完整房间 | Phaser 负责移动、碰撞、站点范围与场景动画 |
| 快速浏览 | 探索是选择，不是门槛 | React Quick Access 必须始终可以绕过 Canvas 直接访问内容 |
| 视觉方向 | 青紫系统光为主，香港雨夜与个人物品建立辨识度 | 避免只使用通用紫蓝渐变；暖色用于记忆和生活区域 |
| 项目范围 | 游戏化个人网站，不是完整游戏 | 不做战斗、任务树、背包、大地图和长时间探索 |
| AI Assistant | 后期能力，不是 v0.1 核心 | 先使用策划问题和导航能力，再决定是否连接 LLM |

## 2. Current Implementation — v0.1

### 2.1 Stack

- Node.js 24 LTS（通过 `.nvmrc` 锁定）
- Vite 8
- React 19 + TypeScript
- Phaser 3.90，使用 Arcade Physics
- ESLint + Vitest

### 2.2 Runtime Boundary

```text
React DOM Layer
├── Identity lockup
├── Quick Access
├── Interaction prompt
└── Content side panels

        ↕ typed LabBridge events

Phaser Canvas Layer
├── LabScene
├── Player movement
├── Collision bodies
├── Interaction zones
└── Room ambience / station animation
```

状态所有权：

- Phaser 保存角色坐标、速度、碰撞、附近站点和场景动画。
- React 保存当前打开的内容面板和 Quick Access 状态。
- `src/game/bridge.ts` 是两层之间唯一的业务通信边界。
- Phaser 使用动态导入，React 身份信息和 Quick Access 可以优先显示。

### 2.3 Implemented Experience

- 960 × 540 的固定逻辑分辨率，通过 `Phaser.Scale.FIT` 响应式缩放。
- WASD 和方向键四方向移动。
- 房间边界、中央 Core、设备、服务器和生活角碰撞。
- 五个站点：Lab Companion、Experience Archive、Living AI Core、Selected Work、Future Gate。
- 靠近站点后出现交互提示，支持 `E`、空格和鼠标点击。
- 打开 React 内容侧栏时暂停角色控制，关闭后恢复。
- 支持 `Escape` 关闭内容面板。
- Quick Access 使用可展开菜单，无需操作游戏即可浏览内容。
- 中央 Living AI Core、地面管线和香港雨夜窗口使用程序化占位视觉。
- 青、紫、洋红为系统光效，暖琥珀色用于生活角与 Experience 区域。

### 2.4 Verification

当前通过：

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

Phaser 被拆分为独立延迟加载构建块。React 初始构建块约 198 kB，Phaser 场景块约 1.21 MB；后续正式素材加入后需要继续监控首屏和资源加载预算。

## 3. Known Limitations

当前版本验证的是空间和架构，不是最终设计稿：

- 房间、城市、设备和角色都由 Phaser Graphics 程序化绘制。
- Player 只有单张占位纹理，没有四方向步行动画和 idle 状态。
- 碰撞体是简化矩形，尚未与最终家具轮廓匹配。
- 房间布局仍硬编码在 `LabScene.ts`，还没有使用 Tiled。
- 五个站点内容大多是结构占位，缺少真实经历、指标、截图和工程证据。
- 尚未实现访问记录、探索进度或站点完成状态。
- 移动体验当前以桌面键盘为主；手机用户依赖 Quick Access。
- 没有 Boot sequence、声音、环境音、存档或真实 AI Assistant。
- 暂无正式像素素材清单、尺寸规范和版权台账。

## 4. Next Iteration — v0.2 Interaction Vertical Slice

### Goal

在不依赖最终美术的情况下，把当前房间变成一个稳定、可测试、可演示的完整交互切片。下一轮重点是“走起来和用起来是否自然”，不是增加更多内容或特效。

### Priority 1 — Room Playability

- 实测中央 Core、左右设备和生活角之间的通行宽度。
- 调整碰撞体，确保角色不会被家具夹住或进入视觉上不可达的区域。
- 将站点布局数据从 `LabScene.ts` 抽离成独立配置，减少场景文件体积。
- 增加可开关的开发调试层，显示碰撞体、出生点和交互范围。

### Priority 2 — Character Feedback

- 制作临时四方向角色 sprite sheet。
- 增加 idle / walk 状态和正确朝向。
- 优化对角线移动、停止反馈和碰撞后的视觉稳定性。
- 在不增加复杂移动系统的前提下验证角色尺寸与房间比例。

### Priority 3 — Station Interaction

- 为五个站点统一 nearby、focus、visited 和 active 状态。
- 第一次靠近时提供简短教学，之后降低提示强度。
- 增加已访问状态，让房间逐渐点亮，但不设计任务或奖励系统。
- 完成一个代表性站点的全流程：靠近 → 交互 → 阅读 → 关闭 → 恢复移动。

### Priority 4 — Content Vertical Slice

- 优先完成 Experience Archive，而不是突出某个项目。
- 内容结构使用：背景 → 负责内容 → 关键决策 → 结果 / 证据。
- Selected Work 保持项目集合定位；LexiHK 只是其中一个可展开案例。
- Quick Access 和房间站点必须打开同一份内容数据，避免两套内容漂移。

### Priority 5 — Responsive and Accessibility

- 确认窄屏下身份栏、Quick Access、提示和侧栏不会互相遮挡。
- 保证所有内容不依赖 Canvas 也可以通过键盘和 Quick Access 访问。
- 验证 reduced motion、焦点顺序、Escape 关闭和侧栏焦点恢复。
- 暂不实现虚拟摇杆；先决定移动端应该使用触控移动还是以 Quick Access 为主。

### Acceptance Criteria

v0.2 完成需满足：

- 五个站点均可以通过移动 + 键盘完成交互。
- 没有已知的卡死点、穿墙点或不可关闭面板。
- 角色具有四方向 idle / walk 占位动画。
- Experience Archive 有一份接近真实发布质量的内容。
- 访问状态在房间和 Quick Access 中保持一致。
- 键盘用户无需鼠标即可浏览全部核心内容。
- TypeScript、ESLint、Vitest 和生产构建全部通过。

### Explicit Non-goals

下一轮不做：

- 正式完整像素美术
- 大地图、镜头滚动或第二个房间
- NPC 路径系统
- LLM、数据库或后端 API
- 战斗、任务、背包和游戏经济
- 复杂声音系统

## 5. Later Milestones

### v0.3 — Art and Map Pipeline

- 锁定 tile size、玩家尺寸和房间逻辑分辨率。
- 使用 Tiled 建立地图、碰撞层、出生点和站点对象层。
- 建立 sprites、tilesets、audio、ambience 的资源目录和命名规范。
- 用正式像素素材替换 Phaser Graphics，占位视觉逐步删除。

### v0.4 — Portfolio Content

- 完成个人介绍、经历和 Selected Work 内容。
- 每个案例明确问题、个人负责范围、技术决策、影响和证据。
- 加入 Resume、Contact 和必要的外部链接。
- 增加基础 SEO、Open Graph 和分享预览。

### v0.5 — Atmosphere and AI Evaluation

- 可跳过的短 Boot sequence。
- 环境音、交互音和默认静音策略。
- 少量有目的的 NPC 或隐藏细节。
- 评估 AI Companion 是否真的需要 LLM；若需要，再设计服务端边界、成本和安全策略。

## 6. Decision Log

### 2026-07-28

- 采用一个固定房间而不是 Peter Oravec 式开放地图。
- 确认 React 管内容、Phaser 管世界，中间使用薄事件桥。
- 确认 Quick Access 是招聘者和无障碍用户的必要路径。

### 2026-07-29

- 自由移动正式成为核心体验，不再使用纯点击场景。
- 青紫配色确认为偏好方向；差异化依赖香港环境与个人细节，而不是回避青紫。
- LexiHK 降为 Selected Work 中的一个案例，不承担网站主叙事。
- 完成 v0.1 程序化房间骨架，下一轮转向交互垂直切片。
