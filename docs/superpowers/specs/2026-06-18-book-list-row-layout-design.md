# 书单页改为分类行列表 — 设计文档

日期：2026-06-18

## 目标

把书单页从「按分类分组的封面网格」改为「按分类分组的行列表」。每一行是一本书，
鼠标进入整行时高亮，点击整行跳转到京东联盟推广链接（新窗口）。每行包含：
左侧封面 + 叠在封面上的「京东购买」按钮，中间书名 + 推荐理由，右侧京东购买二维码。

参考图里的「段永平投资问答录」只示范行的视觉样式；本站实际内容是 `book.md` 里的
4 本幸福主题书。

## 已确认的决策

- **整行点击 → 京东联盟推广链接**（`buyUrl`），`target="_blank" rel="nofollow sponsored noopener"`。
  封面按钮、二维码、整行都指向同一个 `buyUrl`。
- **移除书籍详情页** `/books/[slug]`，并同步清理所有引用它的入口。
- **保留分类分组**（哲学 / 心理学 / 生活方式 等小标题），沿用 `groupByCategory`。
- **不要「编者按 京东购买正版 ›」那一行**。
- **右侧显示二维码**（`book.md` 已提供 4 张，中心嵌封面）。
- 列表描述使用 `book.md` 里较长的「推荐理由」（2–3 行截断显示），替代旧的一句话 `oneLiner`。
- 标签页也改用行卡片组件，避免两套书卡样式。

## 数据来源

来源：`/Users/ruimin/Desktop/jdbook/book.md` 及同目录 `cover/`、`qrcode/`。

4 本书（slug → 资料）：

| slug | 书名 | 作者 | category | 封面源 | 二维码源 |
|---|---|---|---|---|---|
| `conquest-of-happiness` | 幸福之路 | [英] 伯特兰·罗素（黄菡 新译） | 哲学 | `cover/幸福之路.jpg` | `qrcode/幸福之路.png` |
| `flow` | 心流（套装共2册：心流 + 发现心流） | [美] 米哈里·契克森米哈赖 | 心理学 | `cover/心流.jpg` | `qrcode/心流.png` |
| `happier` | 幸福的方法 | [以] 泰勒·本-沙哈尔 | 心理学 | `cover/幸福的方法.jpg` | `qrcode/幸福的方法.png` |
| `authentic-happiness` | 真实的幸福 | [美] 马丁·塞利格曼 | 心理学 | `cover/真实的幸福.jpg` | `qrcode/真实的幸福.png` |

`buyUrl` 取自 `book.md` 各书的「京东联盟推广链接」代码块（`https://union-click.jd.com/jdc?...`）。

推荐理由（列表中间栏描述）取自 `book.md` 各书的「推荐理由」段落。

注：现有站内 3 本书是种子数据，`flow`/`happier` 的正文是占位示例。本次用 `book.md` 的真实
内容替换，并新增第 4 本 `authentic-happiness`。

## Schema 变更（`src/content.config.ts` books 集合）

新增字段：

- `qrcode: image()` — 京东购买二维码图片。
- `buyUrl: z.string().url()` — 京东联盟推广链接。
- `recommend: z.string()` — 较长的推荐理由（2–3 句），用于书单行中间栏的描述。
  作为 frontmatter 字段（纯文本），避免在卡片里解析 markdown body。

移除字段：

- `purchaseLinks` — 仅详情页使用，详情页删除后无处使用。

保留字段：`title` `author` `pubDate` `cover` `oneLiner` `category` `tags`。
- `oneLiner`（一句话）：仍保留，供首页迷你书单、RSS/SEO 描述、og 等使用。
- `recommend`（较长推荐理由）：书单行中间栏的描述。

md 正文 body：详情页删除后无展示位。保留 body 不影响构建（不再被 render），
正文内容迁入 `recommend` 字段或弃用。本次将 `book.md` 的「推荐理由」写入 `recommend`。

## 资产处理

- 把 4 张封面复制到 `src/content/books/covers/`，文件名用 slug（`authentic-happiness.jpg` 等）。
  现有 3 张封面可被 `book.md` 的新封面覆盖（更清晰），或保留——以 `book.md` 为准统一替换。
- 新建 `src/content/books/qrcodes/`，复制 4 张二维码，文件名用 slug。
- 封面、二维码都通过 Astro `image()` 走资源优化。

## 组件变更

### 新增 `src/components/BookRow.astro`（替换 `BookCard.astro`）

Props：`book: CollectionEntry<'books'>`。描述文本读 `book.data.recommend`。

结构（整行是一个 `<a href={buyUrl}>`）：

```
<a class="book-row" href={buyUrl} target="_blank" rel="nofollow sponsored noopener">
  <div class="cover">
    <Image .../>
    <span class="buy-badge">京东购买 ›</span>   <!-- 叠在封面底部 -->
  </div>
  <div class="meta">
    <h3>{title}</h3>
    <p class="desc">{recommend，2–3 行截断}</p>
  </div>
  <div class="qr">
    <Image .../>
    <span>扫码购买</span>
  </div>
</a>
```

样式要点：

- 三栏 grid：`grid-template-columns: auto 1fr auto`，行间用 `--hairline` 细分隔线（参考图）。
- 整行 hover：浅色高亮背景（参考图效果），沿用 `rgba(255,253,248,...)` 暖纸色。
- 「京东购买」按钮：柿色 `--persimmon`，叠在封面底部。
- 二维码右侧固定宽度（约 120–140px），下方「扫码购买」小字。
- 描述 2–3 行 `-webkit-line-clamp` 截断。
- 移动端（<640px）：三栏塌成上下堆叠，二维码隐藏或下移；整行仍可点。
- 因整行是 `<a>`，内部不能再嵌套 `<a>`（无嵌套链接），编者按行已确认去掉，无冲突。

### 删除

- `src/pages/books/[slug].astro`
- `src/components/BookCard.astro`
- `src/components/PurchaseLinks.astro`

## 页面变更

### `src/pages/books/index.astro`

- 用 `BookRow` 替换 `BookCard`。
- 每个分类组下面，行列表纵向排列（不再网格），行之间分隔线。
- 文案：`共 N 本，按类型分组` 中的 N 自动变 4。

### `src/pages/tags/[tag].astro`

- 书籍区块由 `BookCard` 网格改为 `BookRow` 纵向列表。

### `src/pages/index.astro`（首页迷你书单）

- `mini-book` 的 `href` 由 `/books/${book.id}` 改为 `book.data.buyUrl`，
  加 `target="_blank" rel="nofollow sponsored noopener"`。

### `src/pages/llms.txt.ts`

- 书籍链接由 `/books/<slug>/` 改为 `book.data.buyUrl`（联盟链接对 AI 引用无害，
  但更稳妥的是仅列书名+作者+oneLiner 不带链接）。**采用：用 buyUrl。**

### `src/lib/schema.ts`

- 移除 `bookSchema`（无详情页，无 Book JSON-LD）。确认无其它调用方（已确认仅
  `[slug].astro` 调用，随该文件删除）。

### `src/content/posts/conquest-of-happiness-notes.md`

- 第 46 行 `[书单页的条目](/books/conquest-of-happiness/)` 会 404（详情页删除）。
  改为指向书单页 `/books`（或该书的京东链接）。**采用：改为 `/books`。**

## 测试与验证

- `npm run build` 必须通过（路由、schema、sitemap、pagefind、SEO 变更）。
- 构建后检查：
  - `/books` 渲染 4 行，分类分组正确，整行链接指向 union-click。
  - 不再生成 `/books/<slug>/` 详情页。
  - 首页迷你书单、标签页链接指向京东。
  - `/llms.txt` 不再含 `/books/<slug>/`。
  - `conquest-of-happiness-notes` 正文不再含失效内链。
- `npm test`：现有 `src/lib/content.test.ts` 测的是 `sortByDateDesc`/`groupByCategory`/
  `collectTags`，这些函数签名不变，应继续通过。`bookSchema` 删除——确认测试未引用它。
- 人工核对二维码与封面正确对应每本书。

## 风险与权衡

- **SEO**：删除 4 个详情页 URL 会移除已存在的索引页。该站新上线、详情页内容也只是
  种子/简短，影响小。书单页仍承载全部书籍信息。
- **联盟链接合规**：所有外链 `rel="nofollow sponsored noopener"`、新窗口，符合规范。
- **正文展示位丢失**：长推荐理由现在只在书单行截断显示，无独立详情页。已与用户确认接受。
