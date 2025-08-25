import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/test/', '/__tests__/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/test/', '/__tests__/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/test/', '/__tests__/'],
      },
    ],
    sitemap: `${SITE_CONFIG.BASE_URL}/sitemap.xml`,
    host: SITE_CONFIG.BASE_URL,
  };
}
