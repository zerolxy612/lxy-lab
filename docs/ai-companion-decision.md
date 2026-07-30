# AI Companion Decision — v0.5

最后更新：2026-07-30  
状态：**No-go for live LLM in v0.5**

## Decision

v0.5 保留当前三个确定性问题与站点导航，不接入在线 LLM、后端会话或自由输入框。

这不是永久排除 AI Companion，而是确认当前版本中，实时生成回答不能提供足够独特的个人作品价值，不值得引入服务端、成本、延迟、隐私和失败路径。

## Why

- 访客的核心任务已经明确：理解 Xiangyu 做什么、为什么使用 React + Phaser、正在探索什么。
- 三个策划问题可以直接进入 Selected Work、Living AI Core 和 Future Gate，回答稳定且不制造事实漂移。
- 自由聊天容易把一个有辨识度的像素实验室变成通用 AI 聊天入口，并削弱个人作品主叙事。
- 公开内容包含匿名 government-facing Legal AI 经历；实时模型必须额外处理敏感名称、客户身份和内部信息边界。
- 当前站点内容量不足以证明检索、引用和生成式回答优于确定性导航。
- 静态部署、快速首屏、Canvas 降级和无障碍路径比“为了有 AI 而加 AI”更重要。

## Current Solution

Lab Companion 提供三个固定问题、简短回答和明确站点跳转：

1. What does Xiangyu build? → Selected Work
2. Why React + Phaser? → Living AI Core
3. What is he exploring now? → Future Gate

该路径可跳过、可重复使用、无网络依赖，并与 Quick Access 和访问状态复用同一内容协议。

## Revisit Conditions

只有同时满足以下条件才重新评估 LLM：

- 至少有数项经过本人确认、可公开且结构化的项目证据。
- 自由问答能解决固定导航无法解决的真实访客问题。
- 回答必须只基于公开资料，支持引用并明确不知道的内容。
- API key、限流、成本、日志、内容安全和降级路径全部位于服务端边界。
- 敏感 Legal AI 项目名称、客户、数据和内部细节有可测试的阻断规则。
- 关闭 LLM 后仍能完整访问当前确定性导航和全部公开内容。

在这些条件出现前，保持 no-go 是产品判断，不是技术欠债。
