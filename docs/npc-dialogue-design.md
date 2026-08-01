# Xiangyu's AI Lab — NPC and Dialogue Design

最后更新：2026-08-01  
状态：**角色方向已确认；运行时制作排在 v0.6 发布准备之后**

## 1. Product Role

NPC 的目标是让实验室更像一个有人维护、有记忆、也有未完成问题的地方。它们帮助访客理解 Xiangyu 的工程判断与经历，但不增加任务、奖励、背包、战斗或必须完成的教程。

首版对话使用人工编写的确定性分支，不接在线 LLM、数据库或后端。所有关键职业内容仍可通过现有 Quick Access 和语义化 React 面板直接访问，NPC 永远不是内容门槛。

## 2. Confirmed Roster

| 角色 | 发布优先级 | 房间职责 | 对话职责 | 首版位置 |
|---|---|---|---|---|
| ROOK | 首发 | 设备维护机器人 | 工程取舍、React / Phaser 边界、加载与失败恢复 | RAG Pipeline 附近的维护通道 |
| MIRA | 首发 | 香港夜班档案员 | 经历转折、公开记录、保密边界与下一步方向 | Experience Archive 与香港窗景之间 |
| NULL-03 | 后期解锁 | 未完成的研究原型 | 尚无定论的 AI 问题与未来实验 | Future Gate；首版不加载、不显示 |

Lab Companion 保持现有的三问快速导航，不改名、不被 ROOK 替代。ROOK 负责“系统为什么这样工作”，Lab Companion 负责“访客现在可以去哪里”。

## 3. Character Contracts

### ROOK — Maintenance Unit

- **轮廓：** 低重心四轮底盘、可伸缩工具臂、单颗琥珀检修灯；石墨与旧象牙色外壳。
- **性格：** 务实、略固执、句子短；更关心系统是否可靠，而不是技术听起来是否新。
- **动作：** 两帧待机、工具臂检查、面板扫描、朝向玩家；首版固定在维护区，不做自由寻路。
- **对话入口：**
  1. What keeps this room reliable?
  2. Why separate React from Phaser?
  3. What do you maintain before adding features?
- **内容路由：** Living AI Core、Selected Work；不得制造新的第六站点。

### MIRA — Night Archivist

- **轮廓：** 深色防雨研究外套、扎起的头发、档案挎包和保温杯；琥珀 / 朱红只用于生活痕迹。
- **差异化：** 正式 sprite 必须与 Xiangyu 拉开头发、外套长度、站姿和暖色配件，不能像玩家换装版本。
- **性格：** 冷静、观察细、带一点干幽默；回答比 ROOK 稍长，但不写成旁白小说。
- **动作：** 两帧待机、翻阅记录、喝茶、看向香港窗景；首版固定在档案区。
- **对话入口：**
  1. What changed between interactive games and AI products?
  2. What can this archive say in public?
  3. What is Xiangyu trying to build next?
- **内容路由：** Experience Archive、Selected Work、Future Gate。
- **公开边界：** 不说出敏感 Legal AI 项目名称、客户、数据、文档内容或内部界面。

### NULL-03 — Deferred Unlock

- 视觉设定保留为纤细、不对称、核心部分外露的未完成研究原型。
- 不进入首轮素材生产、地图、碰撞、Quick Access 或对话数据。
- 后期候选解锁条件：同一会话访问五个站点，并完成 ROOK 与 MIRA 各一条完整对话。
- 解锁只提供可选对话，不增加奖励、进度条或隐藏职业内容。
- 正式制作前重新确认体型；不得抢过 Living AI Core 和 Future Gate 的空间焦点。

## 4. Dialogue Runtime Contract

```text
Phaser NPC proximity / activation
              ↓ typed bridge
React semantic dialogue panel
              ↓ optional route
Existing station panel / visited state
```

- Phaser 只负责 NPC 位置、朝向、附近提示和激活动作。
- React 保存当前 NPC、问题、回答与本次会话完成状态，并继续负责焦点、Escape、移动端和 reduced-motion。
- 每个首发 NPC 只有 3 个问题；每个回答 2–4 句，可附一个现有站点跳转。
- 对话可随时关闭、重复打开；关闭后焦点返回 Canvas 或触发按钮。
- 对话打开时暂停玩家输入，但不暂停房间环境动画。
- 移动端不要求控制角色：ROOK 内容从 Living AI Core 提供入口，MIRA 内容从 Experience Archive 提供入口。
- 首版不做自由文本、打字机等待、好感度、任务状态、跨设备记忆或 NPC 自动寻路。

## 5. Art Contract

- 概念参考：[`../design/concepts/npc-rook-mira-null-concept-v1.png`](../design/concepts/npc-rook-mira-null-concept-v1.png)
- ROOK 建议运行时占位：约 56 × 44 px，可使用独立 2–4 帧动作条。
- MIRA 采用与玩家兼容的 40 × 48 px 脚点和遮挡规则；正式生产需四向待机，首版不要求行走动画。
- 保持硬边像素、有限色板和最近邻缩放；不直接缩小概念图作为 sprite。
- 正式素材必须单独生成、键控移除、人工裁切、量化并在资产台账登记。

## 6. Implementation Order

1. 写定 ROOK / MIRA 六条问题与回答，并通过公开内容边界审查。
2. 增加 typed NPC dialogue registry、bridge 事件和 React 对话面板。
3. 先用调试轮廓验证位置、碰撞、焦点返回与移动端等价入口。
4. 单独生产 ROOK sprite，完成一个 NPC 垂直切片。
5. 通过验收后生产 MIRA sprite；NULL-03 继续保持 deferred。

