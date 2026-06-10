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

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'long',
  timeZone: 'Asia/Shanghai',
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}
