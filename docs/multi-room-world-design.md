# Xiangyu's AI Lab — Multi-room World Design

最后更新：2026-08-12
状态：**Phase 1 与 Library 首个正式垂直切片已完成；Main Lab 实体入口退回设计阶段**

## 1. Product Decision

当前 `LabScene` 确认为整个作品的主场景与交通枢纽。后续最多增加三个有明确内容职责的房间，而不是扩建开放世界：

```text
Elevator Entrance
       ↓
Main Lab — 现在正在做什么
   ├── Archive Library — 写过什么、如何形成判断
   ├── After Hours — 工作之外的兴趣与性格
   └── Observatory — 相信什么、未来想去哪里
```

四个空间共同表达 Xiangyu，但不重复同一份简历内容：

| 空间 | 叙事时间 | 核心问题 | 主要内容 | 更新频率 |
|---|---|---|---|---|
| Main Lab | 现在 | Xiangyu 正在构建什么？ | About、CV、Selected Work、系统与 NPC | 中等 |
| Archive Library | 积累 | Xiangyu 如何学习、记录和形成判断？ | Blog、技术笔记、开发记录、随笔 | 高 |
| After Hours | 私人时间 | 离开工作台以后，他是什么样的人？ | 兴趣、音乐、游戏、轻对话和彩蛋 | 低 |
| Observatory | 未来 | Xiangyu 相信什么，下一步想去哪里？ | 职业规划、AI 观点、未来技术思考 | 很低 |

Main Lab 仍然是默认入口。招聘者只使用 Visitor Briefing 和 Quick Access，也能访问全部必要职业信息；其他房间奖励愿意探索的访客，但永远不是核心内容门槛。

## 2. World Principles

1. **Hub, not open world** — Main Lab 是稳定枢纽，三个房间都是短路径可达的独立场景，不增加大地图、寻路或加载漫游。
2. **One room, one emotional job** — 每个房间只承担一种主要情绪和内容职责，不复制 Lab 的五个站点。
3. **Readable content stays DOM-owned** — Phaser 负责空间、角色和反馈；长文、索引、链接、焦点与移动端继续由 React 管理。
4. **Direct access remains valid** — Blog 文章必须拥有独立 URL；Contact、CV 和 Selected Work 不要求先走到某个房间。
5. **Small scenes, dense details** — 每个新房间保持固定 960 × 540 逻辑画布和少量高质量互动点，不用面积代替内容。
6. **Transitions express place** — 门、短途升降机与屋顶通道建立空间关系；不在每次切换时重播五秒入场电梯。
7. **No progression economy** — 可以记录访问、台词和彩蛋，但不增加货币、经验、奖励、任务清单或强制解锁。

## 3. Main Lab — The Present

### Role

Main Lab 是世界中心，也是目前已经完成的正式主场景。它回答：“Xiangyu 现在是谁，正在构建什么？”

### Content Boundary

- Visitor Briefing：About、能力、Selected Work、CV snapshot 与 Contact。
- 五个正式站点：Lab Companion、Experience Archive、Living AI Core、Selected Work、Future Gate。
- ROOK 与 MIRA 的角色化对话。
- 三个房间入口以及始终可用的 Quick Access。

进入其他房间后返回 Main Lab，不重新播放 Boot、首次电梯或 Visitor Entry。玩家应回到离开时对应的入口附近，而不是统一回到初始出生点。

## 4. Archive Library — The Record

工作名：`ARCHIVE LIBRARY`。最终名称可以在美术概念阶段调整，但“Library”作为空间类型已经确认。

### Purpose

Library 是博客的游戏化入口。它不是第二个 Experience Archive：Experience Archive 展示正式职业经历，Library 展示持续形成中的技术判断、学习记录与个人观察。

### Visual Direction

- 地下或建筑内部的安静图书馆，与 Main Lab 保持空间连贯。
- 石墨书架、纸张、机械索引柜和少量未来检索设备并存。
- 暖琥珀阅读灯为主，青色只用于检索与状态反馈。
- 一张核心阅读桌、可移动梯、小型送书轨道和局部生活痕迹。
- 氛围安静、密集但不杂乱，与 Observatory 的开阔形成反差。

### Content Structure

首版已采用的分类：

- `Architecture`
- `Character Systems`
- `Experience Design`

房间内由 Reading Table 展示唯一精选记录，完整文章库由 `Catalog Terminal` 打开语义化 Blog Index。首个纵向切片不启用分类书架：当前三篇文章已经在 Catalog 中拥有清晰分类，重复入口不会增加发现价值。文章数量增长时不增加碰撞物或无限延长地图。

### Interaction Candidates

| 互动点 | 反馈 | 打开的内容 |
|---|---|---|
| Reading Table | 台灯亮起，展开一本书 | 当前精选文章 |
| Category Shelves | 对应书脊微亮 | 分类文章列表 |
| Catalog Terminal | 索引滚动与检索声 | 完整 Blog Index |
| Return Slot | 低频推出旧记录卡，靠近后显示当前编号 | 在非精选旧文章之间按次序循环 |

可以后期加入一名 Library NPC，但首个垂直切片不依赖新角色。MIRA 可以通过少量跨房间台词建立联系，不必立即制作新的管理员。

### Article Contract

- 每篇文章拥有稳定 slug 与独立 URL，例如 `/blog/agent-interface-notes`。
- 标题、摘要、发布日期、分类、阅读时间和正文由 `content/blog/<slug>/index.md` 管理。
- 正文使用语义化 React 页面或阅读层，不在 Phaser Canvas 中排长文。
- 文章 URL 可以直接访问；直接访问时不强制播放 Boot、电梯或走入 Library。
- 返回世界时恢复 Library 与玩家位置；关闭正文时焦点返回触发书架或 Catalog。
- 单作者通过仅限本地开发环境的 `/author` 工作台完成草稿、预览、图片、发布、修改与可恢复删除；内容仍是可审查、可版本控制的 Markdown 文件，不引入线上账号系统或数据库。
- 首版不做全文搜索、评论、点赞、多用户权限或线上 CMS；文章规模证明需要后再选择内容工具。

## 5. After Hours — The Person

工作名：`AFTER HOURS`。

### Purpose

这是放松与非功利化探索空间，用来表现工作之外的兴趣、审美与幽默。它不承担项目证明、技能列表或正式职业规划。

### Visual Direction

- 安静的深夜 listening bar，而不是拥挤的霓虹夜店。
- 暖橙、暗红和旧木 / 深色金属为主；Lab 的青色变成门缝与设备余光。
- 吧台、少量座位、唱片机、旧屏幕和真实感较强的私人物件。
- 环境声音更有音乐性，但保持默认静音和用户主动开启原则。

### Interaction Candidates

- `Jukebox`：切换少量环境主题，不建立音乐收藏或付费系统。
- `Drink Menu`：选择一种氛围，短暂改变灯光与 NPC 台词，不增加货币和道具栏。
- `Memory Wall`：游戏、音乐、电影、旅行或个人经历的小型彩蛋。
- `Corner Seat`：坐下后降低界面噪音，触发一段安静环境状态。
- ROOK / MIRA 的下班台词：不重复工程问答。

NULL-03 可以只通过一只无人认领的杯子、故障账单或占用频道留下痕迹，不必在首版正式登场。

## 6. Observatory — The Future

工作名：`OBSERVATORY`。定位确认：**思考未来的地方**。

### Scene

- 建筑屋顶，视觉上从地下 Lab 打开到大面积夜空。
- 可以看到香港城市天际线、远处建筑灯光、星星、缓慢移动的云与偶尔经过的卫星；地域作为远景存在，不在界面文案中反复强调。
- 核心道具包括望远镜、通信天线、星图终端、风向设备和一张可坐下的长椅。
- 信息密度显著低于 Lab 与 Library；留白、风声和远景是场景内容的一部分。
- 深夜蓝为主，城市暖光位于远处，青色只用于天线锁定与卫星轨迹。

### Content Pillars

1. `Career Trajectory` — 未来几年想成为怎样的工程师、想解决什么问题。
2. `Notes on AI` — 对 AI 产品、Agent、人机交互与责任边界的长期看法。
3. `Future Systems` — 对未来软件形态、技术方向和人机协作的思考。
4. `Unanswered Questions` — 尚无结论、但会持续观察的问题。

Observatory 不作为普通博客列表。这里只有 3–5 份低频更新、经过整理的长期观点；需要频繁发布的文章仍进入 Library。

### Interaction Candidates

| 互动点 | 世界反馈 | 内容角色 |
|---|---|---|
| Telescope | 镜筒转向并锁定一颗星 | Future Systems |
| City Edge | 城市灯光逐层亮起 | Career Trajectory |
| Signal Array | 天线转动、波形稳定 | Notes on AI |
| Bench | 玩家坐下，界面与声音安静下来 | Unanswered Questions |
| Satellite Pass | 短暂轨迹或未知信号 | 低频彩蛋 / NULL-03 伏笔 |

首版不放常驻 NPC。孤独、开放与不确定性是 Observatory 的情绪价值；如果需要叙事声音，优先使用 Xiangyu 的第一人称短文或偶发信号，不加入负责解释一切的导览角色。

## 7. Navigation and Transition Contract

### World Routes

- 初次入口：Boot → Elevator → Main Lab → Visitor Entry。
- Main Lab → Library：Experience Archive、MIRA 与 World Index 发起 `A-02 Archive Transfer`；桌面端进入独立短走廊，角色沿现有 Archive Wing 素材走入档案门，实体入口不占用 Main Lab 场景。
- Main Lab → After Hours：员工通道或维护侧门。
- Main Lab → Observatory：屋顶升降平台 / `ROOF ACCESS`。
- 新房间首版都直接返回 Main Lab，不建立 Library ↔ Bar 等横向连接。

入口电梯保留为外部访客进入 Main Lab 的一次性仪式，不承担内部房间交通。Main Lab 与 Library 之间使用独立的 Archive Wing 短走廊：桌面访客需要走过一段很短的阈限空间，移动端与 reduced-motion 路径直接切换；素材不再作为 Main Lab 内的大型实体门。不得重复身份验证、B1–B7 完整行程或 Visitor Entry。

Library 内部的返程口使用背景原画底部中央门体，并叠加与 A–02 同源的青色双片门反馈。抵达时短暂开合，返回时先开门后进入走廊，让路线两端都具有可读的空间因果。

Archive Wing 不是透明素材悬浮在空背景上的展示页。运行时用完整服务层外壳、透视地台、顶部结构梁、两侧设备柱与方向灯带把入口嵌入建筑；状态信息收敛到顶部路由头与底部控制栏，中央只保留角色和短距离行走。环境动画仅包含路线脉冲、低频工作灯和少量尘粒，不增加新的互动点。

### URL and Direct Access

- 世界状态建议映射到稳定路径：`/lab`、`/library`、`/after-hours`、`/observatory`。
- Blog Index 与文章使用 `/blog`、`/blog/:slug`，支持直接访问与分享。
- 从文章返回 Library 是增强体验；没有 Canvas 或在移动端仍能正常浏览全部文章。
- Quick Access 后续升级为 `World Index`，同时列出 Main Lab 内容与三个房间，不要求玩家走路才能跨场景。

## 8. Runtime Architecture Direction

现有 React + Phaser 边界继续适用，但在制作第二个正式房间前增加最小多房间层：

```text
Room Registry
├── room id / scene key / route
├── asset manifest
├── map loader
├── spawn points and exits
└── ambience profile

Typed Bridge
├── room:request
├── room:leaving
├── room:entered
└── room:error

Session World State
├── current room
├── last exit / return spawn
├── visited rooms and stations
└── lightweight NPC / easter-egg state
```

约束：

- `RoomId` 首版固定为 `lab | library | after-hours | observatory`，不为未知未来房间提前设计插件系统。
- 每个房间独立加载地图和重型素材；入口只预加载 Main Lab 所需内容。
- 公共玩家、输入、碰撞、深度排序与交互协议提取为共享模块；不要先创建包含所有可能钩子的复杂 `BaseRoomScene`。
- 每张地图拥有自己的 Tiled 文件和验证测试；不把所有房间塞进 `lab-v1.tmj`。
- 房间状态默认使用 `sessionStorage`，与电梯、访客入口和 NPC 对话保持同一生命周期。
- 环境声在转场时交叉淡化；进入新房间不重新请求一次用户授权。
- 首轮继续使用 960 × 540 固定逻辑分辨率，不引入滚动相机。

## 9. Mobile and Accessibility

- 移动端不增加虚拟摇杆，World Index 是主要导航。
- 每个房间都要有与其互动点对应的语义化内容索引。
- Blog 与 Observatory 长文必须支持普通滚动、标题层级、深链与键盘阅读。
- 房间转场可跳过，并尊重 `prefers-reduced-motion`。
- 打开内容时锁定 Phaser 输入；关闭后恢复到 Canvas 或触发按钮。
- Canvas 加载失败时，World Index、Blog、CV、Selected Work 与 Contact 仍然可用。

## 10. Explicit Non-goals

- 开放世界、无缝大地图或自由镜头。
- 战斗、任务日志、成就、背包、货币和好感度。
- 为每篇博客文章制作独立场景或实体书。
- 为四个房间重复制作 About、CV 和项目内容。
- 线上 Blog CMS、全文搜索、评论、多用户权限或访客账号。
- Observatory 的真实卫星 API、实时天气或天文数据。
- 为了扩展性提前建立通用场景编辑器或插件系统。

## 11. Recommended Implementation Order

### Phase 0 — Content and Route Inventory

- 确认首批 3–5 篇可公开 Blog 内容或至少确定真实标题与摘要。
- 为 Observatory 分别写出 Career、AI、Future 三份 100–250 字英文内容草稿。
- 确认 Library 的最终工作名与视觉参考方向。

### Phase 1 — Multi-room Foundation

状态：**已完成（2026-08-11）**

- 增加 `RoomId`、Room Registry、房间转场事件和会话世界状态。
- 将现有 Lab 注册为第一个 room，不改变它的游戏逻辑。
- 实现一个无正式美术的测试房间，验证进入、返回出生点、输入锁、错误降级和按房间加载素材。
- 将 Quick Access 的结构准备为可扩展 World Index，但不提前展示尚未可用的房间入口。

### Phase 2 — Archive Library Vertical Slice

状态：**首个正式切片已完成（2026-08-11）；内容扩充继续进行**

- 只制作一张阅读桌、一个分类书架和一个 Catalog Terminal。
- 建立 Blog 内容模型、Blog Index 与一篇完整文章路由。
- 验证从 Lab 进入 Library、打开文章、直接访问 URL、返回世界和移动端阅读。

### Phase 3 — Observatory Vertical Slice

- 先完成屋顶、城市远景、星空与一个 Telescope 互动点。
- 接入一份 `Future Systems` 内容与一次卫星经过的低频环境事件。
- 在视觉验收后再增加 Career、AI 与 Bench，不一次铺满所有终端。

### Phase 4 — After Hours

- 在 Library 与 Observatory 的房间协议稳定后制作。
- 第一切片只需要吧台、Jukebox、一个座位状态和少量非功利化对话。
- 音乐或外部音频素材必须单独确认来源、体积与授权。

## 12. Next Action

Phase 1 与 Library 首个正式垂直切片已经通过：Main Lab 已注册为 `lab`，Room Registry、typed transition protocol、`sessionStorage` world state、World Index、独立 Library 场景、正式背景 / 道具和三篇真实 Blog 文章均已接入。Archive Wing 的左墙位置实验已撤回，Main Lab 恢复原始布局；World Index 与文章直达路径目前承担 Library 访问入口。

Library 正式美术已接入，实体入口素材与组件已完成但暂不放入运行地图，环境方向记录于 [`archive-library-art-direction.md`](./archive-library-art-direction.md)。仍不同时生产三张完整房间背景：

1. Library 的构图、正式背景、Reading Table 与 Catalog Terminal 已按 Tiled 几何收敛；Main Lab Archive Wing 需要先重新确定空间位置，再恢复 Tiled 入口。
2. 三篇真实文章已经进入 Catalog；下一步审阅摘要节奏、分类密度与首屏扫描体验。
3. 内容达到 4–5 篇后，再决定是否需要书架分类与 Catalog Index 分组。
4. Library 视觉与内容验收后，再进入 Observatory 的屋顶垂直切片；After Hours 保持最后制作。

当前切片已经具备正式视觉基线，但仍不是 Library 的完整内容版本；新增元素必须承担发现、阅读或叙事职责。
