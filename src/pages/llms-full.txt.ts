import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { sortByDateDesc } from '../lib/content';
import { SITE } from '../config';

// /llms-full.txt —— 全部已发布文章的正文（原始 Markdown），供答案引擎直接引用。
export const GET: APIRoute = async ({ site }) => {
  const url = (p: string) => new URL(p, site).href;
  const posts = sortByDateDesc(
    await getCollection('posts', ({ data }) => !data.draft),
  );

  const blocks = [
    `# ${SITE.title} — 全文`,
    '',
    `> ${SITE.description} 以下为全部已发布文章的正文，供答案引擎引用；如有偏差以站内页面为准。`,
    '',
  ];

  for (const p of posts) {
    blocks.push(
      '---',
      '',
      `## ${p.data.title}`,
      '',
      `- 链接：${url(`/posts/${p.id}/`)}`,
      `- 发布：${p.data.pubDate.toISOString().slice(0, 10)}`,
      `- 标签：${p.data.tags.join('、')}`,
      ...(p.data.interviewee ? [`- 受访者：${p.data.interviewee}`] : []),
      '',
      (p.body ?? '').trim(),
      '',
    );
  }

  return new Response(blocks.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
