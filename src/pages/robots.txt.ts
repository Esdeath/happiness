import type { APIRoute } from 'astro';

// 动态生成 robots.txt：Sitemap 行随 astro.config 的 site 字段变化，换域名零改动。
export const GET: APIRoute = ({ site }) => {
  const body = `User-agent: *
Allow: /
Disallow: /search

Sitemap: ${new URL('/sitemap-index.xml', site).href}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
