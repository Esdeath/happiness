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
