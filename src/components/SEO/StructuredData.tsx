// ====================================================
// File Name   : StructuredData.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-25
// Last Update : 2025-08-30
//
// Description:
// - Structured data component for JSON-LD schema markup
// - Generates schema.org structured data for SEO
// - Supports website, organization, software, and quiz types
// - Provides rich snippets for search engines
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses JSON-LD format for structured data
// - Injects script tag with application/ld+json type
// ====================================================

'use client';

import React from 'react';
import { SITE_CONFIG, SEO_CONFIG } from '@/config/constants';

const SCHEMA_CONTEXT = 'https://schema.org';

const SCHEMA_TYPE_WEBSITE = 'WebSite';
const SCHEMA_TYPE_ORGANIZATION = 'Organization';
const SCHEMA_TYPE_SOFTWARE_APPLICATION = 'SoftwareApplication';
const SCHEMA_TYPE_QUIZ = 'Quiz';
const SCHEMA_TYPE_SEARCH_ACTION = 'SearchAction';
const SCHEMA_TYPE_ENTRY_POINT = 'EntryPoint';
const SCHEMA_TYPE_IMAGE_OBJECT = 'ImageObject';
const SCHEMA_TYPE_CONTACT_POINT = 'ContactPoint';
const SCHEMA_TYPE_OFFER = 'Offer';
const SCHEMA_TYPE_AGGREGATE_RATING = 'AggregateRating';
const SCHEMA_TYPE_AUDIENCE = 'Audience';
const SCHEMA_TYPE_THING = 'Thing';

const SCRIPT_TYPE_JSON_LD = 'application/ld+json';

const SEARCH_URL_TEMPLATE = '/search?q={search_term_string}';
const QUERY_INPUT = 'required name=search_term_string';

const LOGO_WIDTH = 512;
const LOGO_HEIGHT = 512;
const SCREENSHOT_WIDTH = 1280;
const SCREENSHOT_HEIGHT = 720;

const PRICE_FREE = '0';
const PRICE_CURRENCY_JPY = 'JPY';
const AVAILABILITY_IN_STOCK = 'https://schema.org/InStock';

const LANGUAGE_JA_JP = 'ja-JP';
const CONTACT_TYPE_CUSTOMER_SERVICE = 'customer service';
const AVAILABLE_LANGUAGES = ['Japanese', 'English'];

const SOFTWARE_VERSION = '1.0.0';
const APPLICATION_CATEGORY = 'EducationalApplication';
const OPERATING_SYSTEM = 'Web Browser';
const BROWSER_REQUIREMENTS = 'Requires JavaScript. Requires HTML5.';

const RATING_VALUE = '4.8';
const RATING_COUNT = '150';
const BEST_RATING = '5';
const WORST_RATING = '1';

const EDUCATIONAL_LEVEL = 'All Levels';
const EDUCATIONAL_USE = 'Learning, Assessment, Training';
const LEARNING_RESOURCE_TYPE = 'Interactive Quiz';

const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

interface StructuredDataProps {
  type: 'website' | 'organization' | 'software' | 'quiz';
}

/**
 * Function: getStructuredData
 * Description:
 * - Generates structured data object based on type
 * - Returns schema.org compliant JSON-LD data
 * - Supports website, organization, software, and quiz types
 *
 * Parameters:
 * - type ('website' | 'organization' | 'software' | 'quiz'): Type of structured data to generate
 *
 * Returns:
 * - object: Structured data object for JSON-LD
 *
 * Example:
 * ```ts
 * const data = getStructuredData('website');
 * // Returns website structured data
 * ```
 */
const getStructuredData = (
  type: 'website' | 'organization' | 'software' | 'quiz',
): Record<string, unknown> => {
  switch (type) {
    case 'website':
      return {
        '@context': SCHEMA_CONTEXT,
        '@type': SCHEMA_TYPE_WEBSITE,
        name: SITE_CONFIG.SITE_NAME,
        alternateName: 'TUIZ',
        description: SITE_CONFIG.SITE_DESCRIPTION,
        url: SITE_CONFIG.BASE_URL,
        potentialAction: {
          '@type': SCHEMA_TYPE_SEARCH_ACTION,
          target: {
            '@type': SCHEMA_TYPE_ENTRY_POINT,
            urlTemplate: `${SITE_CONFIG.BASE_URL}${SEARCH_URL_TEMPLATE}`,
          },
          'query-input': QUERY_INPUT,
        },
        publisher: {
          '@type': SCHEMA_TYPE_ORGANIZATION,
          name: 'TUIZ Team',
          url: SITE_CONFIG.BASE_URL,
        },
        inLanguage: LANGUAGE_JA_JP,
        isAccessibleForFree: true,
        license: LICENSE_URL,
      };

    case 'organization':
      return {
        '@context': SCHEMA_CONTEXT,
        '@type': SCHEMA_TYPE_ORGANIZATION,
        name: 'PandaDev0069',
        alternateName: 'TUIZ情報王',
        url: SITE_CONFIG.BASE_URL,
        logo: {
          '@type': SCHEMA_TYPE_IMAGE_OBJECT,
          url: `${SITE_CONFIG.BASE_URL}${SEO_CONFIG.DEFAULT_IMAGE}`,
          width: LOGO_WIDTH,
          height: LOGO_HEIGHT,
        },
        description: 'リアルタイムクイズプラットフォームの開発チーム',
        sameAs: ['https://twitter.com/tuiz_official', 'https://github.com/tuiz-team'],
        contactPoint: {
          '@type': SCHEMA_TYPE_CONTACT_POINT,
          contactType: CONTACT_TYPE_CUSTOMER_SERVICE,
          availableLanguage: AVAILABLE_LANGUAGES,
        },
      };

    case 'software':
      return {
        '@context': SCHEMA_CONTEXT,
        '@type': SCHEMA_TYPE_SOFTWARE_APPLICATION,
        name: 'TUIZ情報王',
        applicationCategory: APPLICATION_CATEGORY,
        operatingSystem: OPERATING_SYSTEM,
        browserRequirements: BROWSER_REQUIREMENTS,
        softwareVersion: SOFTWARE_VERSION,
        releaseNotes: 'リアルタイムクイズプラットフォームの初回リリース',
        description: SITE_CONFIG.SITE_DESCRIPTION,
        url: SITE_CONFIG.BASE_URL,
        downloadUrl: SITE_CONFIG.BASE_URL,
        installUrl: SITE_CONFIG.BASE_URL,
        screenshot: {
          '@type': SCHEMA_TYPE_IMAGE_OBJECT,
          url: `${SITE_CONFIG.BASE_URL}${SEO_CONFIG.DEFAULT_IMAGE}`,
          width: SCREENSHOT_WIDTH,
          height: SCREENSHOT_HEIGHT,
        },
        offers: {
          '@type': SCHEMA_TYPE_OFFER,
          price: PRICE_FREE,
          priceCurrency: PRICE_CURRENCY_JPY,
          availability: AVAILABILITY_IN_STOCK,
        },
        author: {
          '@type': SCHEMA_TYPE_ORGANIZATION,
          name: 'TUIZ Team',
        },
        aggregateRating: {
          '@type': SCHEMA_TYPE_AGGREGATE_RATING,
          ratingValue: RATING_VALUE,
          ratingCount: RATING_COUNT,
          bestRating: BEST_RATING,
          worstRating: WORST_RATING,
        },
        featureList: [
          'リアルタイムクイズ作成',
          'TUIZ参加機能',
          'インタラクティブな参加体験',
          '教育機関向け機能',
          '企業研修対応',
          'イベント管理',
          '多言語対応',
          'モバイル最適化',
        ],
      };

    case 'quiz':
      return {
        '@context': SCHEMA_CONTEXT,
        '@type': SCHEMA_TYPE_QUIZ,
        name: 'TUIZ情報王 - リアルタイムクイズプラットフォーム',
        description: 'リアルタイムでクイズを作成・参加できる学習プラットフォーム',
        url: SITE_CONFIG.BASE_URL,
        educationalLevel: EDUCATIONAL_LEVEL,
        educationalUse: EDUCATIONAL_USE,
        learningResourceType: LEARNING_RESOURCE_TYPE,
        inLanguage: LANGUAGE_JA_JP,
        author: {
          '@type': SCHEMA_TYPE_ORGANIZATION,
          name: 'TUIZ Team',
        },
        publisher: {
          '@type': SCHEMA_TYPE_ORGANIZATION,
          name: 'TUIZ情報王',
          url: SITE_CONFIG.BASE_URL,
        },
        isAccessibleForFree: true,
        offers: {
          '@type': SCHEMA_TYPE_OFFER,
          price: PRICE_FREE,
          priceCurrency: PRICE_CURRENCY_JPY,
          availability: AVAILABILITY_IN_STOCK,
        },
        audience: {
          '@type': SCHEMA_TYPE_AUDIENCE,
          audienceType: 'Students, Teachers, Corporate Trainers, Event Organizers',
        },
        about: [
          {
            '@type': SCHEMA_TYPE_THING,
            name: 'Quiz',
            description: 'インタラクティブな学習クイズ',
          },
          {
            '@type': SCHEMA_TYPE_THING,
            name: 'TUIZ参加',
            description: 'リアルタイムクイズ参加機能',
          },
          {
            '@type': SCHEMA_TYPE_THING,
            name: 'TUIZ情報王',
            description: 'リアルタイムクイズプラットフォーム',
          },
        ],
      };

    default:
      return {};
  }
};

/**
 * Component: StructuredData
 * Description:
 * - Component for generating JSON-LD structured data
 * - Creates schema.org compliant structured data for SEO
 * - Supports multiple schema types (website, organization, software, quiz)
 * - Injects structured data as script tag with application/ld+json type
 * - Improves search engine understanding and rich snippet display
 *
 * Parameters:
 * - type ('website' | 'organization' | 'software' | 'quiz'): Type of structured data to generate
 *
 * Returns:
 * - React.ReactElement: The structured data script component
 *
 * Example:
 * ```tsx
 * <StructuredData type="website" />
 * <StructuredData type="organization" />
 * ```
 */
export const StructuredData: React.FC<StructuredDataProps> = ({ type }) => {
  const structuredData = getStructuredData(type);

  return (
    <script
      type={SCRIPT_TYPE_JSON_LD}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};

export default StructuredData;
