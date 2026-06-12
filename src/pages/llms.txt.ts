import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { sortByDateDesc } from '../lib/content';
import { SITE } from '../config';

// /llms.txt —— 面向 LLM/答案引擎的站点索引（遵循 llms.txt 约定）。
// 列出全部已发布文章与书籍的标题、摘要与绝对链接，方便 AI 抓取与引用。
export const GET: APIRoute = async ({ site }) => {
  const url = (p: string) => new URL(p, site).href;
  const posts = sortByDateDesc(
    await getCollection('posts', ({ data }) => !data.draft),
  );
  const books = sortByDateDesc(
    await getCollection('books', ({ data }) => !data.draft),
  );

  const lines = [
    `# ${SITE.title}`,
    '',
    `> ${SITE.description}`,
    '',
    '面向中文读者的幸福主题内容站，包含原创/翻译文章、人物访谈与精选书单。',
    '',
    '## 文章',
    '',
    ...posts.map(
      (p) => `- [${p.data.title}](${url(`/posts/${p.id}/`)})：${p.data.summary}`,
    ),
    '',
    '## 书单',
    '',
    ...books.map(
      (b) =>
        `- [${b.data.title}（${b.data.author}）](${url(`/books/${b.id}/`)})：${b.data.oneLiner}`,
    ),
    '',
    '## 订阅与抓取',
    '',
    `- [RSS](${url('/rss.xml')})`,
    `- [站点地图](${url('/sitemap-index.xml')})`,
    `- [全文（供 AI 引用）](${url('/llms-full.txt')})`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
