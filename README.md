# 追寻幸福

面向中文读者的幸福主题内容站：文章、访谈、推荐书单。Astro 5 静态站点。

## 日常写作

- **写文章**：在 `src/content/posts/` 新建 `.md` 文件，文件名即 URL slug（用英文短横线命名，如 `on-gratitude.md`）
- **写访谈**：同上，frontmatter 多填 `interviewee` 和 `intervieweeBio` 两个字段，tags 里加上 `访谈`
- **推荐书**：在 `src/content/books/` 新建 `.md`，封面图放 `src/content/books/covers/`，frontmatter 的 `cover` 用相对路径引用；`category` 决定书单页的分组（如 `心理学`），不填时用第一个 tag
- **草稿**：frontmatter 加 `draft: true`，构建时自动跳过
- **佣金链接**：申请到联盟账号（京东联盟/当当联盟等）后，把推广链接替换进各书的 `purchaseLinks[].url` 即可，无需改代码
- 字段写错时 `npm run build` 会直接报错并指出文件，放心改

## 本地开发

```bash
npm install
npm run dev        # 开发服务器（搜索功能在 dev 下不可用）
npm test           # 单元测试
npm run build      # 构建 + 生成搜索索引
npm run preview    # 本地预览构建产物（可验证搜索）
```

## 部署（Cloudflare Pages）

1. 把仓库推到 GitHub
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → 连接该仓库
3. 构建配置：Build command `npm run build`，Build output directory `dist`
4. 部署成功后，把 `astro.config.mjs` 里的 `site` 改成实际地址（影响 RSS 链接），提交后自动重新部署
5. 绑定自定义域名（可选）：Pages 项目 → Custom domains

## 开通评论（giscus）

见 `src/config.ts` 中 GISCUS 配置块的注释，三步完成。

## 设计文档

- 规格：`docs/superpowers/specs/2026-06-10-happiness-website-design.md`
- 实现计划：`docs/superpowers/plans/2026-06-10-happiness-website.md`
