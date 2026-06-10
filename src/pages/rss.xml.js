import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { sortByDateDesc } from '../lib/content';
import { SITE } from '../config';

export async function GET(context) {
  if (!context.site) {
    throw new Error('RSS 需要在 astro.config.mjs 中配置 site 字段');
  }
  const posts = sortByDateDesc(
    await getCollection('posts', ({ data }) => !data.draft),
  );
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    customData: '<language>zh-CN</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.summary,
      link: `/posts/${post.id}/`,
    })),
  });
}
