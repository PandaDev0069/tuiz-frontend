import { MetadataRoute } from 'next';

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
    sitemap: 'https://tuiz-frontend.vercel.app/sitemap.xml',
    host: 'https://tuiz-frontend.vercel.app',
  };
}
