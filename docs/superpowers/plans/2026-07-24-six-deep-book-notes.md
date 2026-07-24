# Six Deep Book Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish six distinct 2500–3500 Chinese-character deep reading notes for the books added on 2026-07-24, with accurate theory, practical guidance, caveats, and reciprocal book-list links.

**Architecture:** Each post is a standalone Markdown entry using the existing Astro `posts` schema. Its corresponding `books` entry gains a short body paragraph linking to the post; every post links back to `/books/`. Author, publisher, university, and original research sources establish the factual boundary, while the prose remains an original Chinese synthesis.

**Tech Stack:** Astro 5 content collections, Markdown, YAML frontmatter, Pagefind, npm.

## Global Constraints

- Each article body contains 2500–3500 Chinese characters, excluding frontmatter.
- Use full-width Chinese punctuation, spaces between Chinese and English or numbers, and `「」` for emphasized terms.
- Every article includes theory, distinctions, practical suggestions, applicability, and limitations.
- Every post uses existing tags including `读书笔记` and `心理学`.
- Do not fabricate quotations, page numbers, chapters, study findings, or unsupported advice.
- Use `2026-07-24` as `pubDate`.
- Only stage the six new posts and six modified book entries for the content commit.

---

### Task 1: Verify Sources And Conventions

**Files:**
- Read: `docs/superpowers/specs/2026-07-24-six-deep-book-notes-design.md`
- Read: `src/content/posts/authentic-happiness-notes.md`
- Read: `src/content/posts/flow-notes.md`
- Read: the six matching files under `src/content/books/`

**Interfaces:**
- Consumes: The approved design and existing editorial patterns.
- Produces: Verified author identities, theses, named theories, evidence types, limitations, and supported practices for all six drafts.

- [ ] **Step 1: Gather authoritative references**

Verify Haidt's elephant/rider metaphor and social intuitionism; Peng Kaiping's positive psychology framework; Seligman's PERMA model; Kahneman and Tversky's heuristics and prospect theory; Gilbert and Wilson's affective forecasting; and the scope of Peng Kaiping's introductory psychology text. Prefer author, publisher, university, original-paper, and scholarly review sources.

- [ ] **Step 2: Fix the factual boundaries**

Keep these distinctions explicit: metaphors are not anatomical brain systems; PERMA is a well-being framework rather than a diagnostic score; System 1 and System 2 are explanatory labels; replication disputes do not erase all judgment research; affective forecasting errors coexist with resilience; psychological literacy does not replace treatment or structural reform.

- [ ] **Step 3: Confirm a clean starting point**

Run: `git status --short`

Expected: only this plan file is untracked before the plan is committed.

### Task 2: Write The Happiness Hypothesis Note

**Files:**
- Create: `src/content/posts/the-happiness-hypothesis-notes.md`
- Modify: `src/content/books/the-happiness-hypothesis.md`

**Interfaces:**
- Consumes: Verified Haidt concepts from Task 1.
- Produces: `/posts/the-happiness-hypothesis-notes/` plus a reciprocal book link.

- [ ] **Step 1: Use exact metadata**

```yaml
---
title: 读《象与骑象人》：理性怎样与直觉共同生活
pubDate: 2026-07-24
summary: 海特借“象与骑象人”解释分裂的心智，并从关系、互惠与超越中寻找幸福。
tags: [读书笔记, 心理学]
---
```

- [ ] **Step 2: Write a distinct argument**

Cover the divided mind; why the rider cannot command the elephant; reciprocity, relationships, work, and transcendence; reason as guidance rather than dictator; common misreadings; concrete practices; and suitable readers. End with `[书单页的《象与骑象人》条目](/books/)`.

- [ ] **Step 3: Add and verify links**

Append a paragraph to the book entry ending with `[读书笔记](/posts/the-happiness-hypothesis-notes/)`. Count the post body with the shared command in Task 8 and confirm 2500–3500 characters.

### Task 3: Write Flourishing Life Note

**Files:**
- Create: `src/content/posts/flourishing-life-notes.md`
- Modify: `src/content/books/flourishing-life.md`

**Interfaces:**
- Consumes: Verified Peng Kaiping concepts from Task 1.
- Produces: `/posts/flourishing-life-notes/` plus a reciprocal book link.

- [ ] **Step 1: Use exact metadata**

```yaml
---
title: 读《活出心花怒放的人生》：让积极心理学回到真实生活
pubDate: 2026-07-24
summary: 从积极体验、优势、关系、意义与韧性出发，理解中国生活情境中的幸福实践。
tags: [读书笔记, 心理学, 生活方式]
---
```

- [ ] **Step 2: Write a distinct argument**

Cover why positive psychology is not forced optimism; positive emotions and attention; strengths and agency; relationships and prosocial behavior; meaning and resilience; work, family, and parenting; structural constraints; practical experiments; and suitable readers.

- [ ] **Step 3: Add and verify links**

End the post with `[书单页的《活出心花怒放的人生》条目](/books/)`. Append a book paragraph ending with `[读书笔记](/posts/flourishing-life-notes/)`. Confirm 2500–3500 body characters.

### Task 4: Write Flourish Note

**Files:**
- Create: `src/content/posts/flourish-notes.md`
- Modify: `src/content/books/flourish.md`

**Interfaces:**
- Consumes: Verified PERMA context from Task 1.
- Produces: `/posts/flourish-notes/` plus a reciprocal book link.

- [ ] **Step 1: Use exact metadata**

```yaml
---
title: 读《持续的幸福》：从快乐走向蓬勃人生
pubDate: 2026-07-24
summary: 塞利格曼以 PERMA 扩展幸福理论，讨论积极情绪、投入、关系、意义与成就。
tags: [读书笔记, 心理学, 生活方式]
---
```

- [ ] **Step 2: Write a distinct argument**

Cover the move from authentic happiness to well-being; each PERMA element; strengths and supported exercises; why no element is sufficient alone; measurement and causal limits; misuse as a productivity scorecard; practical weekly observation; and suitable readers.

- [ ] **Step 3: Add and verify links**

End the post with `[书单页的《持续的幸福》条目](/books/)`. Append a book paragraph ending with `[读书笔记](/posts/flourish-notes/)`. Confirm 2500–3500 body characters.

### Task 5: Write Thinking, Fast And Slow Note

**Files:**
- Create: `src/content/posts/thinking-fast-and-slow-notes.md`
- Modify: `src/content/books/thinking-fast-and-slow.md`

**Interfaces:**
- Consumes: Verified judgment and decision research from Task 1.
- Produces: `/posts/thinking-fast-and-slow-notes/` plus a reciprocal book link.

- [ ] **Step 1: Use exact metadata**

```yaml
---
title: 读《思考，快与慢》：看见判断背后的两种速度
pubDate: 2026-07-24
summary: 从系统 1、系统 2、启发式与前景理论出发，理解选择为何偏离理性预期。
tags: [读书笔记, 心理学]
---
```

- [ ] **Step 2: Write a distinct argument**

Cover the two-system vocabulary; heuristics and substitution; anchoring, availability, and representativeness; loss aversion and prospect theory; remembering versus experiencing selves; replication and overgeneralization cautions; decision hygiene; and suitable readers.

- [ ] **Step 3: Add and verify links**

End the post with `[书单页的《思考，快与慢》条目](/books/)`. Append a book paragraph ending with `[读书笔记](/posts/thinking-fast-and-slow-notes/)`. Confirm 2500–3500 body characters.

### Task 6: Write Stumbling On Happiness Note

**Files:**
- Create: `src/content/posts/stumbling-on-happiness-notes.md`
- Modify: `src/content/books/stumbling-on-happiness.md`

**Interfaces:**
- Consumes: Verified affective forecasting research from Task 1.
- Produces: `/posts/stumbling-on-happiness-notes/` plus a reciprocal book link.

- [ ] **Step 1: Use exact metadata**

```yaml
---
title: 读《哈佛幸福课》：为什么我们总会预测错未来的感受
pubDate: 2026-07-24
summary: 吉尔伯特从想象、记忆与情感预测出发，解释人为何误判未来幸福。
tags: [读书笔记, 心理学]
---
```

- [ ] **Step 2: Write a distinct argument**

Cover how imagination fills gaps; presentism; focalism and impact bias; psychological immune neglect; reconstructive memory; why other people's experience can outperform private imagination; practical pre-mortems and reversible decisions; limits; and suitable readers.

- [ ] **Step 3: Add and verify links**

End the post with `[书单页的《哈佛幸福课》条目](/books/)`. Append a book paragraph ending with `[读书笔记](/posts/stumbling-on-happiness-notes/)`. Confirm 2500–3500 body characters.

### Task 7: Write The Seeds Of Happiness Note

**Files:**
- Create: `src/content/posts/the-seeds-of-happiness-notes.md`
- Modify: `src/content/books/the-seeds-of-happiness.md`

**Interfaces:**
- Consumes: Verified scope of Peng Kaiping's introductory psychology text from Task 1.
- Produces: `/posts/the-seeds-of-happiness-notes/` plus a reciprocal book link.

- [ ] **Step 1: Use exact metadata**

```yaml
---
title: 读《幸福的种子》：用心理学重新认识自己
pubDate: 2026-07-24
summary: 从感知、记忆、情绪、关系与文化出发，建立一张通往幸福实践的心理学地图。
tags: [读书笔记, 心理学]
---
```

- [ ] **Step 2: Write a distinct argument**

Cover why psychological literacy matters; perception and constructed experience; memory and identity; emotion as information; relationships and culture; positive psychology practices; the difference between knowledge and self-diagnosis; observation exercises; and suitable readers.

- [ ] **Step 3: Add and verify links**

End the post with `[书单页的《幸福的种子》条目](/books/)`. Append a book paragraph ending with `[读书笔记](/posts/the-seeds-of-happiness-notes/)`. Confirm 2500–3500 body characters.

### Task 8: Cross-Article Review And Publish

**Files:**
- Review: all six new posts.
- Review: all six modified book entries.

**Interfaces:**
- Consumes: Six completed article/book pairs.
- Produces: A schema-valid, indexed, committed, and pushed content release.

- [ ] **Step 1: Check metadata, length, and reciprocal links**

Run:

```bash
for file in src/content/posts/{the-happiness-hypothesis,flourishing-life,flourish,thinking-fast-and-slow,stumbling-on-happiness,the-seeds-of-happiness}-notes.md; do
  printf '%s: ' "$file"
  awk 'BEGIN{fm=0} /^---$/{fm++;next} fm>=2{print}' "$file" | wc -m
  rg '^title:|^summary:|^tags:|/books/' "$file"
done
rg '/posts/.*-notes/' src/content/books/{the-happiness-hypothesis,flourishing-life,flourish,thinking-fast-and-slow,stumbling-on-happiness,the-seeds-of-happiness}.md
```

Expected: each body is 2500–3500 characters, metadata is present, and each post links to `/books/`. Search the six book files for `/posts/.*-notes/` and expect six matches.

- [ ] **Step 2: Review prose quality**

Search for mixed straight quotation marks, unsupported page-number claims, repetitive generic openings, and claims that metaphors or frameworks are literal mechanisms. Revise sentences that blur author claims, research evidence, or this site's interpretation.

- [ ] **Step 3: Build the complete site**

Run: `npm run build`

Expected: Astro content sync succeeds, all static routes build, images optimize, and Pagefind exits with code 0.

- [ ] **Step 4: Inspect the final diff**

Run: `git diff --check && git status --short && git diff --stat`

Expected: no whitespace errors; only six new post files and six modified book files are present.

- [ ] **Step 5: Commit and push**

```bash
git add src/content/posts/the-happiness-hypothesis-notes.md src/content/posts/flourishing-life-notes.md src/content/posts/flourish-notes.md src/content/posts/thinking-fast-and-slow-notes.md src/content/posts/stumbling-on-happiness-notes.md src/content/posts/the-seeds-of-happiness-notes.md src/content/books/the-happiness-hypothesis.md src/content/books/flourishing-life.md src/content/books/flourish.md src/content/books/thinking-fast-and-slow.md src/content/books/stumbling-on-happiness.md src/content/books/the-seeds-of-happiness.md
git commit -m 'post: 新增六篇幸福主题深度读书笔记'
git push
```

Expected: commit succeeds and the current branch pushes to its configured remote.
