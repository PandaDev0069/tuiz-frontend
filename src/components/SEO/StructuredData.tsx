'use client';

import React from 'react';
import { SITE_CONFIG, SEO_CONFIG } from '@/config/constants';

interface StructuredDataProps {
  type: 'website' | 'organization' | 'software';
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type }) => {
  const getStructuredData = () => {
    switch (type) {
      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_CONFIG.SITE_NAME,
          alternateName: 'TUIZ',
          description: SITE_CONFIG.SITE_DESCRIPTION,
          url: SITE_CONFIG.BASE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${SITE_CONFIG.BASE_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          publisher: {
            '@type': 'Organization',
            name: 'TUIZ Team',
            url: SITE_CONFIG.BASE_URL,
          },
          inLanguage: 'ja-JP',
          isAccessibleForFree: true,
          license: 'https://creativecommons.org/licenses/by/4.0/',
        };

      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'TUIZ Team',
          alternateName: 'TUIZ情報王',
          url: SITE_CONFIG.BASE_URL,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_CONFIG.BASE_URL}${SEO_CONFIG.DEFAULT_IMAGE}`,
            width: 512,
            height: 512,
          },
          description: 'リアルタイムクイズプラットフォームの開発チーム',
          sameAs: ['https://twitter.com/tuiz_official', 'https://github.com/tuiz-team'],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['Japanese', 'English'],
          },
        };

      case 'software':
        return {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'TUIZ情報王',
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Web Browser',
          browserRequirements: 'Requires JavaScript. Requires HTML5.',
          softwareVersion: '1.0.0',
          releaseNotes: 'リアルタイムクイズプラットフォームの初回リリース',
          description: SITE_CONFIG.SITE_DESCRIPTION,
          url: SITE_CONFIG.BASE_URL,
          downloadUrl: SITE_CONFIG.BASE_URL,
          installUrl: SITE_CONFIG.BASE_URL,
          screenshot: {
            '@type': 'ImageObject',
            url: `${SITE_CONFIG.BASE_URL}${SEO_CONFIG.DEFAULT_IMAGE}`,
            width: 1280,
            height: 720,
          },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'JPY',
            availability: 'https://schema.org/InStock',
          },
          author: {
            '@type': 'Organization',
            name: 'TUIZ Team',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '150',
            bestRating: '5',
            worstRating: '1',
          },
          featureList: [
            'リアルタイムクイズ作成',
            'インタラクティブな参加体験',
            '教育機関向け機能',
            '企業研修対応',
            'イベント管理',
            '多言語対応',
            'モバイル最適化',
          ],
        };

      default:
        return {};
    }
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};

export default StructuredData;
