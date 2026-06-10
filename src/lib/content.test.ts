import { describe, it, expect } from 'vitest';
import { sortByDateDesc, collectTags, formatDate } from './content';

const entry = (date: string, tags: string[] = ['心理学']) => ({
  data: { pubDate: new Date(date), tags },
});

describe('sortByDateDesc', () => {
  it('按发布日期从新到旧排序', () => {
    const sorted = sortByDateDesc([entry('2026-06-01'), entry('2026-06-05'), entry('2026-06-03')]);
    expect(sorted.map((e) => e.data.pubDate.toISOString().slice(0, 10))).toEqual([
      '2026-06-05',
      '2026-06-03',
      '2026-06-01',
    ]);
  });

  it('不修改原数组', () => {
    const input = [entry('2026-06-01'), entry('2026-06-05')];
    sortByDateDesc(input);
    expect(input[0].data.pubDate.toISOString().slice(0, 10)).toBe('2026-06-01');
  });
});

describe('collectTags', () => {
  it('空输入返回空数组', () => {
    expect(collectTags([])).toEqual([]);
  });

  it('合并多个集合的标签并去重', () => {
    const tags = collectTags([
      entry('2026-06-01', ['心理学', '哲学']),
      entry('2026-06-02', ['心理学', '访谈']),
    ]);
    expect(tags).toHaveLength(3);
    expect(tags).toContain('心理学');
    expect(tags).toContain('哲学');
    expect(tags).toContain('访谈');
  });
});

describe('formatDate', () => {
  it('输出中文长日期，时区固定为 Asia/Shanghai', () => {
    expect(formatDate(new Date('2026-06-10'))).toBe('2026年6月10日');
  });

  it('跨午夜时刻按上海时区换日（UTC 17:00 = 上海次日 01:00）', () => {
    expect(formatDate(new Date('2026-06-10T17:00:00.000Z'))).toBe('2026年6月11日');
  });
});
