# 幸福视角书籍总结

适用于：用户给一个书名。产出**两个文件互相链接**：

1. `src/content/books/<slug>.md` —— 书单条目，正文是简短推荐语，展示在书单 grid 页
2. `src/content/posts/<slug>-notes.md` —— 详细读书笔记，展示在文章列表页

外加一张封面图：`src/content/books/covers/<slug>.<ext>`（从 epub 内或互联网获取，见第五步，**不要自己生成**）。

## 第一步：核实书籍信息

写之前先确认书的基本事实，拿不准就 WebSearch：

- 作者全名及通行中译名、中译本书名（没有中译本就用原名并说明）
- 这本书的核心论点是什么——**只总结你确切了解的内容，不熟悉的书宁可告诉用户"这本书我了解有限，总结可能不准"，也不要编造章节和引文**
- 不虚构具体引文和页码；转述观点用自己的话

## 第二步：建立幸福视角

本站需要的是与幸福生活有关的定向梳理，不是平均复述章节的全书摘要。写之前先检查书中实际涉及哪些主题：

- 幸福、满足与痛苦
- 意义感、价值与人生方向
- 关系、爱、归属与社会连接
- 情绪、心理韧性与自我接纳
- 自由、自主与选择
- 工作、投入、成长与成就
- 身体健康、休息与生活节奏
- 能落实到日常生活的做法

只选择书中确实涉及且有可靠依据的主题，不必覆盖完整清单，也不要为了贴合本站而硬造联系。每个入选主题都要能回答三个问题：

1. 作者的主张是什么？
2. 作者用什么研究、论证、案例或经验支持它？
3. 它如何影响幸福、生活质量或对美好生活的理解？

书中直接讨论幸福时，按作者原意概括。书中只讨论相关主题时，可以从本站视角分析它与幸福的联系，但必须明确这是关联分析，不能把本站的推论写成作者结论。

## 第三步：书单条目（books 集合）

frontmatter 模板（所有字段对照 `src/content.config.ts`，`cover` 和 `oneLiner` 必填）：

```yaml
---
title: 中译本书名（不带书名号）
author: 作者通行中译名
pubDate: 2026-06-11              # 当天日期
cover: ./covers/<slug>.jpg      # 扩展名按实际封面文件而定（见第五步），jpg/png/webp/svg 都行
oneLiner: 一句话说清本书能帮助读者理解或改善幸福生活的哪个方面。
category: 心理学                  # 决定书单页分组，先看现有条目用过哪些分类
tags: [心理学]
purchaseLinks:
  - platform: 京东
    url: https://search.jd.com/Search?keyword=<书名URL编码>
  - platform: 当当
    url: https://search.dangdang.com/?key=<书名URL编码>
---
```

购买链接说明：默认填搜索页链接（保证可用）；用户之后会自行替换成联盟佣金链接，不要为此阻塞。

正文 2-4 句：这本书是什么，它从哪个角度帮助读者理解幸福或改善生活，为什么值得读。最后一句链接到读书笔记：

```markdown
「<书名>」……（推荐语）。详细的内容梳理见[读书笔记](/posts/<slug>-notes/)。
```

## 第四步：读书笔记（posts 集合）

frontmatter 按 `formatting.md` 的 posts 模板，`tags` 与书单条目保持一致。标题和 `summary` 要体现本书与幸福生活的具体联系，不能只写「某书内容梳理」。正文结构（小标题可按书的特点调整措辞，不必逐字照搬）：

```markdown
开头 2-3 句：先回答这本书与幸福生活有什么关系，再说明作者是谁、凭什么谈这个话题。

## 这本书在讲什么
用 1-2 段交代全书主旨和必要背景，为后面的幸福主题梳理建立上下文，不按章节逐一复述。

## 与幸福有关的核心观点
选择 3-5 个最重要的要点。每个要点说清「作者主张 + 书中依据 + 与幸福生活的联系」；联系来自本站分析时明确标出。

## 怎么用在生活里
只提炼书中能够支持的建议，写清适用场景、具体行动与限制条件。不要把自己的常识扩写成作者没有提出的处方。

## 适合谁读与阅读边界
说明哪些读者会从本书受益、哪类读者可能不需要，并提示必要边界，如研究年代、相关不等于因果、个人处境差异，或心理与医疗问题需要专业支持。

文末链接回书单：想了解购买渠道，见[书单页的条目](/books/<slug>/)。
```

## 交付前检查

- `oneLiner`、推荐语、标题、`summary` 和正文是否共享一条清楚的幸福主题主线？
- 是否把主要篇幅留给幸福及相关主题，而非平均复述所有章节？
- 每个重点是否都交代作者主张、书中依据和它与幸福生活的联系？
- 是否明确区分作者结论与本站视角的关联分析？
- 是否避免虚构章节、引文、页码、研究结论和实践建议？
- 实践建议是否具体，并写明适用场景或限制？

任一项不满足时先修改正文，不要进入构建和发布步骤。

## 第五步：获取封面（不要自己生成）

封面图保存到 `src/content/books/covers/<slug>.<ext>`，frontmatter 写 `cover: ./covers/<slug>.<ext>`。Astro 的 `image()` 会校验它是不是有效图片（jpg/png/webp/svg 等都行），build 时一并处理。

**铁律：不要手绘、不要用 SVG `<text>` 拼一张封面、不要让模型生成图片。** 封面只有两个来源——epub 包内、或互联网——按下面选。

### A. 用户提供了 epub —— 从 epub 包内取

epub 本质是 zip，封面图就在包里。下面的脚本按 OPF 声明定位封面，定位不到就回退到包内最大的图片，并打印实际写出的文件路径：

```bash
SLUG=conquest-of-happiness          # 改成本书 slug
EPUB=/path/to/book.epub             # 改成 epub 实际路径
python3 - "$EPUB" "src/content/books/covers/$SLUG" <<'PY'
import sys, zipfile, os, re
epub, dst_noext = sys.argv[1], sys.argv[2]
z = zipfile.ZipFile(epub); names = z.namelist()
def opf_path():
    try:
        c = z.read('META-INF/container.xml').decode('utf-8','ignore')
        m = re.search(r'full-path="([^"]+\.opf)"', c)
        if m: return m.group(1)
    except KeyError: pass
    return next((n for n in names if n.lower().endswith('.opf')), None)
href, opf = None, opf_path()
if opf:
    data = z.read(opf).decode('utf-8','ignore'); base = os.path.dirname(opf)
    m = re.search(r'<meta[^>]*name=["\']cover["\'][^>]*content=["\']([^"\']+)["\']', data) \
        or re.search(r'<meta[^>]*content=["\']([^"\']+)["\'][^>]*name=["\']cover["\']', data)
    if m:
        cid = re.escape(m.group(1))
        hm = re.search(r'<item[^>]*id=["\']'+cid+r'["\'][^>]*href=["\']([^"\']+)["\']', data) \
          or re.search(r'<item[^>]*href=["\']([^"\']+)["\'][^>]*id=["\']'+cid+r'["\']', data)
        if hm: href = hm.group(1)
    if not href:
        hm = re.search(r'<item[^>]*properties=["\']cover-image["\'][^>]*href=["\']([^"\']+)["\']', data) \
          or re.search(r'<item[^>]*href=["\']([^"\']+)["\'][^>]*properties=["\']cover-image["\']', data)
        if hm: href = hm.group(1)
    if href: href = os.path.normpath(os.path.join(base, href)).replace('\\','/')
if not href or href not in names:        # 回退：包内最大的图片
    imgs = [n for n in names if re.search(r'\.(jpe?g|png|webp|gif)$', n, re.I)]
    href = max(imgs, key=lambda n: z.getinfo(n).file_size) if imgs else None
if not href: sys.exit('未在 epub 中找到封面图')
ext = '.jpg' if os.path.splitext(href)[1].lower() in ('.jpeg','.jpg') else os.path.splitext(href)[1].lower()
out = dst_noext + (ext or '.jpg')
open(out,'wb').write(z.read(href)); print('封面已写出:', out)
PY
```

把 frontmatter 的 `cover` 改成脚本打印出的扩展名。脚本报「未找到封面图」时，按 B 从互联网取。

### B. 没有 epub —— 从互联网取

优先用 Open Library 封面 API（免费、可直链、按 ISBN 取，最省事）：

1. 查到本书 ISBN（`WebSearch` 搜「书名 作者 ISBN」，英文原版 ISBN 在库里命中率更高）
2. 下大图，`--fail` 让取不到时报错而非把错误页存成文件：

```bash
curl -L --fail -sS -o "src/content/books/covers/$SLUG.jpg" \
  "https://covers.openlibrary.org/b/isbn/<ISBN>-L.jpg?default=false"
```

3. Open Library 没有时，`WebSearch` 找一张清晰的封面直链（出版社页、电商商品大图等），同样 `curl -L --fail -sS -o` 存下。豆瓣图片需 Referer 容易 403，优先换别的来源
4. 存完核对：`file "src/content/books/covers/$SLUG.jpg"` 应识别为图片，且不是 0 字节；扩展名要和真实格式一致（png 就存 `.png`）

epub 里没有、互联网也找不到合适封面时，向用户索取封面图或图片链接，**仍然不要回退到自绘 SVG**。
