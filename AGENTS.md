# Repository Guidelines

## Project Structure & Module Organization

This is an Astro 5 static site for Chinese content about happiness. Page routes live in `src/pages/`, shared layout in `src/layouts/BaseLayout.astro`, reusable UI in `src/components/`, and site-wide styles in `src/styles/global.css`. Content collections are Markdown files under `src/content/posts/` and `src/content/books/`; book cover assets live in `src/content/books/covers/`. Shared helpers and schemas are in `src/lib/`, with tests colocated as `*.test.ts`. Public static assets belong in `public/`. Generated output (`dist/`, `.astro/`, `node_modules/`) should not be edited by hand.

## Build, Test, and Development Commands

- `npm install`: install dependencies; Node 20+ is required.
- `npm run dev`: start the Astro dev server. Pagefind search is not available in dev.
- `npm test`: run Vitest unit tests.
- `npm run build`: build static pages and generate the Pagefind search index in `dist/pagefind`.
- `npm run preview`: preview the built `dist/` site locally, useful for validating search.
- `npm run deploy`: run `scripts/deploy.sh`.

## Coding Style & Naming Conventions

Use TypeScript and Astro patterns already present in the repo. Prefer two-space indentation in Astro, TS, CSS, and Markdown frontmatter. Keep components small and route-specific CSS inside the relevant `.astro` file unless it is reused globally. Content slugs should use lowercase English kebab-case, for example `on-gratitude.md`. Posts require `title`, `pubDate`, `summary`, and `tags`; interviews also include `interviewee` and `intervieweeBio`. Books require `cover`, `oneLiner`, `tags`, and optional `category`.

## Testing Guidelines

Vitest is the test framework. Add focused `*.test.ts` files next to shared logic, especially under `src/lib/`. Run `npm test` for logic changes and `npm run build` for route, content schema, SEO, RSS, sitemap, or Pagefind changes. There is no formal coverage gate; prioritize tests for sorting, grouping, URL generation, and date behavior.

## Commit & Pull Request Guidelines

Recent history uses short imperative messages, often with a scope such as `refactor(theme): ...`, `chore(seo): ...`, `post: ...`, or `book: ...`. Keep commits focused and mention content type when relevant. Pull requests should summarize the change, list verification commands, link any related issue, and include screenshots for visible UI or layout changes. Note if `astro.config.mjs` site settings, giscus config, or deployment behavior changed.

## Security & Configuration Tips

Do not commit secrets or affiliate credentials. Configure giscus in `src/config.ts`, and update `astro.config.mjs` `site` when deploying to a new canonical domain because it affects RSS, sitemap, and absolute metadata URLs.
