# 书单页改为分类行列表 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把书单页从封面网格改为「按分类分组的行列表」，每行整行点击直达京东联盟链接，包含封面+京东购买按钮、书名+推荐理由、京东购买二维码；同时删除书籍详情页并同步所有引用入口。

**Architecture:** Astro 5 静态站。books 内容集合新增 `qrcode`/`buyUrl`/`recommend` 字段、移除 `purchaseLinks`；新增 `BookRow.astro` 行组件替换 `BookCard.astro`；删除 `/books/[slug]` 详情页、`PurchaseLinks.astro`、`bookSchema`；首页迷你书单、标签页、`llms.txt`、读书笔记内链全部改为指向京东或书单页。

**Tech Stack:** Astro 5、`astro:content`（glob loader + zod schema）、`astro:assets`（`Image` + `image()`）、Vitest（回归）、Pagefind（构建期搜索索引）。

**验证策略说明：** 本项目无针对页面渲染的单元测试；按 `AGENTS.md`，内容/路由/schema/SEO 变更用 `npm run build` 验证，逻辑变更用 `npm test`。本计划每个任务以 `npm run build` 成功 + 针对性 `grep`/文件检查作为验证，`npm test` 作为不回归的护栏（`sortByDateDesc`/`groupByCategory`/`collectTags` 签名不变）。

---

## 文件结构

**新建：**
- `src/components/BookRow.astro` — 单本书的行卡片（整行链接 + 三栏：封面/书名+推荐理由/二维码）
- `src/content/books/authentic-happiness.md` — 第 4 本书《真实的幸福》
- `src/content/books/covers/authentic-happiness.jpg` — 新书封面（从 jdbook 复制）
- `src/content/books/covers/conquest-of-happiness.jpg` `flow.jpg` `happier.jpg` — 用 jdbook 高清封面覆盖
- `src/content/books/qrcodes/{conquest-of-happiness,flow,happier,authentic-happiness}.png` — 4 张二维码

**修改：**
- `src/content.config.ts` — books schema：+`qrcode` +`buyUrl` +`recommend`，−`purchaseLinks`
- `src/content/books/conquest-of-happiness.md` `flow.md` `happier.md` — frontmatter 加新字段、去 `purchaseLinks`
- `src/pages/books/index.astro` — 用 `BookRow` 纵向列表替换网格
- `src/pages/tags/[tag].astro` — 书籍区块改用 `BookRow`
- `src/pages/index.astro` — 迷你书单 `href` → `buyUrl`（新窗口 + sponsored）
- `src/pages/llms.txt.ts` — 书籍链接 → `buyUrl`
- `src/lib/schema.ts` — 删除 `bookSchema`
- `src/content/posts/conquest-of-happiness-notes.md:46` — 失效内链 `/books/conquest-of-happiness/` → `/books`

**删除：**
- `src/pages/books/[slug].astro`
- `src/components/BookCard.astro`
- `src/components/PurchaseLinks.astro`

---

## 数据常量（供各任务复制）

各书的京东联盟链接（写入 frontmatter 时整段加单引号包裹，因含 `|`/`&`/`%`）：

- `conquest-of-happiness` →
  `https://union-click.jd.com/jdc?e=618%7Cpc%7C&p=JF8BAUYJK1olWAcEVlheAU4WA18IGF0cXwELXG4ZVxNJXF9RXh5UHw0cSgYYXBcIWDoXSQVJQwYBUldfD0IfHDZNRwYbGVlaCgEhXB5PUwpYTVcWMwdsVG4-Qw1JBjhSezgLJ1RVASoVeyl-fTZoF1clXDYBVVxUC00fA2gMK2sVWjZQOlZVAEseB2cNGFsTbQcyVFhUCE8fC20MHFscVTYFVFdtUx55BGYKHQ9HWAdWVVpUCHsnM2w4HFscSQBwFQxJDjknM284GGsVXAYDUFpfD00QBXMIGFgUWQUeVFhUCE8fC2wIGV0VXzYAVV9ZAXsn3eK4YShqBEcBLgoHSjFWRBRTbIWY7RdwJF5fCksGMyl4ey5GOHV3LQBZTj5ccw1TGV5vG3NJJBgLUyBjYwEKQwVpGHVjUC0BfD9CUxhAayUlWDYCUl5fOA`
- `flow` →
  `https://union-click.jd.com/jdc?e=618%7Cpc%7C&p=JF8BATIJK1olWAcKUlpfCE8RB18IGFkRXwMFVm4ZVxNJXF9RXh5UHw0cSgYYXBcIWDoXSQVJQwYBVlpfDUwVHDZNRwYlI1McCwgYaBx3aBULeQlhR0UcIAQlaEcbM244GFoXVAUEXF5aDHsnA2g4STUdVQ4AV1xZDUgeCl8JK1sTVAYFU11VDEofBW84HFscbV1XOllUCk1DUWoJT1oRVAYyZG5eOEwXCnsOaRpHSQBwZG5dOEgnA24IGlwWWAUHXFdBCEoQAmkAB1sTVAYFU11VC0oSC2w4GVoUWQ8yZIDQuDsVAWx_byNVAkR-ITs1Vx3Jjt8ZaSsVXw4ARW41aytHVCd6aVsUBH1SCSQ6cTZ8VRRYRiFdXnFYFz4zChhIYAdpZgJOW3t_V1cqdhVOM2o4G10VXzY`
- `happier` →
  `https://union-click.jd.com/jdc?e=618%7Cpc%7C&p=JF8BATIJK1olWAcKUlpfCE8RB18IGloQWQQEUm4ZVxNJXF9RXh5UHw0cSgYYXBcIWDoXSQVJQwYDVVtZCk0RHDZNRwYlA1VcNTYOVhRycDcScAheBX1kHB5HXkcbM244GFoXVAUEXF5aDHsnA2g4STUdVQ4AV1xZDUgeCl8JK1sTVAYFUlxcAE0QB204HFscbV1XOllUCk1DUWoJT1oRVAYyZG5eOEwXCnsOaRpHSQBwZG5dOEgnA24IGl8RXwEAVl5BCEgUBmkIB1sTVAYFU1xeAU4TBGg4GVoUWQ8yZIDQuC8RfAdrEgtiOHxfLQEidjbJjt8ZZz8RXQcHRW5bYS5OXTANWyEWXlNbMlscQU1-QTpRfTBFFFZ4EjszChBNCxR2TFhGFnF1UFgITwBcM2o4G10VXzY`
- `authentic-happiness` →
  `https://union-click.jd.com/jdc?e=618%7Cpc%7C&p=JF8BATcJK1olWAYBXFxUCk4eBl8IGlodWAIEUltfC0IXBV9MRANLAjZbERscSkAJHTdNTwcKBlMdBgABFksWAmcNH10TWAQBXV5bFxJSXzI4SCNdXUZDFgU_UD1yBmpTXFwWR1pfElJROEonAG4KElgTVQYFUG5tCEwnQgENG1ocXzYDZF5bAUsRB28KHVoUWQUyU15UOBBCbWgBGV1BDwMDAF9ZAUsnM18LK1wVVBIEJh8PHE1lM18IK1glXQcCVVleDUgeAm0UG1oRVAIFSF5bAUsRB28KGVgcXg4yVl9cDEInM7GFqy5gGHZjXT0GcElEXmYAYCXL0LYTJjVdDE4GMwlVHiNhXnlLFCEfXzNueGdpTFJUCn57ViwobzZHBgEKez1AKHt_Fg1YCy1TRBEBSR0lWDYCUl5fOA`

各书的 `recommend`（来自 book.md「推荐理由」，整理为单段）：

- `conquest-of-happiness`：罗素以哲学家的清醒，把"为什么不快乐、如何变快乐"拆成可操作的方法。他不灌鸡汤，只谈嫉妒、焦虑、倦怠的根源，再给出务实出路。黄菡新译，文字流畅好读，是一本能真正提升幸福感的实用之书。
- `flow`：心流理论之父契克森米哈赖开创之作。他揭示：幸福不在放松，而在全神贯注的"心流"。套装含《心流》与《发现心流》，从理论到日常实践，教你把专注变成高效与快乐的源泉。
- `happier`：哈佛最受欢迎的幸福课。沙哈尔用积极心理学告诉你：幸福不是终点，而是意义与快乐的结合。书中给出可练习的方法，从设定目标到经营关系，把幸福从概念变成日常习惯。
- `authentic-happiness`：积极心理学之父塞利格曼的奠基之作。他不教你消除缺点，而是帮你找到自身优势并用于生活。书中附可自测方法，让幸福从理论落到日常，是真正能提升幸福感的实用经典。

jdbook 资产路径：`/Users/ruimin/Desktop/jdbook/cover/` 与 `/Users/ruimin/Desktop/jdbook/qrcode/`。

---

## Task 1: 复制封面与二维码资产

**Files:**
- Create: `src/content/books/covers/authentic-happiness.jpg`（覆盖 `conquest-of-happiness.jpg` `flow.jpg` `happier.jpg`）
- Create: `src/content/books/qrcodes/conquest-of-happiness.png` `flow.png` `happier.png` `authentic-happiness.png`

- [ ] **Step 1: 复制 4 张封面（slug 命名）**

```bash
SRC="/Users/ruimin/Desktop/jdbook"
DST="/Users/ruimin/Desktop/code/happiness/src/content/books"
cp "$SRC/cover/幸福之路.jpg"   "$DST/covers/conquest-of-happiness.jpg"
cp "$SRC/cover/心流.jpg"       "$DST/covers/flow.jpg"
cp "$SRC/cover/幸福的方法.jpg" "$DST/covers/happier.jpg"
cp "$SRC/cover/真实的幸福.jpg" "$DST/covers/authentic-happiness.jpg"
```

- [ ] **Step 2: 复制 4 张二维码到新目录**

```bash
mkdir -p "$DST/qrcodes"
cp "$SRC/qrcode/幸福之路.png"   "$DST/qrcodes/conquest-of-happiness.png"
cp "$SRC/qrcode/心流.png"       "$DST/qrcodes/flow.png"
cp "$SRC/qrcode/幸福的方法.png" "$DST/qrcodes/happier.png"
cp "$SRC/qrcode/真实的幸福.png" "$DST/qrcodes/authentic-happiness.png"
```

- [ ] **Step 3: 验证 8 个文件都存在**

```bash
ls -la src/content/books/covers/*.jpg src/content/books/qrcodes/*.png
```
Expected: 4 个 covers（含 authentic-happiness.jpg）+ 4 个 qrcodes，均非 0 字节。

- [ ] **Step 4: 提交资产**

```bash
git add src/content/books/covers src/content/books/qrcodes
git commit -m "book: 加入 4 本书的封面与京东购买二维码资产"
```

---

## Task 2: 扩展 books schema

**Files:**
- Modify: `src/content.config.ts`（books 集合 schema）

- [ ] **Step 1: 修改 books schema**

把 `src/content.config.ts` 中 `const books = defineCollection({...})` 的 schema 改为：

```ts
const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.string(),
      pubDate: z.coerce.date(),
      cover: image(),
      qrcode: image(),
      // 一句话简介：首页迷你书单 / RSS / SEO / og 使用
      oneLiner: z.string(),
      // 较长推荐理由：书单行中间栏展示
      recommend: z.string(),
      // 京东联盟推广链接：整行点击 / 封面按钮 / 二维码均指向它
      buyUrl: z.string().url(),
      // 书单页按 category 分组展示；不填时回退到第一个 tag
      category: z.string().optional(),
      tags: z.array(z.string()).min(1),
      draft: z.boolean().default(false),
    }),
});
```

> 注意：`image()` 必须放在 `src/content/books/` 下、能被 glob base 解析的相对路径处理；`qrcode` 与 `cover` 同理，frontmatter 里写 `./qrcodes/<slug>.png`。

- [ ] **Step 2: 验证 schema 文件无语法错误（构建会在 Task 3 后整体跑；此处先类型检查）**

```bash
npx astro check 2>&1 | tail -20 || true
```
Expected: 此时 3 本旧 md 仍缺 `qrcode`/`buyUrl`/`recommend` 且仍有 `purchaseLinks`，**预计报内容校验错误**——属正常，将在 Task 3 修复。确认错误是「missing qrcode/buyUrl/recommend」类，而非 schema 本身语法错误。

- [ ] **Step 3: 提交**

```bash
git add src/content.config.ts
git commit -m "book: schema 增加 qrcode/buyUrl/recommend，移除 purchaseLinks"
```

---

## Task 3: 更新 3 本现有书 + 新增第 4 本

**Files:**
- Modify: `src/content/books/conquest-of-happiness.md` `flow.md` `happier.md`
- Create: `src/content/books/authentic-happiness.md`

- [ ] **Step 1: 重写 `conquest-of-happiness.md`**

```markdown
---
title: 幸福之路
author: 伯特兰·罗素
pubDate: 2026-06-12
cover: ./covers/conquest-of-happiness.jpg
qrcode: ./qrcodes/conquest-of-happiness.png
oneLiner: 诺奖得主罗素的幸福生活手册：把注意力从自我转向世界。
recommend: 罗素以哲学家的清醒，把"为什么不快乐、如何变快乐"拆成可操作的方法。他不灌鸡汤，只谈嫉妒、焦虑、倦怠的根源，再给出务实出路。黄菡新译，文字流畅好读，是一本能真正提升幸福感的实用之书。
category: 哲学
tags: [哲学]
buyUrl: 'https://union-click.jd.com/jdc?e=618%7Cpc%7C&p=JF8BAUYJK1olWAcEVlheAU4WA18IGF0cXwELXG4ZVxNJXF9RXh5UHw0cSgYYXBcIWDoXSQVJQwYBUldfD0IfHDZNRwYbGVlaCgEhXB5PUwpYTVcWMwdsVG4-Qw1JBjhSezgLJ1RVASoVeyl-fTZoF1clXDYBVVxUC00fA2gMK2sVWjZQOlZVAEseB2cNGFsTbQcyVFhUCE8fC20MHFscVTYFVFdtUx55BGYKHQ9HWAdWVVpUCHsnM2w4HFscSQBwFQxJDjknM284GGsVXAYDUFpfD00QBXMIGFgUWQUeVFhUCE8fC2wIGV0VXzYAVV9ZAXsn3eK4YShqBEcBLgoHSjFWRBRTbIWY7RdwJF5fCksGMyl4ey5GOHV3LQBZTj5ccw1TGV5vG3NJJBgLUyBjYwEKQwVpGHVjUC0BfD9CUxhAayUlWDYCUl5fOA'
---
```

> body 留空（详情页已删，body 不再渲染）。整段 buyUrl 用单引号包裹以转义 `|`/`&`/`%`。

- [ ] **Step 2: 重写 `flow.md`**

```markdown
---
title: 心流：最优体验心理学
author: 米哈里·契克森米哈赖
pubDate: 2026-06-02
cover: ./covers/flow.jpg
qrcode: ./qrcodes/flow.png
oneLiner: 解释"完全沉浸"为何是幸福感最可靠的来源。
recommend: 心流理论之父契克森米哈赖开创之作。他揭示：幸福不在放松，而在全神贯注的"心流"。套装含《心流》与《发现心流》，从理论到日常实践，教你把专注变成高效与快乐的源泉。
category: 心理学
tags: [心理学]
buyUrl: 'https://union-click.jd.com/jdc?e=618%7Cpc%7C&p=JF8BATIJK1olWAcKUlpfCE8RB18IGFkRXwMFVm4ZVxNJXF9RXh5UHw0cSgYYXBcIWDoXSQVJQwYBVlpfDUwVHDZNRwYlI1McCwgYaBx3aBULeQlhR0UcIAQlaEcbM244GFoXVAUEXF5aDHsnA2g4STUdVQ4AV1xZDUgeCl8JK1sTVAYFU11VDEofBW84HFscbV1XOllUCk1DUWoJT1oRVAYyZG5eOEwXCnsOaRpHSQBwZG5dOEgnA24IGlwWWAUHXFdBCEoQAmkAB1sTVAYFU11VC0oSC2w4GVoUWQ8yZIDQuDsVAWx_byNVAkR-ITs1Vx3Jjt8ZaSsVXw4ARW41aytHVCd6aVsUBH1SCSQ6cTZ8VRRYRiFdXnFYFz4zChhIYAdpZgJOW3t_V1cqdhVOM2o4G10VXzY'
---
```

- [ ] **Step 3: 重写 `happier.md`**

```markdown
---
title: 幸福的方法
author: 泰勒·本-沙哈尔
pubDate: 2026-06-06
cover: ./covers/happier.jpg
qrcode: ./qrcodes/happier.png
oneLiner: 哈佛积极心理学课的精华：幸福是可以学习的能力。
recommend: 哈佛最受欢迎的幸福课。沙哈尔用积极心理学告诉你：幸福不是终点，而是意义与快乐的结合。书中给出可练习的方法，从设定目标到经营关系，把幸福从概念变成日常习惯。
category: 心理学
tags: [心理学, 生活方式]
buyUrl: 'https://union-click.jd.com/jdc?e=618%7Cpc%7C&p=JF8BATIJK1olWAcKUlpfCE8RB18IGloQWQQEUm4ZVxNJXF9RXh5UHw0cSgYYXBcIWDoXSQVJQwYDVVtZCk0RHDZNRwYlA1VcNTYOVhRycDcScAheBX1kHB5HXkcbM244GFoXVAUEXF5aDHsnA2g4STUdVQ4AV1xZDUgeCl8JK1sTVAYFUlxcAE0QB204HFscbV1XOllUCk1DUWoJT1oRVAYyZG5eOEwXCnsOaRpHSQBwZG5dOEgnA24IGl8RXwEAVl5BCEgUBmkIB1sTVAYFU1xeAU4TBGg4GVoUWQ8yZIDQuC8RfAdrEgtiOHxfLQEidjbJjt8ZZz8RXQcHRW5bYS5OXTANWyEWXlNbMlscQU1-QTpRfTBFFFZ4EjszChBNCxR2TFhGFnF1UFgITwBcM2o4G10VXzY'
---
```

- [ ] **Step 4: 新建 `authentic-happiness.md`**

```markdown
---
title: 真实的幸福
author: 马丁·塞利格曼
pubDate: 2026-06-10
cover: ./covers/authentic-happiness.jpg
qrcode: ./qrcodes/authentic-happiness.png
oneLiner: 积极心理学之父的集大成之作：发掘你的优势，而非修补缺点。
recommend: 积极心理学之父塞利格曼的奠基之作。他不教你消除缺点，而是帮你找到自身优势并用于生活。书中附可自测方法，让幸福从理论落到日常，是真正能提升幸福感的实用经典。
category: 心理学
tags: [心理学]
buyUrl: 'https://union-click.jd.com/jdc?e=618%7Cpc%7C&p=JF8BATcJK1olWAYBXFxUCk4eBl8IGlodWAIEUltfC0IXBV9MRANLAjZbERscSkAJHTdNTwcKBlMdBgABFksWAmcNH10TWAQBXV5bFxJSXzI4SCNdXUZDFgU_UD1yBmpTXFwWR1pfElJROEonAG4KElgTVQYFUG5tCEwnQgENG1ocXzYDZF5bAUsRB28KHVoUWQUyU15UOBBCbWgBGV1BDwMDAF9ZAUsnM18LK1wVVBIEJh8PHE1lM18IK1glXQcCVVleDUgeAm0UG1oRVAIFSF5bAUsRB28KGVgcXg4yVl9cDEInM7GFqy5gGHZjXT0GcElEXmYAYCXL0LYTJjVdDE4GMwlVHiNhXnlLFCEfXzNueGdpTFJUCn57ViwobzZHBgEKez1AKHt_Fg1YCy1TRBEBSR0lWDYCUl5fOA'
---
```

- [ ] **Step 5: 验证内容校验通过**

```bash
npx astro check 2>&1 | tail -20
```
Expected: 不再有 books 集合的 missing/unknown 字段错误（`[slug].astro` 仍引用 `purchaseLinks`，将在 Task 6 删除——此报错可暂时忽略，或先跳到 Task 6 再回来。若 astro check 因 `[slug].astro` 报错，记录但继续）。

- [ ] **Step 6: 提交**

```bash
git add src/content/books/*.md
git commit -m "book: 用真实数据填充 4 本书（含真实的幸福），写入 recommend/buyUrl/qrcode"
```

---

## Task 4: 新建 `BookRow.astro` 行组件

**Files:**
- Create: `src/components/BookRow.astro`

- [ ] **Step 1: 写组件**

```astro
---
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';

interface Props {
  book: CollectionEntry<'books'>;
}
const { book } = Astro.props;
const { title, author, cover, qrcode, recommend, buyUrl } = book.data;
---

<a
  class="book-row"
  href={buyUrl}
  target="_blank"
  rel="nofollow sponsored noopener"
  aria-label={`在京东购买《${title}》（新窗口打开）`}
>
  <div class="cover">
    <Image src={cover} alt={`《${title}》封面`} width={260} />
    <span class="buy-badge">京东购买 ›</span>
  </div>

  <div class="meta">
    <h3>{title}</h3>
    <p class="author">{author}</p>
    <p class="desc">{recommend}</p>
  </div>

  <div class="qr">
    <Image src={qrcode} alt={`《${title}》京东购买二维码`} width={240} />
    <span>扫码购买</span>
  </div>
</a>

<style>
  .book-row {
    display: grid;
    grid-template-columns: 96px minmax(0, 1fr) 120px;
    gap: clamp(1.2rem, 4vw, 2.6rem);
    align-items: center;
    padding: 1.6rem 0.9rem;
    border-top: 1px solid var(--hairline);
    color: var(--ink);
    transition: background 0.22s var(--ease-out);
  }
  .book-row:last-child { border-bottom: 1px solid var(--hairline); }
  .book-row:hover { background: rgba(255, 253, 248, 0.62); }
  .book-row:focus-visible {
    outline: none;
    background: rgba(255, 253, 248, 0.62);
    box-shadow: inset 0 0 0 2px var(--peach);
    border-radius: var(--r-card);
  }

  /* 左：封面 + 京东购买按钮 */
  .cover {
    position: relative;
    border-radius: 3px 6px 6px 3px;
    overflow: hidden;
    aspect-ratio: 5 / 7;
    box-shadow: 0 6px 14px rgba(81, 66, 61, 0.14);
  }
  .cover :global(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .buy-badge {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--persimmon);
    color: var(--surface);
    font-family: var(--font-display);
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-align: center;
    padding: 0.28rem 0;
  }

  /* 中：书名 + 作者 + 推荐理由 */
  .meta { min-width: 0; }
  .meta h3 {
    font-size: clamp(1.1rem, 2.4vw, 1.45rem);
    font-weight: 900;
    margin: 0 0 0.25rem;
    transition: color 0.22s var(--ease-out);
  }
  .book-row:hover .meta h3 { color: var(--primary-deep); }
  .author {
    color: var(--ink-mute);
    font-size: 0.82rem;
    font-weight: 700;
    margin: 0 0 0.55rem;
  }
  .desc {
    color: var(--ink-soft);
    font-size: 0.95rem;
    line-height: 1.7;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 右：二维码 */
  .qr {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }
  .qr :global(img) {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    background: var(--surface);
    padding: 4px;
    box-shadow: 0 4px 12px rgba(81, 66, 61, 0.1);
  }
  .qr span {
    font-family: var(--font-display);
    font-size: 0.74rem;
    letter-spacing: 0.12em;
    color: var(--ink-mute);
  }

  @media (max-width: 640px) {
    .book-row {
      grid-template-columns: 72px minmax(0, 1fr);
      gap: 1.1rem;
      padding: 1.3rem 0.4rem;
    }
    .qr { display: none; }
    .desc { -webkit-line-clamp: 4; }
  }
</style>
```

- [ ] **Step 2: 验证组件可被解析（随 Task 5 一起构建；此处仅确认无 import 错误）**

```bash
grep -n "BookRow" src/components/BookRow.astro
```
Expected: 文件存在且含上述结构。

- [ ] **Step 3: 提交**

```bash
git add src/components/BookRow.astro
git commit -m "book: 新增 BookRow 行卡片组件（整行链接 + 封面按钮 + 二维码）"
```

---

## Task 5: 书单页与标签页改用 BookRow

**Files:**
- Modify: `src/pages/books/index.astro`
- Modify: `src/pages/tags/[tag].astro`

- [ ] **Step 1: 改 `books/index.astro`**

把 import 与渲染由 `BookCard` 改为 `BookRow`，并把组内 `.grid` 改为纵向 `.rows`。完整替换文件为：

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import BookRow from '../../components/BookRow.astro';
import { sortByDateDesc, groupByCategory } from '../../lib/content';

const books = sortByDateDesc(
  await getCollection('books', ({ data }) => !data.draft),
);
const groups = groupByCategory(books);
---

<BaseLayout title="书单" description="关于幸福的推荐书单，按类型分组。">
  <div class="page-head page-head-center rise">
    <h1>幸福的书单</h1>
    <p class="lede">共 {books.length} 本，按类型分组。每一本都附上推荐的理由。</p>
  </div>

  <div class="wide">
    {groups.map(([category, items], gi) => (
      <section class="genre rise" style={`animation-delay: ${gi * 110 + 120}ms`}>
        <header class="genre-head">
          <h2>{category}</h2>
          <span class="count">{items.length} 本</span>
          <i class="rule" aria-hidden="true"></i>
        </header>
        <div class="rows">
          {items.map((book) => <BookRow book={book} />)}
        </div>
      </section>
    ))}
  </div>
</BaseLayout>

<style>
  .genre { margin-bottom: 3.5rem; }
  .genre-head {
    display: flex;
    align-items: baseline;
    gap: 0.9rem;
    margin-bottom: 0.6rem;
  }
  .genre-head h2 {
    font-size: 1.45rem;
    font-weight: 900;
    margin: 0;
    padding-left: 0.9rem;
    border-left: 5px solid var(--peach);
  }
  .count {
    font-family: var(--font-display);
    font-size: 0.85rem;
    color: var(--ink-mute);
    letter-spacing: 0.1em;
    white-space: nowrap;
  }
  .rule { flex: 1; height: 1px; background: var(--hairline); }

  .rows { display: flex; flex-direction: column; }
</style>
```

- [ ] **Step 2: 改 `tags/[tag].astro`**

把 `BookCard` import 换成 `BookRow`，把书籍区块的 `.grid` 容器换成 `.rows` 纵向列表。具体改动：

将第 5 行
```astro
import BookCard from '../../components/BookCard.astro';
```
改为
```astro
import BookRow from '../../components/BookRow.astro';
```

将书籍区块（第 41–48 行）
```astro
  {books.length > 0 && (
    <section class="block wide rise" style="animation-delay: 200ms">
      <h2>书籍</h2>
      <div class="grid">
        {books.map((book) => <BookCard book={book} />)}
      </div>
    </section>
  )}
```
改为
```astro
  {books.length > 0 && (
    <section class="block wide rise" style="animation-delay: 200ms">
      <h2>书籍</h2>
      <div class="rows">
        {books.map((book) => <BookRow book={book} />)}
      </div>
    </section>
  )}
```

并把 `<style>` 里的 `.grid {...}` 与其 `@media` 规则替换为：
```css
  .rows { display: flex; flex-direction: column; }
```

- [ ] **Step 3: 验证（先确保 `[slug].astro` 不阻断；若仍存在且引用 purchaseLinks，先做 Task 6 再回来构建）**

执行 Task 6 后统一构建。此处仅静态检查无遗留 `BookCard` 引用：
```bash
grep -rn "BookCard" src/pages/
```
Expected: 无输出（两处都已替换）。

- [ ] **Step 4: 提交**

```bash
git add src/pages/books/index.astro src/pages/tags/[tag].astro
git commit -m "book: 书单页与标签页改用 BookRow 行列表"
```

---

## Task 6: 删除详情页及相关文件，清理 schema 引用

**Files:**
- Delete: `src/pages/books/[slug].astro` `src/components/BookCard.astro` `src/components/PurchaseLinks.astro`
- Modify: `src/lib/schema.ts`

- [ ] **Step 1: 删除三个文件**

```bash
git rm src/pages/books/[slug].astro src/components/BookCard.astro src/components/PurchaseLinks.astro
```

- [ ] **Step 2: 从 `src/lib/schema.ts` 删除 `bookSchema`**

删除 `schema.ts` 中整个 `bookSchema` 函数（含其上方注释 `/** 书籍详情页：Book + 站点的一句话点评（Review）。 */`）：

```ts
/** 书籍详情页：Book + 站点的一句话点评（Review）。 */
export function bookSchema(book: BookEntry, site: URL) {
  const url = abs(`/books/${book.id}/`, site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.data.title,
    author: { '@type': 'Person', name: book.data.author },
    url,
    inLanguage: SITE.locale,
    review: {
      '@type': 'Review',
      reviewBody: book.data.oneLiner,
      author: { '@type': 'Organization', name: SITE.title },
    },
  };
}
```

删除后，`BookEntry` 类型别名（第 8 行 `type BookEntry = CollectionEntry<'books'>;`）若无其它使用则一并删除以避免未用变量告警。

```bash
grep -n "BookEntry" src/lib/schema.ts
```
若仅剩声明那一行，删除它。

- [ ] **Step 3: 确认无其它地方 import bookSchema**

```bash
grep -rn "bookSchema" src/
```
Expected: 无输出（`[slug].astro` 已删，是唯一调用方）。

- [ ] **Step 4: 提交**

```bash
git add -A src/pages/books src/components src/lib/schema.ts
git commit -m "book: 删除书籍详情页、BookCard、PurchaseLinks 及 bookSchema"
```

---

## Task 7: 同步首页迷你书单、llms.txt、读书笔记内链

**Files:**
- Modify: `src/pages/index.astro`（迷你书单 href）
- Modify: `src/pages/llms.txt.ts`（书籍链接）
- Modify: `src/content/posts/conquest-of-happiness-notes.md:46`（失效内链）

- [ ] **Step 1: 改首页迷你书单链接**

`src/pages/index.astro` 第 56–64 行的 `mini-book` 链接，把 `href` 与属性改为指向京东：

```astro
        {books.map((book) => (
          <a
            class="mini-book"
            href={book.data.buyUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
          >
            <Image src={book.data.cover} alt={`《${book.data.title}》封面`} width={92} />
            <span>
              <strong>{book.data.title}</strong>
              <em>{book.data.author}</em>
            </span>
          </a>
        ))}
```

- [ ] **Step 2: 改 `llms.txt.ts` 书籍链接**

`src/pages/llms.txt.ts` 第 32–35 行：

```ts
    ...books.map(
      (b) =>
        `- [${b.data.title}（${b.data.author}）](${b.data.buyUrl})：${b.data.oneLiner}`,
    ),
```

- [ ] **Step 3: 改读书笔记失效内链**

`src/content/posts/conquest-of-happiness-notes.md` 第 46 行，把 `/books/conquest-of-happiness/` 改为 `/books`：

原文：
```markdown
想了解购买渠道，见[书单页的条目](/books/conquest-of-happiness/)。如果想看更主观的一篇随想，可以读[读罗素：幸福与对自由的贪婪](/posts/russell-happiness-and-freedom/)。
```
改为：
```markdown
想了解购买渠道，见[书单页](/books)。如果想看更主观的一篇随想，可以读[读罗素：幸福与对自由的贪婪](/posts/russell-happiness-and-freedom/)。
```

- [ ] **Step 4: 提交**

```bash
git add src/pages/index.astro src/pages/llms.txt.ts src/content/posts/conquest-of-happiness-notes.md
git commit -m "book: 首页迷你书单/llms.txt/读书笔记内链改为指向京东或书单页"
```

---

## Task 8: 全量构建与回归验证

**Files:** 无（验证任务）

- [ ] **Step 1: 跑单元测试（护栏）**

```bash
npm test
```
Expected: PASS。`content.test.ts` 测的 `sortByDateDesc`/`groupByCategory`/`collectTags` 签名未变。

- [ ] **Step 2: 全量构建**

```bash
npm run build
```
Expected: 构建成功，无报错。Pagefind 索引正常生成。

- [ ] **Step 3: 确认不再生成详情页**

```bash
ls dist/books/ && find dist/books -name "index.html" | sort
```
Expected: `dist/books/index.html` 存在；**不存在** `dist/books/conquest-of-happiness/index.html` 等详情页目录。

- [ ] **Step 4: 确认书单页输出 4 本、链接指向京东**

```bash
grep -c "union-click.jd.com" dist/books/index.html
grep -o 'rel="[^"]*sponsored[^"]*"' dist/books/index.html | head
```
Expected: union-click 出现次数 ≥ 4（每行整行 + 可能二维码 alt 无链接，按组件实际）；存在 `rel="...sponsored..."`。

- [ ] **Step 5: 确认首页与 llms.txt 已切换**

```bash
grep -c "union-click.jd.com" dist/index.html
grep -c "/books/" dist/llms.txt
grep -c "union-click.jd.com" dist/llms.txt
```
Expected: 首页 union-click ≥ 4；`dist/llms.txt` 中 `/books/<slug>/` 计数为 0（只剩 `/books` 入口若有），union-click ≥ 4。

- [ ] **Step 6: 确认读书笔记不再含失效内链**

```bash
grep -rn "/books/conquest-of-happiness" dist/ || echo "OK: no stale book detail link"
```
Expected: `OK: no stale book detail link`。

- [ ] **Step 7: 人工核对（dev 预览）**

```bash
npm run preview
```
打开 `/books`，逐项确认：
- 4 行按 哲学 / 心理学 分组显示。
- 鼠标进入整行高亮；封面有「京东购买」按钮；右侧二维码 + 「扫码购买」。
- 点击任一行新窗口打开京东（union-click 链接）。
- 移动端窄屏二维码隐藏、布局不破。
- 每本书封面与二维码与书名一一对应（核对 4 组）。

- [ ] **Step 8: 最终提交（若验证中有微调）**

```bash
git add -A && git commit -m "book: 书单行列表改造完成，构建与回归验证通过" || echo "无改动可提交"
```

---

## Self-Review

**Spec 覆盖核对：**
- schema +qrcode/+buyUrl/+recommend/−purchaseLinks → Task 2 ✓
- 4 本真实书数据 + 资产 → Task 1、Task 3 ✓
- BookRow（整行链接 + 封面按钮 + 二维码，无编者按行）→ Task 4 ✓
- 书单页分类分组行列表 → Task 5 ✓
- 标签页改 BookRow → Task 5 ✓
- 删除详情页/BookCard/PurchaseLinks/bookSchema → Task 6 ✓
- 首页迷你书单/llms.txt/读书笔记内链同步 → Task 7 ✓
- 整行 `nofollow sponsored noopener` 新窗口 → Task 4、Task 7 ✓
- 构建/sitemap/测试验证 → Task 8 ✓

**类型一致性：** `book.data` 字段名（`cover` `qrcode` `recommend` `buyUrl` `oneLiner` `title` `author`）在 schema（Task 2）、BookRow（Task 4）、首页/llms.txt（Task 7）中一致。

**占位符扫描：** 无 TBD/TODO；所有 buyUrl、recommend、文件路径均为实际值。

**已知顺序依赖：** `astro check`/`build` 在 Task 6 删除 `[slug].astro` 之前可能因其引用 `purchaseLinks` 报错；Task 3/5 的中间验证步骤已注明「可先做 Task 6 再回来构建」，最终以 Task 8 全量构建为准。建议按 1→2→3→4→5→6→7→8 顺序执行，构建验证集中在 Task 8。
