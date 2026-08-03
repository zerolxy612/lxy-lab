# Xiangyu's AI Lab — NPC and Dialogue Design

最后更新：2026-08-04
状态：**ROOK / MIRA 游戏式双层对话切片已完成并通过桌面 / 移动端验收；NULL-03 保持 deferred**

## 1. Product Role

NPC 的目标是让实验室更像一个有人维护、有记忆、也有未完成问题的地方。它们帮助访客理解 Xiangyu 的工程判断与经历，但不增加任务、奖励、背包、战斗或必须完成的教程。

首版对话使用人工编写的确定性分支，不接在线 LLM、数据库或后端。所有关键职业内容仍可通过现有 Quick Access 和语义化 React 面板直接访问，NPC 永远不是内容门槛。

## 2. Confirmed Roster

| 角色 | 发布优先级 | 房间职责 | 对话职责 | 首版位置 |
|---|---|---|---|---|
| ROOK | 首发 | 设备维护机器人 | 机械幽默、房间异常，以及自然带出的可靠性判断 | RAG Pipeline 附近的维护通道 |
| MIRA | 首发 | 夜班档案员 | 档案趣闻、克制的世界观，以及公开记录的边界 | Experience Archive 与窗景之间 |
| NULL-03 | 后期解锁 | 未完成的研究原型 | 尚无定论的 AI 问题与未来实验 | Future Gate；首版不加载、不显示 |

Lab Companion 保持现有的三问快速导航，不改名、不被 ROOK 替代。ROOK 负责“系统为什么这样工作”，Lab Companion 负责“访客现在可以去哪里”。

## 3. Character Contracts

### ROOK — Maintenance Unit

- **轮廓：** 低重心四轮底盘、可伸缩工具臂、单颗琥珀检修灯；石墨与旧象牙色外壳。
- **性格：** 务实、略固执、句子短；更关心系统是否可靠，而不是技术听起来是否新。
- **动作：** 沿 Tiled 编写的五点维护路线巡逻；靠近玩家或打开对话时停止并朝向玩家。只做 waypoint 移动，不做自由寻路。
- **对话入口：**
  1. Has it always been this loud?
  2. What are you repairing?
  3. Say nothing.
- **内容路由：** 对第一条回答提供可选的 Living AI Core 入口；关键职业内容仍由 Quick Access 独立承载。

### MIRA — Night Archivist

- **轮廓：** 深色防雨研究外套、扎起的头发、档案挎包和保温杯；琥珀 / 朱红只用于生活痕迹。
- **差异化：** 正式 sprite 必须与 Xiangyu 拉开头发、外套长度、站姿和暖色配件，不能像玩家换装版本。
- **性格：** 冷静、观察细、带一点干幽默；回答比 ROOK 稍长，但不写成旁白小说。
- **动作：** 两帧待机、翻阅记录、喝茶、看向香港窗景；首版固定在档案区。
- **对话入口：**
  1. What are you recording?
  2. Is anything off-limits?
  3. Just passing through.
- **内容路由：** 前两条回答可选路由至 Experience Archive 与 Selected Work；不强制离开对话。
- **公开边界：** 不说出敏感 Legal AI 项目名称、客户、数据、文档内容或内部界面。

### NULL-03 — Deferred Unlock

- 视觉设定保留为纤细、不对称、核心部分外露的未完成研究原型。
- 不进入首轮素材生产、地图、碰撞、Quick Access 或对话数据。
- 后期候选解锁条件：同一会话访问五个站点，并完成 ROOK 与 MIRA 各一条完整对话。
- 解锁只提供可选对话，不增加奖励、进度条或隐藏职业内容。
- 正式制作前重新确认体型；不得抢过 Living AI Core 和 Future Gate 的空间焦点。

## 4. Dialogue Runtime Contract

```text
Phaser proximity ─→ short ambient bark above NPC
         │
         └─ activation + live anchor
                       ↓ typed bridge
          session-aware authored sequence
                       ↓
      React progressive game dialogue box
                       ↓ optional route
          existing station panel / visited state
```

- Phaser 负责 NPC 位置、朝向、附近提示和激活动作，并通过 typed bridge 提供当前角色锚点；不保存剧情状态。
- 玩家进入角色附近时，React 在 NPC 头顶短暂显示一句不暂停房间的 ambient bark；每名角色四句轮换。
- 正式互动使用游戏画面底部的渐进式对话框，复用正式角色 sprite 作为像素头像，并在场景中的 NPC 上显示说话者定位标记。
- 台词一次只显示一句；Enter / 点击逐句推进，到分支点才展示三个简短玩家选项。玩家选项只作为菜单出现，不进入聊天记录。
- 首次、再次、第四次交谈拥有不同开场；ROOK 可响应已访问的 Living AI Core，MIRA 可响应已访问的 Future Gate。
- 交谈次数与 ambient bark 轮换只保存到 `sessionStorage`，关闭标签页后重置；它们不构成任务、奖励或内容门槛。
- React 继续负责焦点循环、Escape、1–3 数字键、移动端和 reduced-motion；可选站点路由只在相关回答末尾出现。
- 对话可随时关闭、重复打开；关闭后焦点返回 Canvas 或触发按钮。
- 对话打开时暂停玩家输入和 ROOK 巡逻，但不暂停房间环境动画。
- 移动端不要求控制角色：ROOK 内容从 Living AI Core 提供入口，MIRA 内容从 Experience Archive 提供入口；正式对话改为带紧凑像素头像的底部单列界面。
- 首版不做自由文本、玩家对话历史、打字机等待、好感度、任务状态、跨设备记忆或 NPC 自动寻路。

## 5. Art Contract

- 概念参考：[`../design/concepts/npc-rook-mira-null-concept-v1.png`](../design/concepts/npc-rook-mira-null-concept-v1.png)
- ROOK 建议运行时占位：约 56 × 44 px，可使用独立 2–4 帧动作条。
- MIRA 采用与玩家兼容的 40 × 48 px 脚点和遮挡规则；四向各有站立与轻微手部动作，脚部不形成行走循环。
- 保持硬边像素、有限色板和最近邻缩放；不直接缩小概念图作为 sprite。
- 正式素材必须单独生成、键控移除、人工裁切、量化并在资产台账登记。

## 6. Implementation Order

1. 已把 ROOK / MIRA 的六条功利型问答改写为角色化分支，并增加首次、重复、熟悉和场景条件开场。
2. 已增加 typed NPC registry、实时角色锚点 bridge、环境气泡、渐进式游戏对话框与移动端等价入口。
3. 已把 ROOK 巡逻点、MIRA 固定点写入 Tiled，交互范围跟随移动角色。
4. 已分别生产 ROOK / MIRA 四向运行时 sprite，并登记源图与提示词。
5. ROOK / MIRA 的桌面角色定位、逐句推进、数字键、重复对话、移动端底部布局、Escape 与焦点返回已通过浏览器验收。
6. NULL-03 继续保持 deferred；下一轮可扩展更低频的房间状态彩蛋，但不引入任务系统。
