import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      pubDate: z.coerce.date(),
      summary: z.string(),
      tags: z.array(z.string()).min(1),
      cover: image().optional(),
      interviewee: z.string().optional(),
      intervieweeBio: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.string(),
      pubDate: z.coerce.date(),
      cover: image(),
      oneLiner: z.string(),
      tags: z.array(z.string()).min(1),
      purchaseLinks: z
        .array(z.object({ platform: z.string(), url: z.string().url() }))
        .default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts, books };
