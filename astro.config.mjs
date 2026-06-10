import { defineConfig } from 'astro/config';

export default defineConfig({
  // 首次部署 Cloudflare Pages 后改成实际地址（RSS 的绝对链接依赖它）
  site: 'https://happiness.pages.dev',
});
