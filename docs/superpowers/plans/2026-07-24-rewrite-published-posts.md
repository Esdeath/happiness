# 已发布文章重写实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将站内 10 篇已发布读书笔记重写为每篇约 3000 字的深度读书随笔，同时完整保留黄峥文章、草稿和书单内容。

**Architecture:** 以两篇为一个写作批次，逐篇保留 frontmatter 中的标题、日期和标签，只更新摘要与正文。每个批次完成后检查字符数、中文排版和 AI 模板句，最后用 Git 对比确认保护文件未变，并运行 Astro 全量构建。

**Tech Stack:** Markdown、Astro 5 内容集合、ripgrep、Git、npm build、Pagefind

## Global Constraints

- 每篇正文目标为 2800–3300 个中文字符，frontmatter 不计。
- 不修改 `src/content/posts/russell-happiness-and-freedom.md`。
- 不修改 `src/content/posts/draft-example.md` 和 `src/content/books/`。
- 保留每篇标题、文件名、发布日期和标签。
- 不添加无法核实的引语、页码、研究数字或个人经历。
- 遵循 `write-article` 中文排版规范和 `stop-slop` 语言标准。

---

### Task 1: 重写优势与注意力主题文章

**Files:**
- Modify: `src/content/posts/authentic-happiness-notes.md`
- Modify: `src/content/posts/conquest-of-happiness-notes.md`

**Interfaces:**
- Consumes: 现有 frontmatter、原文事实骨架及设计文档中的两篇主线。
- Produces: 两篇 2800–3300 字、摘要不超过 60 字的发布文章。

- [ ] **Step 1: 读取两篇原文并记录必须保留的概念与事实**

Run: `sed -n '1,260p' src/content/posts/authentic-happiness-notes.md && sed -n '1,260p' src/content/posts/conquest-of-happiness-notes.md`

Expected: 能识别塞利格曼的优势、愉悦、投入、意义，以及罗素分析的不幸来源与幸福条件。

- [ ] **Step 2: 重写摘要和正文**

使用 `apply_patch` 完整替换两篇摘要与正文，保留 `title`、`pubDate` 和 `tags` 原值。两篇使用不同的开头情境、章节标题和收束方式。

- [ ] **Step 3: 检查批次质量**

Run: `for f in src/content/posts/{authentic-happiness-notes,conquest-of-happiness-notes}.md; do awk 'BEGIN{body=0} /^---$/{if(body==0){body=1;next}else if(body==1){body=2;next}} body==2{print}' "$f" | wc -m; done`

Expected: 每篇正文接近 2800–3300 个字符；frontmatter 未改变必保留字段；没有破折号或统一模板结构。

### Task 2: 重写蓬勃与中国语境主题文章

**Files:**
- Modify: `src/content/posts/flourish-notes.md`
- Modify: `src/content/posts/flourishing-life-notes.md`

**Interfaces:**
- Consumes: 现有 PERMA、优势、关系、韧性及文化背景材料。
- Produces: 一篇聚焦蓬勃模型，一篇聚焦中国生活处境的独立文章。

- [ ] **Step 1: 读取原文并区分两篇论证边界**

Run: `sed -n '1,300p' src/content/posts/flourish-notes.md && sed -n '1,300p' src/content/posts/flourishing-life-notes.md`

Expected: 前者围绕 PERMA 与蓬勃，后者围绕积极心理学在本土关系、工作和文化中的应用。

- [ ] **Step 2: 重写摘要和正文**

使用 `apply_patch` 更新两篇文章。前者避免将 PERMA 写成检查表，后者明确个人练习与结构条件、专业支持之间的边界。

- [ ] **Step 3: 检查批次质量**

Run: `for f in src/content/posts/{flourish-notes,flourishing-life-notes}.md; do awk 'BEGIN{body=0} /^---$/{if(body==0){body=1;next}else if(body==1){body=2;next}} body==2{print}' "$f" | wc -m; done`

Expected: 两篇均在目标篇幅附近，论证主线与章节标题不重复。

### Task 3: 重写心流与幸福方法主题文章

**Files:**
- Modify: `src/content/posts/flow-notes.md`
- Modify: `src/content/posts/happier-notes.md`

**Interfaces:**
- Consumes: 心流的注意力条件，以及快乐、意义与自我和谐目标材料。
- Produces: 一篇讨论时间体验，一篇讨论延迟幸福的文章。

- [ ] **Step 1: 读取原文并提取生活场景**

Run: `sed -n '1,280p' src/content/posts/flow-notes.md && sed -n '1,280p' src/content/posts/happier-notes.md`

Expected: 能将心流放入工作与休闲，将快乐和意义放入目标、义务与选择。

- [ ] **Step 2: 重写摘要和正文**

使用 `apply_patch` 更新两篇文章。避免把心流等同于高效率，也不把幸福方法写成要求每件事兼具快乐和意义的处方。

- [ ] **Step 3: 检查批次质量**

Run: `for f in src/content/posts/{flow-notes,happier-notes}.md; do awk 'BEGIN{body=0} /^---$/{if(body==0){body=1;next}else if(body==1){body=2;next}} body==2{print}' "$f" | wc -m; done`

Expected: 两篇均在目标篇幅附近，概念有现实用法也有适用边界。

### Task 4: 重写情感预测与分裂心智主题文章

**Files:**
- Modify: `src/content/posts/stumbling-on-happiness-notes.md`
- Modify: `src/content/posts/the-happiness-hypothesis-notes.md`

**Interfaces:**
- Consumes: 情感预测偏差、心理免疫系统、象与骑手、道德直觉及关系材料。
- Produces: 一篇关于未来选择，一篇关于理性与直觉合作的文章。

- [ ] **Step 1: 读取原文并核对术语关系**

Run: `sed -n '1,300p' src/content/posts/stumbling-on-happiness-notes.md && sed -n '1,300p' src/content/posts/the-happiness-hypothesis-notes.md`

Expected: 术语只沿用原文已建立的含义，不添加未经核实的实验数字或新引语。

- [ ] **Step 2: 重写摘要和正文**

使用 `apply_patch` 更新两篇文章，将决定复核、关系沟通和习惯训练写成具体场景，避免万能建议。

- [ ] **Step 3: 检查批次质量**

Run: `for f in src/content/posts/{stumbling-on-happiness-notes,the-happiness-hypothesis-notes}.md; do awk 'BEGIN{body=0} /^---$/{if(body==0){body=1;next}else if(body==1){body=2;next}} body==2{print}' "$f" | wc -m; done`

Expected: 两篇均在目标篇幅附近，文章没有互相重复的框架。

### Task 5: 重写心理学素养与判断偏差主题文章

**Files:**
- Modify: `src/content/posts/the-seeds-of-happiness-notes.md`
- Modify: `src/content/posts/thinking-fast-and-slow-notes.md`

**Interfaces:**
- Consumes: 心理学入门地图、感知记忆与文化材料，以及双系统、启发式、前景理论材料。
- Produces: 一篇关于减少自我误解，一篇关于改善判断程序的文章。

- [ ] **Step 1: 读取原文并明确科普边界**

Run: `sed -n '1,320p' src/content/posts/the-seeds-of-happiness-notes.md && sed -n '1,320p' src/content/posts/thinking-fast-and-slow-notes.md`

Expected: 科普不替代诊断治疗，双系统明确为叙述模型，判断建议聚焦程序设计。

- [ ] **Step 2: 重写摘要和正文**

使用 `apply_patch` 更新两篇文章，保留概念准确性，删去教科书式罗列，以连续问题组织材料。

- [ ] **Step 3: 检查批次质量**

Run: `for f in src/content/posts/{the-seeds-of-happiness-notes,thinking-fast-and-slow-notes}.md; do awk 'BEGIN{body=0} /^---$/{if(body==0){body=1;next}else if(body==1){body=2;next}} body==2{print}' "$f" | wc -m; done`

Expected: 两篇均在目标篇幅附近，摘要与文章重心一致。

### Task 6: 全量审校、构建与发布

**Files:**
- Verify: `src/content/posts/*.md`
- Verify: `src/content/books/*.md`

**Interfaces:**
- Consumes: 前五个任务完成的 10 篇文章。
- Produces: 通过构建并推送的聚焦内容提交。

- [ ] **Step 1: 核对修改范围和保护文件**

Run: `git status --short && git diff --name-only && git diff --exit-code HEAD -- src/content/posts/russell-happiness-and-freedom.md src/content/posts/draft-example.md src/content/books`

Expected: 内容修改只包含 10 篇目标文章，保护文件没有差异；另有本实施计划文档。

- [ ] **Step 2: 扫描语言与排版问题**

Run: `rg -n '—|–|不是.{0,20}而是|不仅.{0,20}还|真正的|值得注意的是|归根结底|让我们|总而言之|首先|其次|最后' src/content/posts/{authentic-happiness-notes,conquest-of-happiness-notes,flourish-notes,flourishing-life-notes,flow-notes,happier-notes,stumbling-on-happiness-notes,the-happiness-hypothesis-notes,the-seeds-of-happiness-notes,thinking-fast-and-slow-notes}.md`

Expected: 无匹配，或每处匹配都经过人工判断且不构成模板化表达。

- [ ] **Step 3: 运行全量构建**

Run: `npm run build`

Expected: Astro 内容校验、静态页面生成和 Pagefind 索引全部成功，命令退出码为 0。

- [ ] **Step 4: 只暂存并提交目标文件与实施计划**

Run: `git add docs/superpowers/plans/2026-07-24-rewrite-published-posts.md src/content/posts/authentic-happiness-notes.md src/content/posts/conquest-of-happiness-notes.md src/content/posts/flourish-notes.md src/content/posts/flourishing-life-notes.md src/content/posts/flow-notes.md src/content/posts/happier-notes.md src/content/posts/stumbling-on-happiness-notes.md src/content/posts/the-happiness-hypothesis-notes.md src/content/posts/the-seeds-of-happiness-notes.md src/content/posts/thinking-fast-and-slow-notes.md && git commit -m "post: 重写十篇幸福主题读书笔记"`

Expected: 一个只包含实施计划和 10 篇目标文章的提交。

- [ ] **Step 5: 推送部署**

Run: `git push`

Expected: 当前 `main` 推送到 `origin/main`，Cloudflare Pages 部署被触发。
