# Archive Library — Art Direction v1

最后更新：2026-08-12
状态：**首个正式美术切片已完成并通过桌面 / 移动端验收**

## 1. Scene Intent

Archive Library 是 Main Lab 的安静反面：它仍属于同一座地下 AI Lab，但空间关注点从“机器正在运行”转为“判断如何被积累”。场景不应像传统木质图书馆，也不应变成霓虹酒吧；核心气质是深夜、专注、有人长期使用过。

概念源图：[`design/concepts/archive-library-environment-concept-v1.png`](../design/concepts/archive-library-environment-concept-v1.png)

## 2. Visual Pillars

1. **Contained warmth** — 暖光只集中在书架工作灯、阅读桌和少量维修灯；房间主体继续使用深蓝黑与石墨色。
2. **Physical records, future retrieval** — 书、纸卡、抽屉和机械轨道提供真实触感，Catalog Terminal 只承担未来检索信号。
3. **Landmarks before decoration** — 阅读桌、Catalog Terminal 和 Lab 出口保持三角识别关系；Return Slot 作为依附左侧书架的次级发现点，不与三个主地标竞争。
4. **Walkable negative space** — 中央及下半部保持大面积清晰地板，玩家不需要在高密度小物件之间绕行。
5. **One-world continuity** — 青色出口与终端连接 Main Lab；黄铜、纸张和琥珀光建立 Library 自己的身份。

## 3. Composition Contract

| 区域 | 当前 Tiled 契约 | 正式美术职责 |
|---|---|---|
| North shelves | `x 58–902 / y 72–174` | 连续机械书墙、少量轨道和检修灯；作为上墙主轮廓 |
| West / east wings | `x 58–152` 与 `x 808–902 / y 174–354` | 短书架翼，不向中央扩张新碰撞 |
| Reading table | `x 390–570 / y 268–338` | 暖光主焦点；桌面轮廓必须适配 180 × 70 碰撞 |
| Catalog terminal | `x 672–768 / y 352–414` | 冷色次焦点；屏幕朝向玩家活动区 |
| Main Lab exit | `x 416–544 / y 428–500` | 青色短途通道，不复制首次入场电梯 |
| Player spawn | `480 / 400` | 出生时可立即识别三个主互动点，且不在出口触发区内；Return Slot 留给继续探索的访客发现 |

## 4. Concept v1 Review

成立的部分：

- 暖琥珀与冷青信号的比例清楚，没有回到 Main Lab 的平均霓虹分布。
- 阅读桌、检索终端和底部出口形成稳定三角构图。
- 上墙书架建立了 Library 的即时识别度，中央路径保持开阔。
- 黄铜档案结构、纸张和旧式终端让空间不像第二个普通实验室。

进入运行时前必须调整：

- 概念中的阅读桌比当前 180 × 70 碰撞明显更大，需要缩小或同步调整 Tiled；默认优先缩小美术。
- Catalog Terminal 必须收敛到 96 × 62 逻辑碰撞附近，避免侵入出口路径。
- 两侧推车、箱柜与突出层架目前没有碰撞契约；首轮应删除或收回已有侧翼碰撞区域。
- 底部门体高度偏大，正式背景需保留角色在门前完整站立的视觉空间。
- 概念图包含所有道具，只作为构图参考；运行时不能直接整张接入，否则互动状态无法独立表现。

## 5. Runtime Asset Split

首轮只拆四组素材：

1. `library-room-background-v1.png` — 建筑壳、地板、上墙和不需要状态变化的书架结构。（v1 已接入）
2. `library-reading-table-v1.png` — 阅读桌、打开的书与灯；支持附近 / 激活暖光。（v1 已接入）
3. `library-catalog-terminal-v1.png` — 检索终端；支持屏幕扫描和访问状态。（v1 已接入）
4. `library-exit-overlay-v1.png` — 门缝、导轨和短途转场光，不包含完整电梯时间线。
5. `archive-wing-entrance-v1.png` — Archive Wing 旧透明入口组件；保留给 Main Lab 地面出口与历史回退，不再承担走廊完整背景。
6. `archive-wing-corridor-v2.png` — 960 × 540 Archive Wing 完整场景背景；墙体、门洞、地台与右侧转运端铺满画布，替代 v1 素材外加程序化建筑壳的组合。

背景保持 960 × 540；交互素材单独导出透明 PNG，并继续由 Tiled 决定碰撞与触发范围。正式素材生成前先用 40 × 48 玩家轮廓叠加验证比例。

## 6. Initial Content Shelf

以下是首轮 3–5 篇真实内容候选，不等同于已发布文章：

| Record | Working title | Category | Status |
|---|---|---|---|
| LOG-001 | Why This Lab Uses Two Runtimes | Frontend & Interaction | 已完成原型正文 |
| LOG-002 | Designing NPC Dialogue Without an LLM | AI Systems | 已完成正文并接入 Catalog |
| LOG-003 | The Elevator Is Part of the Portfolio | Engineering Notes | 已完成正文并接入 Catalog |
| LOG-004 | Public Proof Without Leaking Private Work | Field Notes | 需要本人确认公开边界后写作 |
| LOG-005 | Notes From a Lab That Closes After Midnight | Personal Logs | 个人化短文候选，避免全站只剩工程说明 |

LOG-003 已作为第三篇完整文章发布，记录电梯入场如何承担空间叙事、角色连续性、session 级仪式与无障碍退出。LOG-004 在没有本人确认前只保留标题，不补充工作细节；下一轮先审阅三篇文章在 Catalog 中的摘要节奏与分类密度。

## 7. Next Production Step

1. 以概念 v1 为构图参考，制作不含交互道具的 960 × 540 architecture-only 背景。（已完成）
2. 分别制作 Reading Table 与 Catalog Terminal 的透明源图，并按 Tiled 碰撞框缩放。（已完成）
3. 在 Phaser 中接入静态背景与两个正式互动素材，移除原型几何绘制。（已完成）
4. 浏览器验证桌面、390 × 844 内容路径、角色比例与交互命中。（已完成）
5. 曾在 Main Lab 左侧接入 Archive Wing 并完成 `E` / `Space`、鼠标和回程验证；因入口削弱原有空间构图，已撤回地图接入并恢复 Main Lab 基线布局。素材和组件保留，下一次接入必须先确定入口与墙体、动线和 AI Core 视觉中心的关系。

第三篇真实文章 LOG-003 已接入 Catalog 与独立 URL。Main Lab 实体入口回到设计阶段，Library 目前继续通过 World Index 和直达 URL 访问；下一步先做入口空间草图，不直接把现有 Archive Wing 素材重新放回地图。
