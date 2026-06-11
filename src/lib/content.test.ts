import { describe, it, expect } from 'vitest';
import { sortByDateDesc, collectTags, formatDate, groupByCategory } from './content';

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

describe('groupByCategory', () => {
  const book = (category: string | undefined, tags: string[]) => ({
    data: { category, tags },
  });

  it('优先用 category 分组，缺省回退第一个 tag', () => {
    const groups = groupByCategory([
      book('心理学', ['认知']),
      book(undefined, ['哲学']),
    ]);
    expect(groups.map(([name]) => name)).toContain('心理学');
    expect(groups.map(([name]) => name)).toContain('哲学');
  });

  it('组名按中文排序，组内保持传入顺序', () => {
    const a = book('心理学', []);
    const b = book('生活方式', []);
    const c = book('心理学', []);
    const groups = groupByCategory([a, b, c]);
    expect(groups.map(([name]) => name)).toEqual(['生活方式', '心理学']);
    expect(groups.find(([name]) => name === '心理学')?.[1]).toEqual([a, c]);
  });

  it('既无 category 也无 tag 时归入「其他」', () => {
    const groups = groupByCategory([book(undefined, [])]);
    expect(groups[0][0]).toBe('其他');
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
