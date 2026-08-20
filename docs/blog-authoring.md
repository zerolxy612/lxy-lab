# Blog 单作者管理指南

Archive Library 的文章采用“本地工作台 + Markdown + Git”方案。只有仓库拥有者可以在自己的电脑上管理内容，线上网站不提供登录页、管理接口或数据库。

## 打开管理工作台

项目要求 Node.js 24。进入项目后运行：

```bash
npm run dev
```

然后访问 Vite 显示的本地地址并在末尾加上 `/author`，通常是 `http://localhost:5173/author`。

生产构建中的 `/author` 只显示不可用说明；真正的写入接口只挂载在本地开发服务器中。

## 一篇文章的完整流程

1. 在左栏填写英文或数字组成的 slug，例如 `building-a-local-rag-pipeline`，然后创建草稿。
2. 补全标题、分类、发布日期、阅读时间、摘要和 Core signal。
3. 在 Markdown 区写正文。每篇文章至少包含一个二级标题，例如 `## The decision`。
4. 对照右侧实时预览检查标题层级、列表、引用、链接和图片。
5. 上传 PNG、JPEG、WebP 或 GIF。工作台会把图片保存到文章专属目录，并在正文末尾插入 Markdown；请把 `Describe this image` 改成有意义的替代文本。
6. 写作期间保持 Draft，随时保存。准备公开时勾选 Published，再保存一次。
7. 如需把文章放到 Reading Table，勾选 Featured reading。系统会自动取消上一篇精选；所有公开文章中必须恰好有一篇精选。
8. 打开 Library 和文章直达页做最终检查，然后运行 `npm run blog:check`。
9. 查看 Git 变更并提交。部署仍沿用项目现有的 Git 发布流程。

## 编辑、删除与恢复

- 编辑：从左侧 Records 选择文章，修改后点击 Save changes。slug 创建后保持不变，以免破坏公开链接。
- 删除：Move to trash 会把 Markdown 和文章图片一起移到 `.trash/blog/`，不会立即永久删除。
- 恢复：在 Recoverable Trash 中点击 Restore。若相同 slug 已被重新使用，系统会拒绝覆盖。
- 图片：删除图片前先移除正文中的 Markdown 引用。图片删除是直接操作，因此界面会再次确认。

`.trash/` 不会提交到 Git，它只用于当前电脑上的短期恢复。Git 历史仍是已提交内容的最终恢复手段。

## 文件位置与约束

- 正文：`content/blog/<slug>/index.md`
- 图片：`public/assets/blog/<slug>/`
- 稳定地址：`/blog/<slug>`
- slug 只允许小写字母、数字和连字符。
- 标题最多 120 个字符，摘要最多 240 个字符，Core signal 最多 90 个字符。
- 单张图片不超过 8 MB；不要上传私密资料、客户数据或未获授权的素材。
- Draft 不会出现在公开 Catalog，也不会进入生产文章数据。

若工作台暂时不可用，也可以直接编辑 Markdown 文件；保存后本地页面会自动刷新，数据契约仍由 `npm run blog:check` 验证。
