# 「追寻幸福」网站实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建成一个面向中文读者的「追寻幸福」主题静态内容站：文章+访谈、推荐书单（含购买链接位）、标签页、Pagefind 搜索、RSS、giscus 评论，部署 Cloudflare Pages。

**Architecture:** Astro 5 纯静态站点。内容是两个带 zod schema 校验的 Content Collection（posts、books），所有页面构建时生成。搜索由 Pagefind 在构建后生成静态索引；评论由 giscus 客户端脚本承载；无任何服务端运行时。

**Tech Stack:** Astro 5、@astrojs/rss、Pagefind、giscus、Vitest、Cloudflare Pages

**规格文档:** `docs/superpowers/specs/2026-06-10-happiness-website-design.md`（实现时若与本计划冲突，以规格为准并停下来确认）

**状态: ✅ 已完成（2026-06-10）** — 11 个任务全部以子代理驱动方式实现，每任务经规格合规与代码质量两道审查，最终整体审查通过后合并 main。与计划的偏差见文末"实施偏差记录"。

**约定（全计划通用）:**
- 工作目录即仓库根目录 `/Users/ruimin/Desktop/code/happiness`
- Node ≥ 20。所有命令在仓库根目录执行
- 每个 Task 结束必须 commit；commit message 用中文、约定式前缀（feat/test/docs/chore）
- `npm run build` 是兜底校验：schema 错误、引用错误都会让它失败

---

## 文件结构总览

```
package.json / astro.config.mjs / tsconfig.json / vitest.config.ts / .gitignore
.github/workflows/ci.yml
public/favicon.svg
src/
├── config.ts                  # 站点元信息 + giscus 配置（唯一需要手填的配置点）
├── content.config.ts          # posts/books 两个集合的 schema
├── content/
│   ├── posts/*.md             # 文章+访谈（含 1 篇 draft 示例）
│   └── books/
│       ├── *.md
│       └── covers/*.svg       # 占位封面，后续替换为真实封面图
├── lib/
│   ├── content.ts             # 纯函数：排序、标签聚合、日期格式化
│   └── content.test.ts
├── layouts/BaseLayout.astro   # HTML 外壳：head/导航(含搜索框)/页脚
├── components/
│   ├── PostCard.astro         # 列表用文章卡片
│   ├── BookCard.astro         # 列表用书籍卡片
│   ├── TagList.astro          # 标签链接组
│   ├── PurchaseLinks.astro    # 购买按钮组（nofollow sponsored）
│   └── Giscus.astro           # 评论区（未配置时不渲染）
├── pages/
│   ├── index.astro            # 首页：理念 + 最新5篇文章 + 最新4本书
│   ├── posts/index.astro
│   ├── posts/[slug].astro     # 含受访者介绍块（访谈）
│   ├── books/index.astro
│   ├── books/[slug].astro
│   ├── tags/[tag].astro
│   ├── about.astro
│   ├── search.astro           # Pagefind UI
│   ├── rss.xml.js             # 仅 posts
│   └── 404.astro
└── styles/global.css          # 设计令牌 + 中文排版
README.md
```

---

### Task 1: 项目脚手架，构建跑通

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `public/favicon.svg`, `src/styles/global.css`, `src/pages/index.astro`（临时占位，Task 6 重写）

- [x] **Step 1: 创建 `package.json`**

```json
{
  "name": "happiness",
  "type": "module",
  "version": "0.1.0",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@astrojs/rss": "^4.0.11",
    "astro": "^5.7.0"
  },
  "devDependencies": {
    "pagefind": "^1.3.0",
    "vitest": "^3.1.0"
  }
}
```

- [x] **Step 2: 创建 `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  // 首次部署 Cloudflare Pages 后改成实际地址（RSS 的绝对链接依赖它）
  site: 'https://happiness.pages.dev',
});
```

- [x] **Step 3: 创建 `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [x] **Step 4: 创建 `.gitignore`**

```
node_modules/
dist/
.astro/
```

- [x] **Step 5: 创建 `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="14" fill="#c9722e"/>
  <path d="M9 17c2 4 5 6 7 6s5-2 7-6" stroke="#faf6f0" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>
```

- [x] **Step 6: 创建 `src/styles/global.css`（设计令牌 + 中文排版基线）**

```css
:root {
  --color-bg: #faf6f0;
  --color-surface: #ffffff;
  --color-text: #3d3a34;
  --color-muted: #8a8378;
  --color-accent: #c9722e;
  --color-accent-soft: #f3e3d3;
  --color-border: #e8e0d4;
  --font-serif: "Noto Serif SC", "Songti SC", "SimSun", serif;
  --font-sans: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --max-width: 42rem;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  line-height: 1.8;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-serif);
  line-height: 1.4;
  font-weight: 600;
}

a { color: var(--color-accent); text-decoration: none; }
a:hover { text-decoration: underline; }

img { max-width: 100%; height: auto; }

article p { margin: 1.2em 0; }
article blockquote {
  margin: 1.2em 0;
  padding: 0.2em 1em;
  border-left: 3px solid var(--color-accent);
  background: var(--color-accent-soft);
  border-radius: 0 4px 4px 0;
}
```

- [x] **Step 7: 创建临时首页 `src/pages/index.astro`**

```astro
---
import '../styles/global.css';
---
<html lang="zh-CN">
  <head><meta charset="utf-8" /><title>追寻幸福</title></head>
  <body><h1>追寻幸福</h1></body>
</html>
```

- [x] **Step 8: 安装依赖并验证构建**

Run: `npm install && npm run build`
Expected: 构建成功，输出 `dist/index.html`

- [x] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: Astro 5 脚手架与设计令牌，构建跑通"
```

---

### Task 2: 内容模型与种子内容

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/posts/what-is-happiness.md`, `src/content/posts/interview-on-flow.md`, `src/content/posts/draft-example.md`
- Create: `src/content/books/flow.md`, `src/content/books/happier.md`, `src/content/books/covers/flow.svg`, `src/content/books/covers/happier.svg`

- [x] **Step 1: 创建 `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      pubDate: z.coerce.date(),
      summary: z.string(),
      tags: z.array(z.string()).min(1),
      cover: image().optional(),
      interviewee: z.string().optional(),
      intervieweeBio: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.string(),
      pubDate: z.coerce.date(),
      cover: image(),
      oneLiner: z.string(),
      tags: z.array(z.string()).min(1),
      purchaseLinks: z
        .array(z.object({ platform: z.string(), url: z.string().url() }))
        .default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts, books };
```

- [x] **Step 2: 创建示例文章 `src/content/posts/what-is-happiness.md`**

```markdown
---
title: 幸福是什么——从快乐到意义
pubDate: 2026-06-01
summary: 心理学把幸福拆成"享乐"与"意义"两个维度，这篇文章梳理两者的区别与联系。
tags: [心理学]
---

我们常把幸福等同于快乐，但积极心理学的研究提醒我们：短暂的愉悦和长期的意义感是两回事。

> 幸福不是终点，而是一种行进的方式。

（正文示例，可替换为真实内容。）
```

- [x] **Step 3: 创建示例访谈 `src/content/posts/interview-on-flow.md`**

```markdown
---
title: 访谈：在专注中找到幸福
pubDate: 2026-06-05
summary: 与一位正念练习者聊聊"心流"体验如何改变了她对幸福的理解。
tags: [访谈, 心理学]
interviewee: 李静
intervieweeBio: 正念冥想练习者，写作教练，practicing mindfulness 十年。
---

**问：你第一次体验到"心流"是什么时候？**

> 大概是十年前的一次长跑。那种完全沉浸的状态让我第一次觉得，幸福不是"得到什么"，而是"正在做什么"。

**问：它怎么改变了你对幸福的看法？**

> 我不再追逐结果了。（访谈正文示例。）
```

- [x] **Step 4: 创建草稿示例 `src/content/posts/draft-example.md`**

```markdown
---
title: 未完成的草稿（不应出现在线上）
pubDate: 2026-06-08
summary: 这篇是草稿，用于验证 draft 过滤逻辑。
tags: [心理学]
draft: true
---

如果你在线上看到这篇文章，说明 draft 过滤坏了。
```

- [x] **Step 5: 创建占位封面 `src/content/books/covers/flow.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
  <rect width="400" height="560" fill="#c9722e"/>
  <text x="200" y="280" text-anchor="middle" fill="#faf6f0" font-size="40" font-family="serif">心流</text>
</svg>
```

- [x] **Step 6: 创建占位封面 `src/content/books/covers/happier.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
  <rect width="400" height="560" fill="#7a8b6f"/>
  <text x="200" y="280" text-anchor="middle" fill="#faf6f0" font-size="34" font-family="serif">幸福的方法</text>
</svg>
```

- [x] **Step 7: 创建示例书籍 `src/content/books/flow.md`**

```markdown
---
title: 心流：最优体验心理学
author: 米哈里·契克森米哈赖
pubDate: 2026-06-02
cover: ./covers/flow.svg
oneLiner: 解释"完全沉浸"为何是幸福感最可靠的来源。
tags: [心理学]
purchaseLinks:
  - platform: 京东
    url: https://item.jd.com/12260628.html
  - platform: 当当
    url: http://product.dangdang.com/25229510.html
---

「心流」是积极心理学的奠基之作。（书评示例，可替换为真实推荐理由。拿到联盟佣金链接后，直接替换上方 purchaseLinks 里的 url 即可。）
```

- [x] **Step 8: 创建示例书籍 `src/content/books/happier.md`**

```markdown
---
title: 幸福的方法
author: 泰勒·本-沙哈尔
pubDate: 2026-06-06
cover: ./covers/happier.svg
oneLiner: 哈佛积极心理学课的精华：幸福是可以学习的能力。
tags: [心理学, 生活方式]
purchaseLinks: []
---

哈佛大学最受欢迎课程的书面版。（书评示例。purchaseLinks 为空数组时详情页不渲染购买按钮。）
```

- [x] **Step 9: 验证 schema 校验生效**

Run: `npm run build`
Expected: 构建成功（schema 全部通过）。再做反向验证：临时把 `flow.md` 的 `pubDate` 改成 `pubDate: 不是日期`，运行 `npm run build`，Expected: 构建失败并指出 `flow.md` 的字段错误；然后改回来再 build 确认通过。

- [x] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: posts/books 内容模型与种子内容"
```

---

### Task 3: 内容工具函数（TDD）

**Files:**
- Create: `vitest.config.ts`, `src/lib/content.ts`, `src/lib/content.test.ts`

- [x] **Step 1: 创建 `vitest.config.ts`**

```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: { include: ['src/**/*.test.ts'] },
});
```

- [x] **Step 2: 写失败的测试 `src/lib/content.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { sortByDateDesc, collectTags, formatDate } from './content';

const entry = (date: string, tags: string[] = ['心理学']) => ({
  data: { pubDate: new Date(date), tags },
});

describe('sortByDateDesc', () => {
  it('按发布日期从新到旧排序', () => {
    const sorted = sortByDateDesc([entry('2026-06-01'), entry('2026-06-05'), entry('2026-06-03')]);
    expect(sorted.map((e) => e.data.pubDate.toISOString().slice(0, 10))).toEqual([
      '2026-06-05',
      '2026-06-03',
      '2026-06-01',
    ]);
  });

  it('不修改原数组', () => {
    const input = [entry('2026-06-01'), entry('2026-06-05')];
    sortByDateDesc(input);
    expect(input[0].data.pubDate.toISOString().slice(0, 10)).toBe('2026-06-01');
  });
});

describe('collectTags', () => {
  it('合并多个集合的标签并去重', () => {
    const tags = collectTags([
      entry('2026-06-01', ['心理学', '哲学']),
      entry('2026-06-02', ['心理学', '访谈']),
    ]);
    expect(tags).toHaveLength(3);
    expect(tags).toContain('心理学');
    expect(tags).toContain('哲学');
    expect(tags).toContain('访谈');
  });
});

describe('formatDate', () => {
  it('输出中文长日期，时区固定为 Asia/Shanghai', () => {
    expect(formatDate(new Date('2026-06-10'))).toBe('2026年6月10日');
  });
});
```

- [x] **Step 3: 运行测试确认失败**

Run: `npm test`
Expected: FAIL，报 `Cannot find module './content'`（或同义错误）

- [x] **Step 4: 实现 `src/lib/content.ts`**

```ts
interface Dated {
  data: { pubDate: Date };
}

interface Tagged {
  data: { tags: string[] };
}

export function sortByDateDesc<T extends Dated>(entries: T[]): T[] {
  return [...entries].sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

export function collectTags(entries: Tagged[]): string[] {
  const tags = new Set<string>();
  for (const e of entries) for (const t of e.data.tags) tags.add(t);
  return [...tags].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'long',
  timeZone: 'Asia/Shanghai',
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}
```

- [x] **Step 5: 运行测试确认通过**

Run: `npm test`
Expected: PASS，4 个测试全绿（审查阶段补 2 个用例后为 6 个）

- [x] **Step 6: Commit**

```bash
git add vitest.config.ts src/lib/
git commit -m "feat: 内容排序/标签聚合/日期格式化工具函数（含测试）"
```

---

### Task 4: 站点配置、基础布局、关于页与 404

**Files:**
- Create: `src/config.ts`, `src/layouts/BaseLayout.astro`, `src/pages/about.astro`, `src/pages/404.astro`

- [x] **Step 1: 创建 `src/config.ts`**

```ts
export const SITE = {
  title: '追寻幸福',
  description: '关于幸福的文章、访谈与书单。',
};

// giscus 评论配置。三步开通：
// 1. 网站代码推到 GitHub 公开仓库，并在仓库 Settings 里启用 Discussions
// 2. 打开 https://giscus.app，选择该仓库，按页面提示生成参数
// 3. 把生成的 repo / repoId / category / categoryId 填到下面
// repo 留空时，评论区整体不渲染（不影响正文阅读）。
export const GISCUS = {
  repo: '',
  repoId: '',
  category: 'Announcements',
  categoryId: '',
};
```

- [x] **Step 2: 创建 `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
import { SITE } from '../config';

interface Props {
  title?: string;
  description?: string;
}

const { title, description = SITE.description } = Astro.props;
const pageTitle = title ? `${title} · ${SITE.title}` : SITE.title;
---

<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate" type="application/rss+xml" title={SITE.title} href="/rss.xml" />
    <title>{pageTitle}</title>
  </head>
  <body>
    <header class="site-header">
      <nav>
        <a class="brand" href="/">{SITE.title}</a>
        <div class="links">
          <a href="/posts">文章</a>
          <a href="/books">书单</a>
          <a href="/about">关于</a>
        </div>
        <form class="search" action="/search" method="get">
          <input type="search" name="q" placeholder="搜索…" aria-label="站内搜索" />
        </form>
      </nav>
    </header>
    <main>
      <slot />
    </main>
    <footer class="site-footer">
      <p>{SITE.title} · <a href="/rss.xml">RSS 订阅</a></p>
    </footer>
  </body>
</html>

<style>
  .site-header {
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
  }
  nav {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0.8rem 1rem;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    flex-wrap: wrap;
  }
  .brand {
    font-family: var(--font-serif);
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-text);
  }
  .links { display: flex; gap: 1rem; }
  .links a { color: var(--color-text); }
  .links a:hover { color: var(--color-accent); }
  .search { margin-left: auto; }
  .search input {
    border: 1px solid var(--color-border);
    border-radius: 999px;
    padding: 0.3rem 0.9rem;
    background: var(--color-bg);
    font-size: 0.9rem;
  }
  main {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 2rem 1rem 4rem;
  }
  .site-footer {
    border-top: 1px solid var(--color-border);
    text-align: center;
    color: var(--color-muted);
    font-size: 0.9rem;
    padding: 1.5rem 1rem;
  }
</style>
```

- [x] **Step 3: 创建 `src/pages/about.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="关于">
  <h1>关于本站</h1>
  <p>这是一个关于"追寻幸福"的小站：记录关于幸福的思考、与人对话，并推荐值得一读的书。</p>
  <p>（站主可在 <code>src/pages/about.astro</code> 中替换为真实的自我介绍。）</p>
</BaseLayout>
```

- [x] **Step 4: 创建 `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="页面不存在">
  <h1>404</h1>
  <p>这个页面不存在。也许可以从<a href="/">首页</a>重新出发。</p>
</BaseLayout>
```

- [x] **Step 5: 构建验证**

Run: `npm run build`
Expected: 成功，`dist/about/index.html` 与 `dist/404.html` 存在

- [x] **Step 6: Commit**

```bash
git add src/config.ts src/layouts/ src/pages/about.astro src/pages/404.astro
git commit -m "feat: 站点配置、基础布局（导航/搜索框/页脚）、关于页与 404"
```

---

### Task 5: 卡片与标签组件

**Files:**
- Create: `src/components/TagList.astro`, `src/components/PostCard.astro`, `src/components/BookCard.astro`

- [x] **Step 1: 创建 `src/components/TagList.astro`**

```astro
---
interface Props {
  tags: string[];
}
const { tags } = Astro.props;
---

<ul class="tags">
  {tags.map((tag) => (
    <li><a href={`/tags/${tag}`}>{tag}</a></li>
  ))}
</ul>

<style>
  .tags {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .tags a {
    font-size: 0.8rem;
    background: var(--color-accent-soft);
    color: var(--color-accent);
    padding: 0.1rem 0.6rem;
    border-radius: 999px;
  }
  .tags a:hover { text-decoration: none; filter: brightness(0.95); }
</style>
```

- [x] **Step 2: 创建 `src/components/PostCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { formatDate } from '../lib/content';
import TagList from './TagList.astro';

interface Props {
  post: CollectionEntry<'posts'>;
}
const { post } = Astro.props;
---

<article class="card">
  <h3>
    <a href={`/posts/${post.id}`}>{post.data.title}</a>
    {post.data.interviewee && <span class="badge">访谈</span>}
  </h3>
  <p class="meta">{formatDate(post.data.pubDate)}</p>
  <p>{post.data.summary}</p>
  <TagList tags={post.data.tags} />
</article>

<style>
  .card {
    padding: 1.2rem 0;
    border-bottom: 1px solid var(--color-border);
  }
  h3 { margin: 0 0 0.3rem; }
  h3 a { color: var(--color-text); }
  h3 a:hover { color: var(--color-accent); }
  .badge {
    font-size: 0.7rem;
    color: var(--color-accent);
    border: 1px solid var(--color-accent);
    border-radius: 4px;
    padding: 0 0.4rem;
    margin-left: 0.5rem;
    vertical-align: middle;
  }
  .meta { color: var(--color-muted); font-size: 0.85rem; margin: 0 0 0.4rem; }
</style>
```

- [x] **Step 3: 创建 `src/components/BookCard.astro`**

```astro
---
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';

interface Props {
  book: CollectionEntry<'books'>;
}
const { book } = Astro.props;
---

<a class="book" href={`/books/${book.id}`}>
  <Image src={book.data.cover} alt={`《${book.data.title}》封面`} width={160} />
  <div>
    <h3>{book.data.title}</h3>
    <p class="author">{book.data.author}</p>
    <p class="one-liner">{book.data.oneLiner}</p>
  </div>
</a>

<style>
  .book {
    display: flex;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
  }
  .book:hover { text-decoration: none; }
  .book:hover h3 { color: var(--color-accent); }
  .book img {
    width: 80px;
    height: auto;
    border-radius: 4px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
  h3 { margin: 0 0 0.2rem; }
  .author { color: var(--color-muted); font-size: 0.85rem; margin: 0 0 0.4rem; }
  .one-liner { margin: 0; font-size: 0.95rem; }
</style>
```

- [x] **Step 4: 构建验证（组件尚未被引用，确认无语法错误即可）**

Run: `npm run build`
Expected: 成功

- [x] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: PostCard/BookCard/TagList 组件"
```

---

### Task 6: 首页与文章列表/详情页

**Files:**
- Modify: `src/pages/index.astro`（整体替换 Task 1 的占位内容）
- Create: `src/pages/posts/index.astro`, `src/pages/posts/[slug].astro`

- [x] **Step 1: 重写 `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';
import BookCard from '../components/BookCard.astro';
import { sortByDateDesc } from '../lib/content';

const posts = sortByDateDesc(
  await getCollection('posts', ({ data }) => !data.draft),
).slice(0, 5);
const books = sortByDateDesc(
  await getCollection('books', ({ data }) => !data.draft),
).slice(0, 4);
---

<BaseLayout>
  <section class="hero">
    <h1>追寻幸福</h1>
    <p>幸福不是终点，而是一种行进的方式。这里有文章、对话，和值得一读的书。</p>
  </section>

  <section>
    <h2>最新文章</h2>
    {posts.map((post) => <PostCard post={post} />)}
    <p class="more"><a href="/posts">全部文章 →</a></p>
  </section>

  <section>
    <h2>最新书籍</h2>
    {books.map((book) => <BookCard book={book} />)}
    <p class="more"><a href="/books">全部书单 →</a></p>
  </section>
</BaseLayout>

<style>
  .hero { text-align: center; padding: 2rem 0 1rem; }
  .hero h1 { font-size: 2.2rem; margin: 0 0 0.5rem; }
  .hero p { color: var(--color-muted); }
  h2 { margin-top: 2.5rem; }
  .more { text-align: right; margin-top: 0.8rem; }
</style>
```

- [x] **Step 2: 创建 `src/pages/posts/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { sortByDateDesc } from '../../lib/content';

const posts = sortByDateDesc(
  await getCollection('posts', ({ data }) => !data.draft),
);
---

<BaseLayout title="文章" description="关于幸福的文章与访谈，按时间排列。">
  <h1>文章</h1>
  {posts.map((post) => <PostCard post={post} />)}
</BaseLayout>
```

- [x] **Step 3: 创建 `src/pages/posts/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import { Image } from 'astro:assets';
import BaseLayout from '../../layouts/BaseLayout.astro';
import TagList from '../../components/TagList.astro';
import Giscus from '../../components/Giscus.astro';
import { formatDate } from '../../lib/content';

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<BaseLayout title={post.data.title} description={post.data.summary}>
  <article data-pagefind-body>
    <h1>{post.data.title}</h1>
    <p class="meta">{formatDate(post.data.pubDate)}</p>
    <TagList tags={post.data.tags} />
    {post.data.cover && (
      <Image class="cover" src={post.data.cover} alt="" width={800} />
    )}
    {post.data.interviewee && (
      <aside class="interviewee">
        <strong>受访者：{post.data.interviewee}</strong>
        {post.data.intervieweeBio && <p>{post.data.intervieweeBio}</p>}
      </aside>
    )}
    <Content />
  </article>
  <Giscus />
</BaseLayout>

<style>
  .meta { color: var(--color-muted); font-size: 0.9rem; }
  .cover { border-radius: 8px; margin: 1.2rem 0; }
  .interviewee {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 0.8rem 1.2rem;
    margin: 1.5rem 0;
  }
  .interviewee p { margin: 0.3rem 0 0; color: var(--color-muted); font-size: 0.9rem; }
</style>
```

注意：`Giscus.astro` 在 Task 9 才创建。本 Task 构建会失败，属预期——为避免中间态构建红灯，本 Task 先创建一个最小占位的 `src/components/Giscus.astro`（Task 9 完整实现）：

```astro
---
---
```

（空组件，渲染为空。）

- [x] **Step 4: 构建验证**

Run: `npm run build`
Expected: 成功。检查：`dist/posts/what-is-happiness/index.html` 与 `dist/posts/interview-on-flow/index.html` 存在；`dist/posts/draft-example/` **不存在**（draft 被过滤）；访谈页 HTML 内含"受访者：李静"

- [x] **Step 5: Commit**

```bash
git add src/pages/index.astro src/pages/posts/ src/components/Giscus.astro
git commit -m "feat: 首页、文章列表与详情页（访谈介绍块、draft 过滤）"
```

---

### Task 7: 书单列表/详情页与购买按钮

**Files:**
- Create: `src/components/PurchaseLinks.astro`, `src/pages/books/index.astro`, `src/pages/books/[slug].astro`

- [x] **Step 1: 创建 `src/components/PurchaseLinks.astro`**

```astro
---
interface Props {
  links: { platform: string; url: string }[];
}
const { links } = Astro.props;
---

{links.length > 0 && (
  <div class="purchase">
    <span class="label">去购买</span>
    {links.map((link) => (
      <a href={link.url} target="_blank" rel="nofollow sponsored noopener">
        {link.platform}
      </a>
    ))}
  </div>
)}

<style>
  .purchase {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    background: var(--color-accent-soft);
    border-radius: 8px;
    padding: 0.8rem 1.2rem;
    margin: 1.5rem 0;
  }
  .label { font-weight: 600; }
  .purchase a {
    background: var(--color-accent);
    color: #fff;
    padding: 0.3rem 1rem;
    border-radius: 999px;
    font-size: 0.9rem;
  }
  .purchase a:hover { text-decoration: none; filter: brightness(1.1); }
</style>
```

- [x] **Step 2: 创建 `src/pages/books/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import BookCard from '../../components/BookCard.astro';
import { sortByDateDesc } from '../../lib/content';

const books = sortByDateDesc(
  await getCollection('books', ({ data }) => !data.draft),
);
---

<BaseLayout title="书单" description="关于幸福的推荐书单。">
  <h1>书单</h1>
  {books.map((book) => <BookCard book={book} />)}
</BaseLayout>
```

- [x] **Step 3: 创建 `src/pages/books/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import { Image } from 'astro:assets';
import BaseLayout from '../../layouts/BaseLayout.astro';
import TagList from '../../components/TagList.astro';
import PurchaseLinks from '../../components/PurchaseLinks.astro';
import Giscus from '../../components/Giscus.astro';

export async function getStaticPaths() {
  const books = await getCollection('books', ({ data }) => !data.draft);
  return books.map((book) => ({ params: { slug: book.id }, props: { book } }));
}

const { book } = Astro.props;
const { Content } = await render(book);
---

<BaseLayout title={book.data.title} description={book.data.oneLiner}>
  <article data-pagefind-body>
    <div class="book-head">
      <Image src={book.data.cover} alt={`《${book.data.title}》封面`} width={240} />
      <div>
        <h1>{book.data.title}</h1>
        <p class="author">{book.data.author}</p>
        <p class="one-liner">{book.data.oneLiner}</p>
        <TagList tags={book.data.tags} />
      </div>
    </div>
    <PurchaseLinks links={book.data.purchaseLinks} />
    <Content />
  </article>
  <Giscus />
</BaseLayout>

<style>
  .book-head { display: flex; gap: 1.5rem; align-items: flex-start; }
  .book-head img {
    width: 140px;
    height: auto;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
  }
  h1 { margin: 0 0 0.3rem; font-size: 1.6rem; }
  .author { color: var(--color-muted); margin: 0 0 0.5rem; }
  .one-liner { margin: 0 0 0.8rem; }
  @media (max-width: 480px) {
    .book-head { flex-direction: column; }
  }
</style>
```

- [x] **Step 4: 构建验证**

Run: `npm run build`
Expected: 成功。检查 `dist/books/flow/index.html`：含两个购买链接，均带 `rel="nofollow sponsored noopener"` 与 `target="_blank"`；`dist/books/happier/index.html` 不含"去购买"区块（空链接数组不渲染）

- [x] **Step 5: Commit**

```bash
git add src/components/PurchaseLinks.astro src/pages/books/
git commit -m "feat: 书单列表与详情页，购买按钮组（nofollow sponsored）"
```

---

### Task 8: 标签聚合页

**Files:**
- Create: `src/pages/tags/[tag].astro`

- [x] **Step 1: 创建 `src/pages/tags/[tag].astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import BookCard from '../../components/BookCard.astro';
import { collectTags, sortByDateDesc } from '../../lib/content';

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const books = await getCollection('books', ({ data }) => !data.draft);
  return collectTags([...posts, ...books]).map((tag) => ({
    params: { tag },
    props: {
      posts: sortByDateDesc(posts.filter((p) => p.data.tags.includes(tag))),
      books: sortByDateDesc(books.filter((b) => b.data.tags.includes(tag))),
    },
  }));
}

const { tag } = Astro.params;
const { posts, books } = Astro.props;
---

<BaseLayout title={`标签：${tag}`} description={`所有打了「${tag}」标签的文章与书籍。`}>
  <h1>标签：{tag}</h1>
  {posts.length > 0 && (
    <section>
      <h2>文章</h2>
      {posts.map((post) => <PostCard post={post} />)}
    </section>
  )}
  {books.length > 0 && (
    <section>
      <h2>书籍</h2>
      {books.map((book) => <BookCard book={book} />)}
    </section>
  )}
</BaseLayout>
```

- [x] **Step 2: 构建验证**

Run: `npm run build`
Expected: 成功。`dist/tags/` 下生成 心理学/访谈/生活方式 三个标签目录（原计划写"哲学"系笔误——该标签仅存在于单元测试数据，不在种子内容中；中文目录名经 URL 编码属正常）；「心理学」标签页同时包含文章与书籍

- [x] **Step 3: Commit**

```bash
git add src/pages/tags/
git commit -m "feat: 标签聚合页（文章+书籍）"
```

---

### Task 9: RSS 与 giscus 评论

**Files:**
- Create: `src/pages/rss.xml.js`
- Modify: `src/components/Giscus.astro`（替换 Task 6 的空占位）

- [x] **Step 1: 创建 `src/pages/rss.xml.js`**

```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { sortByDateDesc } from '../lib/content';
import { SITE } from '../config';

export async function GET(context) {
  const posts = sortByDateDesc(
    await getCollection('posts', ({ data }) => !data.draft),
  );
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.summary,
      link: `/posts/${post.id}/`,
    })),
  });
}
```

- [x] **Step 2: 完整实现 `src/components/Giscus.astro`**

```astro
---
import { GISCUS } from '../config';
---

{GISCUS.repo && (
  <section class="comments">
    <script
      src="https://giscus.app/client.js"
      data-repo={GISCUS.repo}
      data-repo-id={GISCUS.repoId}
      data-category={GISCUS.category}
      data-category-id={GISCUS.categoryId}
      data-mapping="pathname"
      data-strict="0"
      data-reactions-enabled="1"
      data-emit-metadata="0"
      data-input-position="top"
      data-theme="light"
      data-lang="zh-CN"
      data-loading="lazy"
      crossorigin="anonymous"
      async
    ></script>
  </section>
)}

<style>
  .comments { margin-top: 3rem; }
</style>
```

- [x] **Step 3: 构建验证**

Run: `npm run build`
Expected: 成功。`dist/rss.xml` 存在，包含 2 篇文章（draft 不在内）、不含任何书籍条目；文章详情页 HTML 中无 giscus 脚本（repo 为空，按设计不渲染）

- [x] **Step 4: Commit**

```bash
git add src/pages/rss.xml.js src/components/Giscus.astro
git commit -m "feat: RSS 订阅源（仅 posts）与 giscus 评论组件"
```

---

### Task 10: Pagefind 搜索

**Files:**
- Modify: `package.json`（build 脚本）
- Create: `src/pages/search.astro`

- [x] **Step 1: 修改 `package.json` 的 build 脚本**

```json
"build": "astro build && pagefind --site dist"
```

- [x] **Step 2: 创建 `src/pages/search.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="搜索" description="搜索本站的文章与书籍。">
  <h1>搜索</h1>
  <p class="note">搜索索引在构建时生成，本地 dev 模式下不可用（用 npm run build && npm run preview 验证）。</p>
  <link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
  <div id="search"></div>
  <script is:inline src="/pagefind/pagefind-ui.js"></script>
  <script is:inline>
    window.addEventListener('DOMContentLoaded', () => {
      const ui = new PagefindUI({
        element: '#search',
        showSubResults: true,
        translations: {
          placeholder: '搜索文章与书籍…',
          zero_results: '没有找到「[SEARCH_TERM]」相关的内容',
        },
      });
      const q = new URLSearchParams(location.search).get('q');
      if (q) ui.triggerSearch(q);
    });
  </script>
</BaseLayout>

<style>
  .note { color: var(--color-muted); font-size: 0.85rem; }
</style>
```

- [x] **Step 3: 构建验证**

Run: `npm run build`
Expected: 成功，末尾出现 Pagefind 索引日志（Indexed N pages）；`dist/pagefind/pagefind-ui.js` 存在

- [x] **Step 4: 本地预览验证搜索（手动）**

Run: `npm run preview`
打开 `http://localhost:4321/search?q=心流`，Expected: 出现《心流》书籍详情和访谈文章的搜索结果。验证后 Ctrl+C 退出 preview。

- [x] **Step 5: Commit**

```bash
git add package.json src/pages/search.astro
git commit -m "feat: Pagefind 站内搜索（构建时索引，导航搜索框直达）"
```

---

### Task 11: CI、README 与部署说明

**Files:**
- Create: `.github/workflows/ci.yml`, `README.md`

- [x] **Step 1: 创建 `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
```

- [x] **Step 2: 创建 `README.md`**

````markdown
# 追寻幸福

面向中文读者的幸福主题内容站：文章、访谈、推荐书单。Astro 5 静态站点。

## 日常写作

- **写文章**：在 `src/content/posts/` 新建 `.md` 文件，文件名即 URL slug（用英文短横线命名，如 `on-gratitude.md`）
- **写访谈**：同上，frontmatter 多填 `interviewee` 和 `intervieweeBio` 两个字段，tags 里加上 `访谈`
- **推荐书**：在 `src/content/books/` 新建 `.md`，封面图放 `src/content/books/covers/`，frontmatter 的 `cover` 用相对路径引用
- **草稿**：frontmatter 加 `draft: true`，构建时自动跳过
- **佣金链接**：申请到联盟账号（京东联盟/当当联盟等）后，把推广链接替换进各书的 `purchaseLinks[].url` 即可，无需改代码
- 字段写错时 `npm run build` 会直接报错并指出文件，放心改

## 本地开发

```bash
npm install
npm run dev        # 开发服务器（搜索功能在 dev 下不可用）
npm test           # 单元测试
npm run build      # 构建 + 生成搜索索引
npm run preview    # 本地预览构建产物（可验证搜索）
```

## 部署（Cloudflare Pages）

1. 把仓库推到 GitHub
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → 连接该仓库
3. 构建配置：Build command `npm run build`，Build output directory `dist`
4. 部署成功后，把 `astro.config.mjs` 里的 `site` 改成实际地址（影响 RSS 链接），提交后自动重新部署
5. 绑定自定义域名（可选）：Pages 项目 → Custom domains

## 开通评论（giscus）

见 `src/config.ts` 中 GISCUS 配置块的注释，三步完成。

## 设计文档

- 规格：`docs/superpowers/specs/2026-06-10-happiness-website-design.md`
- 实现计划：`docs/superpowers/plans/2026-06-10-happiness-website.md`
````

- [x] **Step 3: 最终全量验证**

Run: `npm test && npm run build`
Expected: 测试 6 个全绿；构建成功含 Pagefind 索引

- [x] **Step 4: Commit**

```bash
git add .github/ README.md
git commit -m "chore: CI 工作流与 README（写作指南、部署步骤）"
```

---

## 验收清单（对照规格逐条核对）

- [x] 首页：理念一句话 + 最新 5 篇文章 + 最新 4 本书（当前种子内容不足 5/4，显示全部即符合预期）
- [x] /posts 时间倒序；draft 不出现
- [x] 访谈页顶部渲染受访者介绍块；列表卡片带"访谈"角标
- [x] /books 卡片含封面+一句话推荐语；详情页购买按钮 `rel="nofollow sponsored"` 新窗口
- [x] /tags/[tag] 同时聚合文章与书
- [x] /rss.xml 仅含 posts
- [x] /search 在 build+preview 下可搜中文
- [x] giscus 未配置时不渲染、不报错
- [x] 自定义 404
- [x] CI：npm test + npm run build
- [x] 移动端可读（max-width 内容列、卡片在小屏折行）

---

## 实施偏差记录（审查驱动的修正，已全部合并）

以下为执行过程中两道审查发现并修复的问题，属对计划代码的改进，不改变规格：

- **Task 1 后**：补提交 `package-lock.json`（CI `npm ci` 必需）；颜色 token 调整至 WCAG AA——accent `#c9722e`→`#b05a1e`、muted `#8a8378`→`#6b6660`、新增 `--color-accent-strong: #8f4715`；`.gitignore` 增补 `.env*`/`.DS_Store`；favicon 加 `<title>`
- **Task 2 后**：当当购买链接升级 HTTPS；posts schema 增加 refine（`intervieweeBio` 必须与 `interviewee` 共存）
- **Task 3 后**：测试补 2 个用例（formatDate 跨午夜时区探针、collectTags 空输入），共 6 个
- **Task 4 后**：`<nav>` 加 `aria-label="主导航"`；404 标题改"404 · 找不到页面"
- **Task 5**：TagList 链接使用 `encodeURIComponent(tag)`（批准偏差）；全局补 `:focus-visible` 焦点环；标签胶囊文字用 `--color-accent-strong`（小字号对比度）
- **Task 6 后**：受访者 `<aside>` 加 `aria-label="受访者简介"`；BaseLayout 补 Open Graph 三件套
- **Task 7 后**：购买按钮焦点环改双色 box-shadow（橙底上原焦点环不可见）；购买链接加 `role="group"` 与逐链接 aria-label；书籍详情长标题溢出保护（`min-width: 0` + `overflow-wrap`）
- **Task 8 后**：标签页加空状态兜底文案；description 含文章/书籍数量
- **Task 9 后**：RSS 增加 `context.site` 缺失守卫与 `<language>zh-CN</language>`；giscus 改 `data-strict="1"`
- **Task 10 后**：BaseLayout 增加 `<slot name="head" />`，pagefind 样式表经该 slot 注入 `<head>`（修复 FOUC）；搜索页加 `typeof PagefindUI` dev 模式守卫与 `<noscript>` 提示

**审查建议但有依据不采纳的**：vitest `--passWithNoTests`（会掩盖 glob 配错）、`tags ?? []` 防御兜底（schema 已强制 min(1)）、books 封面改可选（规格明确必填）、coverAlt schema 字段（暂无封面内容，留待实际使用时加）、分页（规格明确 YAGNI）、`Image width={160}` 显示 80px（有意的 2x retina 资产）。
