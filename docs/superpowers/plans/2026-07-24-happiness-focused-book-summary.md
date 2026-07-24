# Happiness-Focused Book Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the project skill summarize books through happiness and closely related themes instead of producing a general chapter-by-chapter digest.

**Architecture:** Keep trigger and routing guidance in `.agents/skills/write-article/SKILL.md`. Put the detailed selection framework, writing requirements, attribution boundaries, and delivery checklist in `.agents/skills/write-article/references/book-summary.md`, which the main skill already loads only for book requests.

**Tech Stack:** Markdown skill instructions, YAML frontmatter, Codex skill validation script, shell assertions.

## Global Constraints

- Include direct discussions of happiness and closely related themes: meaning, relationships, emotions, freedom and autonomy, work and engagement, health, and daily practice.
- Select only themes the book supports; do not force every book into every theme.
- Distinguish the author's claims and evidence from the site's happiness-oriented analysis.
- Preserve existing content paths, frontmatter, cover acquisition, build, commit, and publishing rules.
- Do not modify site content, schemas, pages, components, or non-book writing modes.

---

### Task 1: Add the happiness-oriented book workflow

**Files:**
- Modify: `.agents/skills/write-article/SKILL.md`
- Modify: `.agents/skills/write-article/references/book-summary.md`

**Interfaces:**
- Consumes: A user request containing a book title, routed by the mode table in `SKILL.md`.
- Produces: Instructions for a book-list entry and reading note with a supported, explicit happiness theme.

- [x] **Step 1: Run static assertions against the current skill**

Run:

```bash
rg -n "幸福视角|意义感|本站视角|交付前检查" \
  .agents/skills/write-article/SKILL.md \
  .agents/skills/write-article/references/book-summary.md
```

Expected: no complete happiness-oriented workflow is found; the command exits with status 1 or returns only incidental mentions.

- [x] **Step 2: Update the mode routing description**

Change the book row and surrounding book-mode guidance in `.agents/skills/write-article/SKILL.md` so another Codex instance understands that a book request produces a book-list entry and a reading note focused on happiness and related themes. Keep details in the reference file.

- [x] **Step 3: Add selection and attribution rules**

In `.agents/skills/write-article/references/book-summary.md`, add a section after fact verification that instructs the writer to:

```markdown
1. Identify only the themes the book actually discusses.
2. Prioritize happiness, meaning, relationships, emotions, autonomy, work and engagement, health, and daily practice.
3. Separate the author's claims and supporting material from the site's happiness-oriented interpretation.
4. Avoid forcing every theme onto every book or inventing links the source cannot support.
```

- [x] **Step 4: Focus both output formats on happiness**

Update the book-list guidance so `oneLiner` and the recommendation state which aspect of a good life the book helps readers understand. Update the reading-note structure so the opening answers why the book matters to happiness, the overview stays brief, each key point contains the claim, support, and happiness connection, and practical advice includes scenarios and limits.

- [x] **Step 5: Add a delivery checklist**

Add an explicit checklist before cover acquisition that verifies a shared happiness through-line, selective rather than chapter-by-chapter coverage, author/site attribution, factual integrity, concrete practices, and applicable limits.

- [x] **Step 6: Run static assertions against the revised skill**

Run:

```bash
rg -n "幸福视角|意义感|关系|情绪|自由|自主|工作|投入|健康|本站视角|交付前检查" \
  .agents/skills/write-article/SKILL.md \
  .agents/skills/write-article/references/book-summary.md
```

Expected: matches appear in the mode routing, theme framework, attribution rule, output instructions, and delivery checklist.

### Task 2: Validate and commit the skill update

**Files:**
- Test: `.agents/skills/write-article/SKILL.md`
- Test: `.agents/skills/write-article/references/book-summary.md`

**Interfaces:**
- Consumes: The revised `write-article` skill folder.
- Produces: A structurally valid skill with a clean, scoped diff.

- [x] **Step 1: Validate the skill folder**

Run:

```bash
python3 /Users/ruimin/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .agents/skills/write-article
```

Expected: `Skill is valid!`

- [x] **Step 2: Check formatting and scope**

Run:

```bash
git diff --check
git diff -- .agents/skills/write-article/SKILL.md \
  .agents/skills/write-article/references/book-summary.md
```

Expected: `git diff --check` prints nothing; the diff changes only the book-mode trigger and book-summary reference.

- [x] **Step 3: Commit the implementation**

Run:

```bash
git add .agents/skills/write-article/SKILL.md \
  .agents/skills/write-article/references/book-summary.md \
  docs/superpowers/plans/2026-07-24-happiness-focused-book-summary.md
git commit -m "refactor(skill): 聚焦书籍中的幸福主题"
```

Expected: one commit containing the implementation plan and the two revised skill files.
