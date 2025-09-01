import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/test/', '/__tests__/', '/_next/static/development/'],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/logo.png',
          '/home.png',
          '/manifest.json',
          '/_next/static/chunks/',
          '/_next/static/css/',
          '/_next/static/js/',
          '/_next/static/media/',
          '/_next/static/webpack/',
          '/_next/static/production/',
        ],
        disallow: ['/api/', '/test/', '/__tests__/', '/_next/static/development/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/',
          '/logo.png',
          '/home.png',
          '/manifest.json',
          '/_next/static/chunks/',
          '/_next/static/css/',
          '/_next/static/js/',
          '/_next/static/media/',
          '/_next/static/webpack/',
          '/_next/static/production/',
        ],
        disallow: ['/api/', '/test/', '/__tests__/', '/_next/static/development/'],
      },
      {
        userAgent: 'Googlebot-Mobile',
        allow: [
          '/',
          '/logo.png',
          '/home.png',
          '/manifest.json',
          '/_next/static/chunks/',
          '/_next/static/css/',
          '/_next/static/js/',
          '/_next/static/media/',
          '/_next/static/webpack/',
          '/_next/static/production/',
        ],
        disallow: ['/api/', '/test/', '/__tests__/', '/_next/static/development/'],
      },
      {
        userAgent: 'Googlebot-News',
        allow: [
          '/',
          '/logo.png',
          '/home.png',
          '/manifest.json',
          '/_next/static/chunks/',
          '/_next/static/css/',
          '/_next/static/js/',
          '/_next/static/media/',
          '/_next/static/webpack/',
          '/_next/static/production/',
        ],
        disallow: ['/api/', '/test/', '/__tests__/', '/_next/static/development/'],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/logo.png',
          '/home.png',
          '/manifest.json',
          '/_next/static/chunks/',
          '/_next/static/css/',
          '/_next/static/js/',
          '/_next/static/media/',
          '/_next/static/webpack/',
          '/_next/static/production/',
        ],
        disallow: ['/api/', '/test/', '/__tests__/', '/_next/static/development/'],
      },
    ],
    sitemap: `${SITE_CONFIG.BASE_URL}/sitemap.xml`,
  };
}
