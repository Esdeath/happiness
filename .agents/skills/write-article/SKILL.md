---
name: write-article
description: 为「追寻幸福」站点产出内容的全流程 skill。只要用户想往本站添加内容，就使用本 skill——包括：给一段素材或主题让写文章、给一篇现成文章让排版入库、给英文文章让翻译成中文、给一个链接让提取全文并翻译、给一个书名让围绕幸福及相关主题总结成书单条目和读书笔记。用户说"写一篇关于 X 的文章""把这篇排版一下""翻译这篇/这个链接""推荐/总结某本书"等都应触发。
---

# 为「追寻幸福」站点写文章

本站是面向中文读者的幸福主题内容站（Astro 5），内容分两个集合：

- **posts**（`src/content/posts/`）：文章、访谈、读书笔记，展示在文章列表页
- **books**（`src/content/books/`）：书单条目，按 category 分组展示在书单 grid 页

无论输入是什么，最终产物都是落在这两个目录里、frontmatter 通过 schema 校验、符合站点排版规范的 Markdown 文件。

## 第一步：判断输入类型，选择模式

| 用户给的是 | 模式 | 先读 |
|-----------|------|------|
| 一个主题或一段素材，要求写文章 | 原创写作 → posts | `references/formatting.md` |
| 一篇写好的中文文章 | 排版入库 → posts | `references/formatting.md` |
| 一篇英文文章（粘贴的全文） | 翻译 → posts | `references/translation.md` |
| 一个 URL | 提取 + 翻译 → posts | `references/translation.md` |
| 一个书名 | 幸福视角书籍总结 → books + posts 各一篇 | `references/book-summary.md` |

判断不准时（比如给了中文链接），按最近的模式走：链接先用 WebFetch 提取全文，内容是中文就走排版入库，是英文就走翻译。

## 所有模式共享的规则

**文件命名**：英文短横线 slug，文件名即 URL（如 `on-gratitude.md` → `/posts/on-gratitude/`）。slug 取自标题的英文意译，简短可读。

**日期**：`pubDate` 用当天日期，运行 `date +%Y-%m-%d` 获取，不要凭记忆写。

**tags**：先看现有文章用过哪些 tag（`grep -h 'tags:' src/content/posts/*.md src/content/books/*.md`），能复用就复用，避免一文一 tag 导致标签页碎片化。访谈类文章 tags 必须含 `访谈`，且需填 `interviewee`（填了 `intervieweeBio` 就必须同时填 `interviewee`，schema 会校验）。

**发布状态**：默认直接发布（不写 `draft`）。只有用户明确说"先存草稿"时才加 `draft: true`。

**站点语气**：温和、克制、有依据。引用研究时点明来源（学者名/书名），不堆砌励志口号。强调词用直角引号「」，与现有文章一致。

## 验证

写完文件后必须运行 `npm run build` 验证。frontmatter 字段错误时 build 会直接报错并指出文件；通过即说明 schema 和站点都没问题。如果用户想先预览，告诉他们 `npm run dev`（搜索功能 dev 下不可用，属正常）。

## 发布：commit 并 push

build 通过后自动提交并推送（push 即触发 Cloudflare Pages 部署）。仅当用户明确说「先不要提交」「不要推送」时跳过本步。

1. **只暂存本次产出的文件**：逐个 `git add <文件路径>`，不要用 `git add -A` 或 `git add .`，避免把工作区无关改动带进提交。
2. **commit message** 沿用仓库惯例（conventional commits + 中文描述）：
   - 文章：`post: 新增《文章标题》`
   - 书单（书籍总结模式产出两个文件，合为一个 commit）：`book: 新增《书名》书单条目与读书笔记`
   - 修改已有内容：`post: 修订《文章标题》（改了什么）`
3. **push**：`git push`。被拒时先 `git pull --rebase` 再 push 一次；仍失败则停下向用户报告，不要反复重试。

build 失败时不得提交，先修复再走本步。

## 最后：向用户报告

生成了哪些文件、对应的线上路径（`/posts/<slug>/` 或 `/books/<slug>/`）、build 是否通过、commit hash 与是否已 push（push 成功即等于已触发部署）。
