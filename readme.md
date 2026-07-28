
# Cyber AI Lab

## Interactive Pixel Portfolio for AI Engineer

> 一个赛博朋克像素风互动个人主页，通过探索一个未来 AI 实验室空间，展示个人经历、项目、技术能力以及 AI 工程理念。

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

- 一个固定场景
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
- 青紫霓虹光
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

用户通过点击对象进行交互。

不需要复杂移动系统。

---

# 7. Interactive Objects

---

# 7.1 AI Assistant

## Role

个人 AI 分身。

位置：

实验室中央。

## Interaction

点击机器人：

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

# 7.3 RAG Core

## Role

展示 AI 技术能力。

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
│   │   ├── projects.ts
│   │   └── stations.ts
│   ├── game/
│   │   ├── bridge.ts
│   │   ├── config.ts
│   │   ├── createGame.ts
│   │   ├── entities/
│   │   │   └── Player.ts
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   └── LabScene.ts
│   │   └── systems/
│   │       └── InteractionSystem.ts
│   ├── styles/
│   │   └── global.css
│   ├── ui/
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

# Version 0.1 - MVP

目标：

完成第一个可访问 Demo。

包含：

- 一个实验室场景
- 一个角色
- 4 个交互对象
- NPC 对话
- 项目展示

预计：

2 周

---

# Version 0.2

增强体验：

- Loading 页面
- 动画
- 音效
- 更丰富 UI

---

# Version 0.3

AI Integration：

增加：

- AI Assistant
- LLM Chat
- 动态项目介绍
- 隐藏彩蛋

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

1. 确定实验室视觉草图
2. 收集 / 生成像素素材
3. 创建 Phaser 基础场景
4. 实现 NPC 系统
5. 填充个人项目内容
6. 接入 AI Assistant
