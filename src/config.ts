export const SITE = {
  title: '追寻幸福',
  description: '关于幸福的文章、访谈与书单。',
  // 作者/编辑名，用于结构化数据与 RSS。先用站名兜底；
  // 填上真实姓名能增强 E-E-A-T（作者可信度），对 SEO 与 AI 引用都有帮助。
  author: '追寻幸福',
  locale: 'zh-CN',
  // 默认社交分享图（1200×630）。书籍详情页若有位图封面会自动覆盖此项。
  ogImage: '/og-default.png',
};

// giscus 评论配置。三步开通：
// 1. 网站代码推到 GitHub 公开仓库，并在仓库 Settings 里启用 Discussions
// 2. 打开 https://giscus.app，选择该仓库，按页面提示生成参数
// 3. 把生成的 repo / repoId / category / categoryId 填到下面
// repo 留空时，评论区整体不渲染（不影响正文阅读）。
export const GISCUS = {
  repo: '',
  repoId: '',
  category: 'Announcements',
  categoryId: '',
};
