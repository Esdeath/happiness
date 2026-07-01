
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

「追寻幸福」(Pursuit of Happiness) — an Astro 5 static site of Chinese-language content (articles, interviews, a recommended-books list) on the theme of happiness. Deployed to Cloudflare Pages. All UI text and content are Chinese.

`AGENTS.md` holds contribution conventions (commit style, PR checklist, coding style). This file covers commands and architecture.

## Commands

Node 20+ required.

```bash
npm run dev        # Astro dev server. NOTE: Pagefind search does NOT work in dev.
npm test           # Vitest unit tests (src/**/*.test.ts)
npm run build      # astro build + generate Pagefind search index into dist/pagefind
npm run preview    # serve built dist/ — the only way to validate search locally
npm run deploy     # scripts/deploy.sh: npm test → npm run build → git commit -am → git push
```

Run a single test:
```bash
npx vitest run src/lib/content.test.ts
npx vitest run -t "按发布日期从新到旧排序"   # by test name
```

**When to run what:** `npm test` for changes to `src/lib/` logic. `npm run build` for any change to routes, content, the content schema, SEO/JSON-LD, RSS, sitemap, or Pagefind — the build is the real validation gate (bad frontmatter fails the build with the offending file named).

## Architecture

**Content is data, not code.** The two content collections in `src/content.config.ts` are the core. Adding an article or book = adding a Markdown file under `src/content/posts/` or `src/content/books/`; no code changes. Zod schemas validate frontmatter at build time, so a missing/wrong field fails `npm run build` rather than shipping broken.

- `posts`: `title`, `pubDate`, `summary`, `tags` (≥1), optional `cover`, optional `interviewee`/`intervieweeBio` (interviews; `intervieweeBio` requires `interviewee` — enforced by a schema refine), `draft`.
- `books`: `title`, `author`, `pubDate`, `cover`, `qrcode`, `oneLiner` (short), `recommend` (longer), `buyUrl` (the JD-affiliate purchase link — entire book row, cover button, and QR all point here), optional `category` (groups the book-list page; falls back to first tag), `tags` (≥1), `draft`.
- Drafts (`draft: true`) are excluded at build; every collection query filters `({ data }) => !data.draft`.

> Note: `README.md` mentions `purchaseLinks` on books, but the live schema uses a single `buyUrl`. The schema in `src/content.config.ts` is the source of truth.

**Domain changes are one line.** Every absolute URL (RSS, sitemap, OG images, JSON-LD, canonical) is derived from the `site` field in `astro.config.mjs`. The helpers in `src/lib/` all take a `site: URL` parameter and build URLs from it — switching canonical domain means editing only `astro.config.mjs`.

**Logic lives in pure, tested helpers; templates only pass values.**
- `src/lib/content.ts` — `sortByDateDesc`, `collectTags`, `groupByCategory` (category-or-first-tag grouping, Chinese collation), `formatDate` (fixed to Asia/Shanghai), `ogImageUrl` (optimizes raster covers, falls back to default share image for SVG/none).
- `src/lib/schema.ts` — pure JSON-LD builders (`websiteSchema`, `organizationSchema`, `blogPostingSchema`, `breadcrumbSchema`).
- `src/lib/content.test.ts` — covers the above. Prioritize tests here for sorting/grouping/URL/date logic.

**`src/layouts/BaseLayout.astro` is the single SEO/meta hub.** All pages render through it; it emits `<title>`, description, canonical, Open Graph, Twitter cards, and injects per-page JSON-LD via the `jsonLd` prop. Pages build their JSON-LD with the `src/lib/schema.ts` helpers and pass it down. Low-value pages (search, 404) pass `noindex`.

**Search = Pagefind, indexed at build.** `pagefind --site dist` runs after `astro build`. Content is marked with `data-pagefind-body`; non-content regions use `data-pagefind-ignore`. Search is unavailable in `dev` — use `npm run preview`.

**AI/machine-facing endpoints** are generated routes (not static files): `src/pages/llms.txt.ts`, `llms-full.txt.ts`, `robots.txt.ts`, `rss.xml.js`. `llms.txt` lists all published posts/books with absolute links; book entries link to `buyUrl`.

**`src/config.ts`** holds `SITE` metadata (title/description/author/locale/default OG image) and `GISCUS` comments config. When `GISCUS.repo` is empty the comment section renders nothing — comments are opt-in via three steps documented inline.

## Adding content

The `write-article` skill (`.claude/skills/write-article/`) is the intended workflow for any content addition — original articles, formatting a draft, translating an English article/URL, or summarizing a book into a book-list entry + reading-notes post. It handles slug naming, tag reuse, schema-valid frontmatter, `npm run build` validation, and (unless told otherwise) commits and pushes — which triggers the Cloudflare Pages deploy. Use the date from `date +%Y-%m-%d`, not memory, for `pubDate`.
