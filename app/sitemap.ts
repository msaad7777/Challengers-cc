import type { MetadataRoute } from 'next';
import { blogPosts } from './blog/data';
import { getAllPartnerSlugs } from './partners/data';

const BASE = 'https://www.challengerscc.ca';

// Public pages only. /c3h (members), /payments and /api stay out; robots.ts
// disallows them too.
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/join', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/looking-for-sponsors', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/sponsorship', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/schedule', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/watch', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/events', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/mental-game', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/legal', priority: 0.3, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map(({ path, priority, changeFrequency }) => ({
      url: `${BASE}${path}`,
      changeFrequency,
      priority,
    })),
    ...blogPosts.map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
    ...getAllPartnerSlugs().map((slug) => ({
      url: `${BASE}/partners/${slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    })),
  ];
}
