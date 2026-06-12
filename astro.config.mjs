import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://happiness-6y2.pages.dev',
  integrations: [
    // 站点地图自动随上面的 site 字段变化；排除仅供站内搜索的 /search。
    sitemap({ filter: (page) => !page.includes('/search') }),
  ],
});
