// ====================================================
// File Name   : SEOKeywords.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-01
// Last Update : 2025-09-01
//
// Description:
// - SEO keywords component for hidden keyword display
// - Renders keywords in screen-reader-only section
// - Provides structured content for search engine discovery
// - Not visible to users but discoverable by search engines
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses sr-only class to hide from visual display
// - Includes additional structured content for SEO
// ====================================================

'use client';

import React from 'react';

const CONTAINER_CLASSES = 'sr-only';

interface SEOKeywordsProps {
  keywords: string[];
  description?: string;
}

/**
 * Component: SEOKeywords
 * Description:
 * - SEO component for displaying hidden keywords
 * - Renders keywords in a screen-reader-only section
 * - Provides structured content for search engine optimization
 * - Not visible to users but discoverable by search engines
 * - Includes additional platform description for SEO
 *
 * Parameters:
 * - keywords (string[]): Array of SEO keywords to display
 * - description (string, optional): Description heading for keywords section
 *
 * Returns:
 * - React.ReactElement: The SEO keywords component
 *
 * Example:
 * ```tsx
 * <SEOKeywords
 *   keywords={['quiz', 'education', 'learning']}
 *   description="Features"
 * />
 * ```
 */
export const SEOKeywords: React.FC<SEOKeywordsProps> = ({ keywords, description }) => {
  return (
    <div className={CONTAINER_CLASSES} aria-hidden="true">
      <div>
        <h3>{description || '対応機能'}</h3>
        <ul>
          {keywords.map((keyword) => (
            <li key={keyword}>{keyword}</li>
          ))}
        </ul>
      </div>

      <div>
        <p>
          TUIZ情報王は、Quiz、TUIZ、TUIZ参加、リアルタイムクイズ、クイズ作成、
          クイズ参加、学習クイズアプリ、インタラクティブクイズに対応した
          包括的な学習プラットフォームです。
        </p>
      </div>
    </div>
  );
};

export default SEOKeywords;
