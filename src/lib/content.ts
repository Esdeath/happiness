import type { ImageMetadata } from 'astro';
import { SITE } from '../config';

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

interface Categorized {
  data: { tags: string[]; category?: string };
}

/** 按 category（缺省回退第一个 tag）分组，组名按中文排序，组内保持传入顺序。 */
export function groupByCategory<T extends Categorized>(
  entries: T[],
): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const e of entries) {
    const key = e.data.category ?? e.data.tags[0] ?? '其他';
    const list = groups.get(key) ?? [];
    list.push(e);
    groups.set(key, list);
  }
  return [...groups.entries()].sort(([a], [b]) =>
    a.localeCompare(b, 'zh-Hans-CN'),
  );
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'long',
  timeZone: 'Asia/Shanghai',
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

const RASTER_FORMATS = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif']);

/**
 * 解析 og:image 的绝对 URL。位图封面（jpg/png/webp…）→ 优化后再绝对化；
 * SVG 封面或无封面 → 回退站点默认分享图。社交平台对 SVG 的 OG 支持差，故排除。
 */
export async function ogImageUrl(
  cover: ImageMetadata | undefined,
  site: URL | undefined,
): Promise<string> {
  const fallback = new URL(SITE.ogImage, site).href;
  if (!cover || !RASTER_FORMATS.has(cover.format)) return fallback;
  const { getImage } = await import('astro:assets');
  const optimized = await getImage({ src: cover, width: 1200 });
  return new URL(optimized.src, site).href;
}
