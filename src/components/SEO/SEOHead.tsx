// ====================================================
// File Name   : SEOHead.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-26
// Last Update : 2025-08-26
//
// Description:
// - SEO head component for Next.js pages
// - Manages meta tags for search engines and social media
// - Provides Open Graph and Twitter Card support
// - Handles canonical URLs and robots directives
// - Uses default values from config when not provided
//
// Notes:
// - Server-side component (no 'use client')
// - Uses Next.js Head component for meta tag injection
// - Falls back to config defaults for missing values
// ====================================================

import Head from 'next/head';
import { SITE_CONFIG, SEO_CONFIG } from '@/config/constants';

const KEYWORDS_SEPARATOR = ', ';

const OG_TYPE_WEBSITE = 'website';
const OG_LOCALE_JA_JP = 'ja_JP';
const TWITTER_CARD_TYPE = 'summary_large_image';
const ROBOTS_CONTENT = 'index, follow';
const VIEWPORT_CONTENT = 'width=device-width, initial-scale=1';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
}

/**
 * Component: SEOHead
 * Description:
 * - SEO head component for managing page meta tags
 * - Sets up basic meta tags (title, description, keywords)
 * - Configures Open Graph tags for social media sharing
 * - Sets up Twitter Card tags for Twitter sharing
 * - Handles canonical URLs and robots directives
 * - Falls back to config defaults when values are not provided
 *
 * Parameters:
 * - title (string, optional): Page title
 * - description (string, optional): Page description
 * - keywords (string[], optional): SEO keywords array
 * - ogTitle (string, optional): Open Graph title
 * - ogDescription (string, optional): Open Graph description
 * - ogImage (string, optional): Open Graph image URL
 * - ogUrl (string, optional): Open Graph URL
 * - twitterTitle (string, optional): Twitter card title
 * - twitterDescription (string, optional): Twitter card description
 * - twitterImage (string, optional): Twitter card image URL
 * - canonical (string, optional): Canonical URL
 *
 * Returns:
 * - React.ReactElement: The SEO head component
 *
 * Example:
 * ```tsx
 * <SEOHead
 *   title="My Page"
 *   description="Page description"
 *   keywords={['quiz', 'education']}
 *   canonical="/my-page"
 * />
 * ```
 */
export default function SEOHead({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonical,
}: SEOHeadProps) {
  const baseUrl = SITE_CONFIG.BASE_URL;
  const defaultTitle = SEO_CONFIG.DEFAULT_TITLE;
  const defaultDescription = SEO_CONFIG.DEFAULT_DESCRIPTION;
  const defaultImage = SEO_CONFIG.DEFAULT_IMAGE;

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalOgTitle = ogTitle || finalTitle;
  const finalOgDescription = ogDescription || finalDescription;
  const finalOgImage = ogImage || defaultImage;
  const finalOgUrl = ogUrl || canonical || baseUrl;
  const finalTwitterTitle = twitterTitle || finalTitle;
  const finalTwitterDescription = twitterDescription || finalDescription;
  const finalTwitterImage = twitterImage || defaultImage;

  return (
    <Head>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(KEYWORDS_SEPARATOR)} />
      )}

      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:type" content={OG_TYPE_WEBSITE} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={`${baseUrl}${finalOgImage}`} />
      <meta property="og:url" content={finalOgUrl} />
      <meta property="og:site_name" content="TUIZ情報王" />
      <meta property="og:locale" content={OG_LOCALE_JA_JP} />

      <meta name="twitter:card" content={TWITTER_CARD_TYPE} />
      <meta name="twitter:title" content={finalTwitterTitle} />
      <meta name="twitter:description" content={finalTwitterDescription} />
      <meta name="twitter:image" content={`${baseUrl}${finalTwitterImage}`} />
      <meta name="twitter:creator" content="@tuiz_official" />

      <meta name="robots" content={ROBOTS_CONTENT} />
      <meta name="author" content="PandaDev0069 / Panta Aashish" />
      <meta name="viewport" content={VIEWPORT_CONTENT} />
    </Head>
  );
}
