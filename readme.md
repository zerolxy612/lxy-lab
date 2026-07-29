
# Cyber AI Lab

## Interactive Pixel Portfolio for AI Engineer

> 一个赛博朋克像素风互动个人主页，通过探索一个未来 AI 实验室空间，展示个人经历、项目、技术能力以及 AI 工程理念。

当前状态：**v0.3 正式美术与地图管线（技术验收完成）**。Xiangyu 四方向角色、Living AI Core、Experience Archive 和 room base tileset v1 已接入；Tiled 已接管视觉表面、世界边界、碰撞、出生点和五个站点。招聘者内容仍有一个明确发布门槛：至少补充一条经 Xiangyu 确认、可公开的工作证据。下一步进入 v0.4：作品内容、Resume、Contact、SEO 与发布准备。

- 开发与下一轮计划：[Development Roadmap](./docs/development-roadmap.md)
- Tiled 对象层规范：[Tiled Map Schema](./docs/tiled-map-schema.md)
- 本地启动：`nvm use && npm install && npm run dev`
- 房间内操作：WASD / 方向键移动，`E` / 空格交互，`F2` 显示碰撞与交互范围

---

# 1. Project Overview

## 1.1 Background

传统个人主页通常采用：

```
About Me
    ↓
Experience
    ↓
Projects
    ↓
Skills
    ↓
Contact
```

这种形式信息完整，但缺少：

- 视觉记忆点
- 互动体验
- 个人特色
- 情绪连接

本项目希望借鉴 **Peter Oravec Portfolio** 的核心理念：

> 不展示一份简历，而创造一个用户可以探索的数字空间。

目标：

打造一个具有：

- 强视觉风格
- 轻量互动体验
- AI 工程展示能力
- 长期迭代价值

的个人品牌作品。

---

# 2. Product Vision

## 2.1 Core Concept

## Cyber AI Lab

一个发生在未来世界的 AI 研究实验室。

用户进入网站后，不是阅读传统网页，而是：

> 探索一个 AI Engineer 的数字工作空间。

体验流程：

```
SYSTEM BOOTING...

Loading AI Research Station...

ENTER

        ↓

Cyber AI Laboratory

        ↓

Explore
Discover
Interact
Chat
```

---

# 3. Design Philosophy

## 3.1 Not a Game

本项目不是为了制作完整游戏。

避免：

- RPG 系统
- 战斗机制
- 任务系统
- 复杂剧情
- 长时间探索

原因：

目标不是证明游戏开发能力。

目标是：

> 使用游戏化交互方式展示工程能力。

---

## 3.2 Core Experience

核心：

- 一个完整且可自由移动的房间
- 少量交互对象
- NPC 对话
- 项目展示
- AI 能力融合

用户体验：

```
Open Website

↓

Enter World

↓

Explore AI Lab

↓

Understand Engineer
```

---

# 4. World Setting

## 4.1 Story Background

世界：

```
Year: 2077

Location:
Hong Kong Future AI Research Center


Researcher:
Xiangyu


Mission:
Build AI-native applications
```

用户进入：

```
Welcome Visitor.

This is Xiangyu's AI Research Laboratory.

Explore systems,
projects and ideas.
```

---

# 5. Visual Design

## 5.1 Style Keywords

```
Cyberpunk
Neon
Future
AI Laboratory
Pixel Art
Sci-Fi
Hong Kong
```

---

## 5.2 Visual Elements

主要元素：

- 深色背景
- 青紫系统光与霓虹氛围
- 暖琥珀 / 朱红作为个人空间和记忆区域的辅助色
- 全息屏幕
- AI 服务器
- 机器人
- 数据流
- 未来城市窗口

参考方向：

```
Cyberpunk city
+
AI research lab
+
Pixel RPG style
```

青紫是有意选择的主色方向，但不能只依赖通用渐变和发光效果。香港雨夜、双语环境细节、个人物品和真实工程内容负责建立辨识度。

---

# 6. Scene Design

## 6.1 Main Scene

固定实验室场景：

```
                 CYBER AI LAB


        ┌────────────────────┐


              🤖

          AI Assistant


  🖥 RAG Core        📁 Projects


          👨‍💻 Engineer


              🚪 Future Gate


        └────────────────────┘

```

角色可以在房间内使用 WASD / 方向键自由移动。

靠近设备后按 `E` / 空格交互，也可以直接点击设备。移动用于探索空间，但不扩展成任务、战斗或大型 RPG 系统。

---

# 7. Interactive Objects

---

# 7.1 AI Assistant

## Role

个人 AI 分身。

位置：

实验室左上方的 Companion Dock，后续可以在房间内进行轻量移动。

## Interaction

靠近或点击机器人：

```
AI Assistant:

Welcome.

I am Xiangyu's AI assistant.

I can introduce:

- Experience
- Projects
- Technology
- Future Direction

```

---

## Future Extension

接入 LLM：

用户：

```
Show me one of Xiangyu's AI product projects.
```

AI：

```
Here is one selected AI product case study.

It explains:

- The problem
- Xiangyu's ownership
- Architecture decisions
- Product impact
- Evidence and outcomes
```

---

# 7.2 Engineer Avatar

## Role

展示个人经历。

内容：

```
AI Application Engineer


Experience:

Tencent IEG
2024


Hong Kong Generative AI R&D Center
2025 -


Focus:

Frontend Engineering
AI Application
Agent System
```

---

# 7.3 Living AI Core

## Role

房间中央的视觉与叙事核心，展示 AI 技术能力以及整个实验室如何连接。RAG 是其中一条系统管线，而不是网站主题本身。

展示：

```
Knowledge Pipeline


Documents

    ↓

Embedding

    ↓

Vector Database

    ↓

Retriever

    ↓

Reranker

    ↓

LLM

    ↓

Answer
```

---

## Technology Showcase

包括：

- RAG
- Agent
- Vector Search
- Knowledge Graph
- LLM Workflow

---

# 7.4 Project Terminal

## Role

项目展示中心。展示一组持续变化的代表性工作，不以任何单一项目作为网站主题。

形式：

未来电脑终端。

内容：

```
PROJECT DATABASE


[ Interactive Web Experiences ]

Frontend Engineering


[ AI Product Systems ]

Applied AI


[ Experiments ]

Building...
```

---

## Selected Project Example: LexiHK

LexiHK 是项目档案中的一个案例，用于说明 AI 产品与工程实践，但不是网站的视觉中心或主要叙事。

展示：

```
AI Legal Workspace


Features:

- AI Agent
- RAG Pipeline
- Evidence Chain
- Knowledge Graph
- Document Intelligence


Technology:

React
TypeScript
LLM
Vector Database

```

---

## Tencent IEG Detail

展示：

```
Interactive Web Experience


Features:

- Mini Game
- WebGL
- Performance Optimization
- Real-time Interaction

```

---

# 7.5 Future Gate

## Role

展示未来方向。

内容：

```
UNKNOWN FUTURE


Exploring:

AI Agent

Research

Large Scale AI Application

```

---

# 8. Technical Architecture

## 8.1 Recommended Stack

## Frontend

```
React
TypeScript
Vite
```

---

## Interactive Layer

推荐：

```
Phaser 3
```

负责：

- Scene
- Player movement
- Collision
- Sprite / NPC animation
- Interaction zones
- Room ambience

---

## UI Layer

React 负责：

- Dialog
- Panel
- Chat
- Project Detail
- Quick Access
- Accessible content fallback

架构：

```
React DOM Layer

    ↕ typed event bridge

Phaser Canvas Layer

    ↓

Walkable Pixel Room
```

状态边界：

- Phaser 保存角色位置、碰撞、动画和交互范围
- React 保存当前面板、Quick Access 和所有可读内容
- 两者只通过 `src/game/bridge.ts` 的类型化事件通信
- Phaser 延迟加载，身份信息和 Quick Access 优先显示

---

# 9. Project Structure

```
xiangyu-ai-lab/

├── public/assets/game/
│   ├── maps/
│   ├── tilesets/
│   ├── sprites/
│   ├── audio/
│   └── ambience/
├── src/
│   ├── app/
│   │   └── App.tsx
│   ├── content/
│   │   ├── experience.ts
│   │   ├── projects.ts
│   │   └── stations.ts
│   ├── game/
│   │   ├── art/
│   │   │   └── playerArt.ts
│   │   ├── bridge.ts
│   │   ├── config.ts
│   │   ├── createGame.ts
│   │   ├── entities/
│   │   │   └── Player.ts
│   │   ├── layout/
│   │   │   └── labLayout.ts
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   └── LabScene.ts
│   │   └── systems/
│   │       └── InteractionSystem.ts
│   ├── styles/
│   │   └── global.css
│   ├── ui/
│   │   ├── ExperienceArchive.tsx
│   │   ├── GameViewport.tsx
│   │   ├── InteractionPrompt.tsx
│   │   ├── PanelHost.tsx
│   │   └── QuickAccess.tsx
│   └── main.tsx
├── design/
├── package.json
└── readme.md
```

---

# 10. Asset Strategy

## 10.1 Background

不自行绘制。

方案：

AI 生成背景。

Prompt:

```
Cyberpunk AI research laboratory,
pixel art style,
top-down RPG view,
neon cyan and purple lighting,
futuristic computers,
Hong Kong cyber city atmosphere
```

---

## 10.2 Sprite

需要：

- Player
- Robot
- NPC
- Computer
- Server

来源：

- Pixel art asset
- AI generated sprite
- 手动修改

---

# 11. Development Roadmap

详细开发状态、限制、验收标准和决策记录维护在：

> [docs/development-roadmap.md](./docs/development-roadmap.md)

当前阶段：

- `v0.1` — 已完成可移动房间、碰撞、五个站点、React / Phaser 事件桥
- `v0.2` — 已完成稳定的交互垂直切片，当前仍使用程序化占位美术
- `v0.3` — 已完成像素规范、代表性正式美术切片与 Tiled 地图管线
- `v0.4` — 填充个人经历、代表性工作和工程证据
- `v0.5` — 最后评估真实 AI Assistant、音效和隐藏内容

---

# 12. Development Principles

## Experience First

优先考虑：

```
Experience > Complexity
```

不要为了技术堆砌：

- 复杂游戏逻辑
- 不必要框架
- 过度设计

---

## Content First

开发顺序：

```
World Concept

↓

Scene Design

↓

Interaction Design

↓

Implementation

↓

AI Integration
```

---

# 13. Success Criteria

成功标准：

## 5 Seconds

用户：

> 这个主页很特别。

---

## 30 Seconds

用户：

> 这个人懂前端和 AI。

---

## 3 Minutes

用户：

> 这个人真的做过 AI 产品。

---

# 14. Final Positioning

一句话：

> Cyber AI Lab is an interactive pixel-art portfolio that transforms an AI engineer's experience, projects, and technical journey into an explorable digital world.

---

# Next Steps

进入 `v0.4`：招聘者内容与发布准备。

1. 为 Experience Archive 补至少一条经本人确认、可公开的链接、截图或结果证据。
2. 把 Selected Work 扩展为“问题、责任、决策、结果、证据”的案例结构。
3. 增加 Resume、Contact、SEO、Open Graph 和分享预览。
4. 完成招聘者阅读路径与跨浏览器验证。
