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
