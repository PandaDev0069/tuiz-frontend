import Head from 'next/head';
import { SITE_CONFIG, SEO_CONFIG } from '@/config/constants';

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
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={`${baseUrl}${finalOgImage}`} />
      <meta property="og:url" content={finalOgUrl} />
      <meta property="og:site_name" content="TUIZ情報王" />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTwitterTitle} />
      <meta name="twitter:description" content={finalTwitterDescription} />
      <meta name="twitter:image" content={`${baseUrl}${finalTwitterImage}`} />
      <meta name="twitter:creator" content="@tuiz_official" />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="TUIZ Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}
