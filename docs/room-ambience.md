# Xiangyu's AI Lab — Room Ambience v0.5

最后更新：2026-07-30

## Experience Contract

- 首次访问必须默认静音，不请求权限、不自动播放。
- 用户主动开启后保存偏好；关闭后立即淡出并写回关闭状态。
- 浏览器重载后显示 `READY`，在下一次可信用户输入时恢复，避免绕过自动播放限制。
- 页面进入后台时暂停音频上下文，回到前台时恢复，减少无意义的资源占用。
- 声音开关必须是 React DOM 控件，支持键盘、清晰的 `aria-label`、`aria-pressed` 和至少 44 px 触控目标。
- Canvas 加载失败不影响声音开关；声音状态也不进入 Phaser / React 站点事件桥。

## Sound Layers

| Layer | Implementation | Role |
|---|---|---|
| Hong Kong rain | 循环噪声缓冲 + 520 Hz high-pass + 5.8 kHz low-pass | 建立雨夜窗外空间，不模拟暴雨或音乐节奏 |
| Machine hum | 52 Hz 正弦基频 + 104 Hz 三角谐波 + 0.08 Hz 轻微调制 | 给大型设备极低强度的持续存在感 |
| System pulse | 约 11.5 秒一次的 620–880 Hz 短脉冲，轻微随机声像 | 提示实验室仍在运行，不作为交互奖励音 |

三层统一进入低增益 master，并以 0.8 秒淡入、约 0.22 秒淡出。系统没有背景音乐、语音或高频通知音。

## Technical Boundary

- 入口组件：`src/ui/RoomAmbienceControl.tsx`。
- 声音引擎：`src/audio/roomAmbience.ts`。
- 偏好键：`xiangyu-ai-lab:room-ambience`，只保存 `enabled` / `disabled`。
- 生产方式：浏览器 Web Audio API 程序化合成；没有外部音频文件、第三方采样或生成式音频素材。
- 当前不与人物坐标、站点距离或面板状态联动，避免过早建立复杂的空间音频系统。

## Acceptance Criteria

- 首次加载为 `OFF`，不创建播放中的音频上下文。
- 点击开关后进入 `ON`，再次点击立即回到 `OFF`。
- 已开启状态刷新后进入 `READY`；用户下一次指针或键盘输入后恢复为 `ON`。
- 音频设备或自动播放解锁在 1.5 秒内未响应时安全退回 `OFF` 并清除开启偏好，不得无限停留在 `STARTING`。
- `localStorage` 被禁用时仍能使用当前会话控制，且不会导致应用崩溃。
- 桌面和 390 px 移动端不遮挡身份、Contact、Quick Access 或核心内容路径。
- TypeScript、Lint、测试和生产构建继续通过。
