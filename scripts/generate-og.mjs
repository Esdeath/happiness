// 生成默认社交分享图 public/og-default.png（1200×630）。
// 用站点品牌色与笑脸标记，文字交给系统 CJK 字体渲染。
// 重新生成：node scripts/generate-og.mjs
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, '../public/og-default.png');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="dawn" cx="85%" cy="-10%" r="90%">
      <stop offset="0%" stop-color="#f3e1cf"/>
      <stop offset="60%" stop-color="#f6f1e6"/>
      <stop offset="100%" stop-color="#f6f1e6"/>
    </radialGradient>
    <radialGradient id="sun" cx="38%" cy="32%" r="70%">
      <stop offset="0%" stop-color="#e8b27d"/>
      <stop offset="78%" stop-color="#b65427"/>
      <stop offset="100%" stop-color="#a64a22"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#dawn)"/>
  <!-- 笑脸标记 -->
  <g transform="translate(600 196)">
    <circle cx="0" cy="0" r="74" fill="url(#sun)"/>
    <path d="M-34 6 C -18 34, 18 34, 34 6" stroke="#f6f1e6" stroke-width="11" fill="none" stroke-linecap="round"/>
  </g>
  <text x="600" y="392" text-anchor="middle"
    font-family="PingFang SC, Hiragino Sans GB, Noto Serif SC, Source Han Serif SC, serif"
    font-size="104" font-weight="700" letter-spacing="14" fill="#3a342c">追寻幸福</text>
  <text x="600" y="470" text-anchor="middle"
    font-family="PingFang SC, Hiragino Sans GB, Noto Serif SC, serif"
    font-size="38" letter-spacing="10" fill="#8a7f6e">慢慢走，欣赏啊。</text>
  <text x="600" y="556" text-anchor="middle"
    font-family="PingFang SC, Hiragino Sans GB, sans-serif"
    font-size="26" letter-spacing="6" fill="#b3a895">关于幸福的文章 · 访谈 · 书单</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log('wrote', out);
