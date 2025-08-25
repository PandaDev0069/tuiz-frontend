'use client';

import React from 'react';

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
          name: 'TUIZ情報王',
          alternateName: 'TUIZ',
          description: 'リアルタイムでクイズを作成・参加できる革新的な学習プラットフォーム',
          url: 'https://tuiz-frontend.vercel.app',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://tuiz-frontend.vercel.app/search?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
          publisher: {
            '@type': 'Organization',
            name: 'TUIZ Team',
            url: 'https://tuiz-frontend.vercel.app',
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
          url: 'https://tuiz-frontend.vercel.app',
          logo: {
            '@type': 'ImageObject',
            url: 'https://tuiz-frontend.vercel.app/logo.png',
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
          description: 'リアルタイムでクイズを作成・参加できる革新的な学習プラットフォーム',
          url: 'https://tuiz-frontend.vercel.app',
          downloadUrl: 'https://tuiz-frontend.vercel.app',
          installUrl: 'https://tuiz-frontend.vercel.app',
          screenshot: {
            '@type': 'ImageObject',
            url: 'https://tuiz-frontend.vercel.app/logo.png',
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
