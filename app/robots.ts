import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/c3h', '/payments', '/api/'] },
    sitemap: 'https://challengerscc.ca/sitemap.xml',
  };
}
