import type { CollectionEntry } from 'astro:content';
import { SITE } from '../config';

// 生成 JSON-LD 结构化数据对象。纯函数，模板只负责传值与注入。
// 所有 URL 都基于传入的 site（来自 astro.config 的 site 字段），换域名零改动。

type PostEntry = CollectionEntry<'posts'>;

interface Crumb {
  name: string;
  path: string;
}

function abs(path: string, site: URL): string {
  return new URL(path, site).href;
}

function publisher(site: URL) {
  return {
    '@type': 'Organization',
    name: SITE.title,
    logo: { '@type': 'ImageObject', url: abs('/favicon.svg', site) },
  };
}

/** 站点身份 + 站内搜索动作（帮助 Google sitelinks search box）。 */
export function websiteSchema(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.title,
    description: SITE.description,
    url: abs('/', site),
    inLanguage: SITE.locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: abs('/search?q={search_term_string}', site),
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationSchema(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.title,
    url: abs('/', site),
    logo: abs('/favicon.svg', site),
  };
}

/** 文章/访谈页：BlogPosting。image 传已解析好的绝对 URL。 */
export function blogPostingSchema(post: PostEntry, site: URL, image: string) {
  const url = abs(`/posts/${post.id}/`, site);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: post.data.summary,
    datePublished: post.data.pubDate.toISOString(),
    author: { '@type': 'Person', name: SITE.author },
    publisher: publisher(site),
    mainEntityOfPage: url,
    url,
    keywords: post.data.tags.join('、'),
    image,
    inLanguage: SITE.locale,
  };
}

export function breadcrumbSchema(items: Crumb[], site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path, site),
    })),
  };
}
