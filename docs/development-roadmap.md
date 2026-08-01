# Xiangyu's AI Lab — Development Roadmap

最后更新：2026-07-31

本文档记录当前实现、技术决策、限制和下一轮方向。公开仓库介绍维护在根目录的 [`readme.md`](../readme.md)；本地 Codex 上下文保存在被 Git 忽略的 `.codex/project-context.md`。

## 1. Confirmed Product Decisions

| 主题 | 当前决定 | 对实现的影响 |
|---|---|---|
| 网站主角 | Xiangyu 本人、经历、工程方法与整体 AI Lab | 任何单一项目都不能成为首页或房间的绝对焦点 |
| 敏感 Legal AI 项目 | 以匿名案例进入 Selected Work | 可公开 HKGAI、Legal AI、government-facing 和前端职责；不公开项目名称、客户、数据与内部细节 |
| 核心体验 | 一个可以自由移动的完整房间 | Phaser 负责移动、碰撞、站点范围与场景动画 |
| 快速浏览 | 探索是选择，不是门槛 | React Quick Access 始终可以绕过 Canvas 访问内容 |
| 移动端 | 内容优先，暂不模拟桌面游戏控制 | 小屏依靠 Quick Access，不做低质量虚拟摇杆 |
| 视觉方向 | 青紫系统光为主，香港雨夜与个人物品建立辨识度 | 暖色只用于记忆、生活区域和少量强调 |
| AI Assistant | 后期能力，不是当前核心 | 先做策划问题和导航，再决定是否连接 LLM |

## 2. Current Implementation — v0.5 Release Baseline / v0.6 In Progress

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
├── Opt-in room ambience and preference
└── Accessible content panels

        ↕ typed LabBridge events

Phaser Canvas Layer
├── Player movement and collision
├── Station proximity / activation
├── Active / nearby / visited visuals
└── Visual ambience and debug overlay
```

Phaser 保存角色坐标、碰撞、附近站点和场景动画；React 保存当前面板、访问记录、快捷导航、公开 Contact 与 Web Audio 环境声偏好。`src/game/bridge.ts` 是两层间唯一业务通信边界，声音不进入站点事件协议。Phaser 动态导入，身份信息、Contact 和 Quick Access 可以先显示。

### 2.2 Stable Runtime and Interaction Baseline

- Tiled `.tmj` 是出生点、障碍物、碰撞和五个站点的唯一空间数据来源；固定建筑背景只承担视觉表现。
- 角色使用上、下、左、右 idle / walk 正式 spritesheet；对角移动归一化。
- 首次移动前显示 WASD 引导，移动后提示转为靠近站点探索。
- 五个站点统一支持 nearby、hover、active 和 visited 视觉状态。
- 房间与 Quick Access 共享访问记录；访问过的站点显示菱形标记和进度 `n/5`。
- Experience Archive 使用独立内容数据，展示真实经历方向与工作原则，不公开敏感 Legal AI 项目名称。
- Quick Access 与房间站点打开同一个 React 面板，避免两套内容漂移。
- 面板支持 Escape 关闭和焦点恢复；从房间打开时返回 Canvas，从 Quick Access 打开时返回稳定触发按钮。
- 邮箱和 GitHub 作为独立 DOM Contact 入口始终可达，不占用第六个地图站点。
- `prefers-reduced-motion` 同时影响 DOM 与 Phaser 场景动画。
- `F2` 可显示房间边界、碰撞体、交互范围和出生点。
- 小屏切换为内容优先的底部面板，并保留 44px 级触控目标。

### 2.3 Verification

当前通过：

- `npm run typecheck`
- `npm run lint`
- `npm run test`（14 个文件，36 项测试）
- `npm run build`

布局测试会检查站点注册表一致性、出生点安全性和正式站点素材的视觉 / 碰撞分离；事件桥与素材契约测试覆盖激活、访问状态和纹理尺寸；声音偏好测试覆盖默认静音、持久化和存储失败；发布契约测试锁定 v0.5 版本、SEO / 社交元数据与分享资产尺寸。

生产构建中 React 初始块约 214 kB（gzip 67 kB），延迟加载的 Phaser 块约 1.22 MB（gzip 325 kB）。Phaser 的体积提示仍存在，但不会阻塞 DOM 首屏。

## 3. v0.2 Acceptance Status

| 验收项 | 状态 | 说明 |
|---|---|---|
| 五站点可通过移动和键盘交互 | 完成 | WASD / 方向键 + E / 空格 |
| 无已知卡死点或不可关闭面板 | 完成 | 布局配置化；面板支持 Escape |
| 四方向 idle / walk 动画 | 完成 | 正式 40 × 48 px spritesheet |
| Experience Archive 发布级内容 | 部分完成 | 结构与真实经历已就位，公开证据和量化结果仍待补充 |
| 房间与 Quick Access 访问状态一致 | 完成 | React 状态通过 typed bridge 同步 |
| 键盘可浏览全部核心内容 | 完成 | Canvas、Quick Access、面板均可键盘操作 |
| 类型、Lint、测试、构建通过 | 完成 | 2026-07-30 验证 |

## 4. Known Limitations

- 五个互动站点、玩家、完整建筑背景、RAG Pipeline 与 Offline Corner 均已使用正式素材；其余小型环境道具仍按叙事优先级逐步补充。
- 玩家 v1 目前每方向只有 idle / walk 两帧，发布前仍需人工像素清理和更完整的步态验证。
- 碰撞体已进入 Tiled，但仍是简化矩形；其余正式家具确定后需要继续贴合。
- Tiled 对象层与首版视觉 tile layers 保留；v0.5 正式建筑背景已接管运行时房间底板、外框、材质和香港窗景。
- Experience Archive 缺少可公开截图、案例链接、量化影响和简历下载。
- 其余站点仍以结构性内容为主，Selected Work 的案例深度不足。
- 访问状态只保存在当前 React 会话，刷新后不会保留。
- 手机端以 Quick Access 为主，不提供触控移动。
- 关键路径已经手动浏览器验证，但尚未接入自动化端到端浏览器回归。
- ROOK / MIRA NPC 方向与对话职责已确认，但运行时尚未开始；首版明确不做复杂寻路。在线 AI Assistant 已在 v0.5 作出 no-go 决策，当前环境声为克制的程序化声场，不包含音乐、语音或空间定位。
- 正式像素规范、资产台账、三项代表性 sprite 与 room base tileset v1 已建立；其余 prop 清单留待后续扩展。

## 5. Completed Iteration — v0.3 Art and Map Pipeline

状态：**美术与地图技术验收已完成；发布内容验收仍有一项待确认**

已完成的第一步：

- 建立 `docs/pixel-art-spec.md`，锁定 16 px 网格、40 × 48 px 玩家帧、脚部碰撞和首版色彩 tokens。
- 生成并整理 Xiangyu 四方向 2 帧 spritesheet，保留生成源图和资产台账。
- 正式角色已接入 Phaser；下、左、右、上使用独立帧，不再依赖程序化占位角色或水平翻转。
- 浏览器实测角色加载、右向移动、首次移动状态和站点面板正常。
- Living AI Core v1 已接入，使用独立视觉范围、底座碰撞和基于 y 的玩家前后遮挡。
- 浏览器实测 Core 比例、点击交互和原有 React 面板协议正常。
- Experience Archive v1 已接入：暖色经历侧包含原创企鹅纪念物，冷色研究侧使用非 Logo 的 HKGAI / HKUST 线索。
- Archive 使用独立视觉、碰撞与标签间距；浏览器实测相邻站点无重叠，点击面板与 Quick Access 访问状态正常。
- 经历表述更新为 `HKGAI · HKUST-affiliated`，明确当前研究机构背景。
- 新增 `lab-v1.tmj`，将世界边界、玩家出生点、3 个静态障碍物和 5 个站点及其碰撞迁入 Tiled 对象层。
- `labLayout.ts` 改为运行时解析与校验边界，不再保存重复的硬编码坐标。
- 地图测试直接读取生产 `.tmj`，覆盖 16 px schema、站点完整性、出生安全和视觉 / 碰撞分离。
- 浏览器实测地图加载、正式素材显示、站点点击和 Quick Access 访问状态正常。
- Room base tileset v1 已接入，Floor 与 Structure 图层正式迁移到 Tiled；旧的程序化地板网格已移除。
- 首次浏览器检查发现单 tile 纹理过密后，将 16 个面板概念重新拆分为 256 个 16 px tiles；二次检查确认墙板、地板、窗景和站点层级清晰。

v0.3 美术与地图技术范围已经完成。Experience Archive 不再显示内部证据审批状态，但至少一条真实公开证据仍是招聘者版本的发布门槛；Resume、Contact 和发布路径进入 v0.4。

### Goal

保持现有交互契约不变，把程序化原型升级为有个人辨识度、可持续生产的房间美术系统。重点是先锁规范和一小块代表性正式素材，不一次性重画整个房间。

本轮从“像素尺寸规范 + Xiangyu 玩家角色设计”开始。玩家比例作为后续家具、站点和房间素材的统一尺度基准。

### Priority 1 — Visual Specification

- 锁定 tile size、角色逻辑尺寸、家具占地和像素缩放规则。（已完成并通过核心区域验证）
- 定义青紫主光、暖色生活区、背景黑阶和状态色 token。（首版已完成）
- 建立 sprite、tileset、prop、portrait、ambience 的命名及导出规范。
- 建立素材来源、生成方式、人工修改和版权台账。

### Priority 2 — Representative Art Slice

- 优先正式绘制玩家、中央 Living AI Core 和 Experience Archive 区域。（三项 v1 均已接入）
- 给角色补四方向 sprite sheet、idle 姿态和可辨识的个人细节。（v1 已接入）
- 用香港窗景、双语标记与桌面物品建立地域和人物记忆点。
- 保持当前青紫主色，但减少平均铺满的霓虹发光。

### Priority 3 — Map Pipeline

- 接入 Tiled 的碰撞层、出生点和站点对象层。（已完成）
- 将 `labLayout.ts` 从硬编码布局改为地图解析与校验边界。（已完成）
- 给地图数据增加自动校验，确保站点 ID 继续匹配内容注册表。（已完成）
- 制作基础 room tileset，迁移地板、墙体和主要建筑结构。（首版已完成）

### Acceptance Criteria

- 玩家和至少两个核心区域使用同一套正式像素规范。
- 正式角色在 960 × 540 逻辑分辨率下方向清晰、比例合理。
- 至少一个房间局部达到接近最终品质，玩家可在其中正常移动并与站点交互。
- 地图数据可以表达碰撞、出生点和五个站点，且通过自动校验。
- 替换素材后现有移动、访问状态、Quick Access 和无障碍路径不回退。
- Experience Archive 保持简洁，不展示内部审批状态或未经确认的敏感项目身份。
- 类型、Lint、测试和生产构建继续通过。

### Explicit Non-goals

- 第二个房间或开放大地图
- 战斗、任务、背包和游戏经济
- 复杂 NPC 路径系统
- LLM、数据库和后端 API
- 大规模声音系统

## 6. Current Iteration — v0.4 Content Identity

状态：**五个实现切片已完成；Resume、公开证据与跨浏览器验收待完成**

### Goal

保持“有趣的个人数字作品”为第一目标，把求职与合作信息作为可发现的第二层内容，而不是把实验室改造成传统简历页。

### Confirmed Content Boundary

- 五个站点名称、地图和世界观保持不变。
- Selected Work 聚焦两项真实工作：Tencent IEG 的 TON 生态 Web3 游戏，以及 HKGAI 的匿名政府场景 Legal AI 应用。
- Legal AI 案例可以公开 `Legal AI`、`government-facing Legal AI`、HKGAI 和前端职责。
- 不公开敏感项目名称、客户身份、数据内容与内部系统细节。
- 每个项目只展示一句核心介绍和一个技术信号；完整职责、指标和证明留给后续 Resume。

### First Slice

- 移除公开内容、代码标识与文档中的敏感项目名称。
- 用两项真实工作的简短介绍替换 Selected Work 泛化占位。
- 将 Tencent 的 React–Phaser event bridge 与 HKGAI 的流式回答、引用、文档和多步骤工作流作为 Living AI Core 的技术线索。
- 移除 Experience Archive 面向开发阶段的 evidence approval 占位。
- Future Gate 只提示未来 Resume 与 Contact，不提前制造无效入口。

### Second Slice

- Lab Companion 使用三个策划问题，不依赖 LLM 或后端。
- 每个回答解释一个真实方向，并可直接进入 Selected Work、Living AI Core 或 Future Gate。
- 引导完全可跳过、可重复打开，并复用现有站点访问记录与面板焦点管理。
- 问题数量限制为三个，避免把向导扩展成教程或伪聊天界面。

### Third Slice

- 900 px 以下改为“实验室视觉封面 + 底部档案索引”的内容优先构图。
- 手机与窄屏首次进入时自动展开 Archive Index；用户可以立即关闭，不强制完成引导。
- Quick Access 移入拇指可达的底部区域，菜单向上展开，并补充简短的档案说明。
- 选择站点后沿用既有行为：索引收起、内容面板打开、访问进度同步。
- 内容面板在手机和窄平板上限制为 32 rem，保持单栏阅读和至少 44 px 触控目标。

### Fourth Slice

- Phaser 动态导入、启动超时和地图 / 素材加载失败都有明确的 React 降级状态与重试入口。
- Canvas 失败时身份信息、Archive Index、Quick Access 和内容面板继续工作。
- 增加 description、author、robots、Open Graph 与 Twitter Card 元数据。
- 使用现有正式素材作为内部参考生成 1200 × 630 px 分享图，并记录完整资产来源与提示词。
- 增加 code-native SVG favicon 与基础 `robots.txt`。
- 启动失败会立即销毁残留 Phaser 实例；地图解析或图层创建异常直接进入 React 降级路径。
- 发布契约测试校验 v0.4 版本、发现元数据、分享图尺寸、favicon 和 robots。
- 最终域名尚未确定，因此 canonical、`og:url`、绝对 `og:image` URL 和 sitemap 暂不填写。

### Fifth Slice

- 公开 Contact 使用已确认的邮箱 `zerolxy612@gmail.com` 与 GitHub `@zerolxy612`。
- Contact 作为 React DOM 层的独立直接入口，不修改五个站点、Tiled 地图或访问进度协议。
- 桌面端使用左下方轻量通信条；900 px 以下移至右上方并保持 44 px 触控目标。
- GitHub 使用 `rel="me"` 身份关联；外链在新标签页打开，邮箱使用 `mailto:`。
- 内容测试锁定公开联系方式，避免未确认渠道或错误地址进入发布版本。

### Remaining v0.4

- 为至少一项代表性工作补充经本人确认、可公开的链接、截图或带上下文结果。
- 用户提供完整简历后接入 Resume。
- 确认最终域名后补 canonical、绝对分享 URL 和 sitemap。
- 完成 Safari、Firefox 与实际移动设备发布验收。

## 7. Completed Iteration — v0.5 Atmosphere and AI Evaluation

### v0.5 — Atmosphere and AI Evaluation

状态：**已完成并通过技术验收**

目标：让一个已经可用的实验室真正“活起来”，同时保持内容优先、单房间和低系统复杂度。

### First Slice — Startup Atmosphere

- 建立首版桌面启动序列，支持按钮与 `Escape` 立即跳过；其固定时长方案已在第八阶段升级为真实加载驱动。
- 900 px 以下保持内容优先，不播放启动序列；`prefers-reduced-motion` 用户同样直接进入。
- 启动序列保持在 Contact 和 Quick Access 下层，不阻断公开内容入口或 Canvas 降级路径。
- 动效只使用 opacity 与 transform，避免扩大 Phaser 包或引入新动画依赖。

### Second Slice — Room Signal System

- 五个站点的识别色进入 React 内容注册表，并通过测试锁定 Tiled 地图颜色一致性。
- Quick Access、访问状态、房间焦点框与 React 内容面板共享同一套站点信号色。
- 香港窗景加入暖色港口信号与双层雨线；`prefers-reduced-motion` 下保留静态雨景，不运行循环位移动画。
- 内容面板增加克制的实验室定位标记和结构线，不改变标题层级、焦点管理或移动端单栏路径。

### Third Slice — Formal Room Architecture

- 使用项目现有房间、tileset 和 Living Core 源图作为内部参考，生成并登记正式 960 × 540 建筑背景。
- 正式背景统一香港雨夜港景、墙体结构、地板磨损、检修格栅、冷暖维护光与前景门槛。
- Tiled 继续独占出生点、碰撞和站点空间数据；背景不烘焙任何交互对象或 UI。
- 保留双层运行时雨线和站点导管，移除程序化房间底板、几何城市和运行时 tile layer 叠加。
- 桌面 1280 × 720 与移动 390 × 844 实测 Canvas 正常进入 ready，Quick Access 和内容优先路径无回退。

### Fourth Slice — Formal Interactive Stations

- Lab Companion 替换为有充电座、传感器和克制表情的实体研究机器人。
- Selected Work 替换为一体式双联工程台：左侧暗示交互游戏系统，右侧以抽象文档、引用与响应流表达匿名 Legal AI 工作。
- Future Gate 替换为未完成的校准环，以不完整结构表达仍在形成的探索方向。
- 三件素材全部使用项目自有背景和正式素材作为内部参考，无第三方图像、公司 Logo、政府标识或敏感项目界面。
- Tiled 站点视觉范围、碰撞、交互范围和标签间距保持不变；Quick Access 与面板协议无修改。
- 桌面实测 Selected Work 点击打开正确面板；390 px 移动端五个正式站点可辨认且无水平溢出。

### Fifth Slice — Environmental Storytelling

- RAG Pipeline 从四个相同的程序化机柜升级为有资料入口、检索索引、rerank 结点和响应缓冲区的实体机器。
- Offline Corner 从几何沙发与控制台升级为一个连贯的休息 / 动手区域，加入原创企鹅玩偶、香港雨伞、茶、掌机、工具与植物。
- 两件素材全部使用项目自有正式背景、站点和玩家源图作内部参考；不包含公司 Logo、官方吉祥物、校徽或敏感文档。
- 保留 Tiled 中既有静态碰撞和房间布局；环境素材不新增站点、面板或访问状态。
- 动态只使用低强度数据光与暖色呼吸光，并遵守 `prefers-reduced-motion`。

### Sixth Slice — Room Ambience

- 使用 Web Audio 程序化合成香港雨声、低强度设备 hum 和约 11.5 秒一次的稀疏系统脉冲，不引入外部采样、音乐或音频版权依赖。
- 首次访问默认静音；用户必须主动开启，偏好以 `enabled` / `disabled` 写入本地存储。
- 已开启偏好刷新后进入 `READY`，在下一次可信用户输入时恢复，遵守浏览器自动播放限制。
- 页面隐藏时暂停声音上下文，返回时恢复；关闭采用短淡出，避免爆音。
- 声音控制作为独立 React DOM 入口，不修改 Phaser、五个站点、Tiled 地图或访问状态协议。
- 桌面使用 Quick Access 下方的设备控制条；移动端压缩为顶部 44 px `SND` 控制，不移除关键功能。

### Seventh Slice — Hidden Signals and AI Decision

- 香港窗景加入一次缓慢经过的暖色夜航信号，强化“雨夜仍在运转”的地域生活感；不循环刷屏。
- 首次访问 Living AI Core 后，RAG Pipeline 回应一次青紫数据包，建立系统之间的叙事连接，不增加任务或奖励 UI。
- `prefers-reduced-motion` 下两项位移动画均不运行，只保留静态微光。
- AI Companion 在 v0.5 明确 no-go for live LLM，继续使用三个确定性问题作为快速、可靠、无网络依赖的导航。
- LLM 只有在具备经确认的公开证据、引用、服务端安全和敏感信息阻断后才重新评估；完整理由见 [`ai-companion-decision.md`](./ai-companion-decision.md)。

### Eighth Slice — Loading-driven Cinematic Opening

- 桌面启动序列升级为真正的房间加载界面，接收 `runtime`、`room`、`assets`、`systems` 与 `ready` 五阶段 typed bridge 信号，不再依赖固定结束时间猜测房间状态。
- 开场使用分屏舱门、超大品牌字标、中央加载核心、四阶段遥测和真实进度条建立 v0.5 的标志性时刻；所有运动只使用 opacity 与 transform。
- 设定 2.8 秒最短叙事窗口；加载更慢时保持当前阶段，只有 Phaser 发出 ready 后才执行 620 ms 揭幕，避免黑屏或尚未完成的房间提前暴露。
- 加载错误会立即撤掉开场并交给既有 React 错误 / 重试路径；按钮与 `Escape` 仍可立即跳过。
- 900 px 以下继续内容优先并直接进入房间；`prefers-reduced-motion` 用户同样绕过整段开场。
- 桌面 1280 × 800 实测完整主视觉、自动揭幕和跳过路径；移动 390 × 844 实测直接进入、Quick Access 展开且无横向溢出。

### v0.5 Acceptance Result

- 正式房间、玩家、五个站点、RAG Pipeline 与 Offline Corner 使用同一像素语言。
- 移动、碰撞、站点状态、Quick Access、Canvas 降级和移动端内容路径未回退。
- 加载驱动的电影化开场、房间信号、环境声和隐藏细节均可跳过或绕过，并尊重用户偏好。
- 敏感 Legal AI 项目继续匿名，不公开项目名称、客户、数据或内部界面。
- TypeScript、Lint、14 个测试文件 / 35 项测试和生产构建通过。
- 桌面与 390 / 360 px 移动端完成关键路径浏览器验收。

## 8. Current Iteration — v0.6 Public Proof and Launch Readiness

状态：**第二切片已完成；量化结果、外部证据、Resume、最终域名与跨浏览器发布验收待完成**

### Goal

在不削弱实验室主体验的前提下，为招聘者、技术同行和潜在合作者增加一层可快速验证的专业证据。v0.6 不增加第二个房间、任务系统或新站点；可信度建设继续依附于 Selected Work、Resume、Contact 和发布元数据。

### First Slice — Public-safe Project Field Notes

- Selected Work 从两段简介升级为两份渐进展开的 field notes，默认仍保持简洁。
- 每份项目记录明确展示时间、生产背景、Xiangyu 的 ownership、系统边界、工程挑战、三项关键决策与交付结果。
- Tencent IEG 项目使用公开安全的 TON 生态 Web3 游戏描述；不展示非公开生产材料。
- HKGAI 项目继续使用匿名 government-facing Legal AI 描述，并在 UI 中明确项目名称、客户身份、数据、文档和内部界面不公开。
- `<details>` / `<summary>` 提供原生键盘操作；面板焦点循环已纳入 summary 控件。
- 桌面 1280 × 800 与移动 390 × 844 完成浏览器验收；手机端 ownership / system 自动切为单栏，展开后无横向溢出。
- 内容契约测试新增 ownership、challenge、delivery、三项 decisions 和 confidential disclosure 校验。

### Remaining v0.6 Direction

- 在获得确认资料后，为项目补充可公开链接、截图或量化结果；不以虚构数字和占位按钮制造“证据感”。
- 增加经本人确认的 Resume 下载与语义化快速入口。
- 确认最终域名后补齐 canonical、`og:url`、绝对分享图 URL 与 sitemap。
- 完成真实设备以及 Chrome、Safari、Firefox / Edge 的发布验收与问题收敛。

### Second Slice — Conversational Character Layer

- ROOK 与 MIRA 作为首轮可对话 NPC 进入运行时；NULL-03 不加载、不出现在地图或内容注册表。
- ROOK 沿 Tiled 五点路线巡逻，玩家靠近或对话打开时停止并朝向玩家；`prefers-reduced-motion` 下保持静止可交互。
- MIRA 固定在 Experience Archive 东侧，只使用站立与轻微档案动作，不播放行走循环。
- 六条回答全部人工编写并路由到现有五站点，不接在线 LLM、任务、好感度或新站点。
- React 负责语义化对话、焦点循环、Escape 与移动端入口；Phaser 只负责位置、朝向、附近提示和激活。
- Living AI Core 与 Experience Archive 分别提供 ROOK / MIRA 的移动端等价入口。

### Confirmed Later Direction — Character Expansion

- 首发 NPC 已实现为维护机器人 ROOK 与夜班档案员 MIRA；角色、对话和素材契约见 [`npc-dialogue-design.md`](./npc-dialogue-design.md)。
- NULL-03 保留为 Future Gate 后期解锁角色，不进入首轮素材和运行时开发。
- 首版采用人工编写的三问分支、ROOK waypoint 巡逻与 MIRA 固定位置，不增加 LLM、任务系统、新站点或复杂路径规划。
- 现有 Lab Companion 继续承担快速导航；ROOK 讲工程取舍，MIRA 讲经历与公开边界，避免角色职责重复。

## 9. Decision Log

### 2026-07-28

- 采用一个固定房间而不是 Peter Oravec 式开放地图。
- React 管内容、Phaser 管世界，中间使用薄事件桥。
- Quick Access 是招聘者和无障碍用户的必要路径。

### 2026-07-29

- 自由移动成为核心体验，不使用纯点击场景。
- 青紫确认为偏好方向；差异化来自香港环境、个人细节和真实内容。
- 敏感 Legal AI 工作以匿名案例进入 Selected Work，不承担网站主叙事。

- 完成 v0.1 程序化房间骨架。
- 完成 v0.2 交互垂直切片：布局配置化、四向反馈、访问状态、Experience Archive、调试层和响应式内容路径。
- v0.3 转向正式美术规范、代表性区域和地图数据管线。
- 完成 v0.3 代表性美术切片：Xiangyu 玩家、Living AI Core 与 Experience Archive v1 接入并通过浏览器交互验证。
- 完成 v0.3 正式美术与地图管线：room base tileset、Tiled 视觉 / 对象层、自动校验和最终交互回归全部就位。
- v0.4 确认以“有趣的个人数字作品”为第一目标，求职与合作信息作为第二层可发现内容。
- Tencent IEG 的 TON 生态 Web3 游戏和 HKGAI 的匿名政府场景 Legal AI 应用成为两项代表性工作。
- Lab Companion 采用三个确定性问题作为可选导航；真实 LLM 继续留待 v0.5 评估。
- 移动端采用默认展开的底部 Archive Index，实验室保留为视觉封面而不承担触控移动任务。
- v0.4 分享身份使用项目自身的像素素材建立，不引入外部图像；Canvas 失败不得阻断内容浏览。

### 2026-07-30

- v0.4 发布准备提交为 `3a1b6da`。
- 确认邮箱与 GitHub 为公开 Contact；Contact 保持 DOM 直接入口，不扩展地图站点数量。
- 房间整体简单的主要原因确认为正式素材与程序化占位的完成度断层，而不是地图面积不足。
- v0.5 采用固定正式建筑背景统一空间材质；Tiled 继续只承担可验证的空间契约，不在背景图片中复制交互数据。
- 下一轮先完成三个缺失站点，再增加少量个人叙事道具；不扩展第二个房间。
- 五个互动站点全部进入正式素材阶段；后续优先处理环境设备与生活痕迹，不增加站点数量。
- RAG Pipeline 与 Offline Corner 完成正式化；房间下一步转向默认静音的环境声和少量可发现细节，而不是继续铺满静态家具。
- 环境声采用 Web Audio 程序化合成并默认静音；不引入音乐和外部音频素材，下一轮优先做少量可发现细节。
- 根目录 README 改为面向公开访客的仓库首页；Codex 协作上下文迁入本地忽略文件，避免把内部工作说明当成作品介绍发布。
- v0.5 以两个克制隐藏信号完成氛围收尾；AI Companion 正式选择 no-go for live LLM，确定性三问导航继续作为生产方案。

### 2026-08-01

- v0.6 第一切片完成 Selected Work 公开安全 field notes。
- 对话 NPC 优先级确认为 ROOK、MIRA；NULL-03 仅保留为后期解锁角色。
- NPC 首版采用确定性分支；ROOK 采用 Tiled waypoint 巡逻，MIRA 保持固定，不改变五站点结构，也不引入复杂寻路或在线 LLM。
