import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/test/',
          '/__tests__/',
          '/_next/static/chunks/',
          '/_next/static/css/',
          '/_next/static/js/',
          '/_next/static/media/',
          '/_next/static/webpack/',
          '/_next/static/development/',
          '/_next/static/production/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/logo.png', '/home.png', '/manifest.json'],
        disallow: [
          '/api/',
          '/test/',
          '/__tests__/',
          '/_next/static/chunks/',
          '/_next/static/css/',
          '/_next/static/js/',
          '/_next/static/media/',
          '/_next/static/webpack/',
          '/_next/static/development/',
          '/_next/static/production/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', '/logo.png', '/home.png', '/manifest.json'],
        disallow: [
          '/api/',
          '/test/',
          '/__tests__/',
          '/_next/static/chunks/',
          '/_next/static/css/',
          '/_next/static/js/',
          '/_next/static/media/',
          '/_next/static/webpack/',
          '/_next/static/development/',
          '/_next/static/production/',
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.BASE_URL}/sitemap.xml`,
    host: SITE_CONFIG.BASE_URL,
  };
}
