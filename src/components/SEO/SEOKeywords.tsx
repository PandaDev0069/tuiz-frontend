'use client';

import React from 'react';

interface SEOKeywordsProps {
  keywords: string[];
  description?: string;
}

export const SEOKeywords: React.FC<SEOKeywordsProps> = ({ keywords, description }) => {
  return (
    <div className="sr-only" aria-hidden="true">
      {/* Hidden keywords for SEO - not visible to users but discoverable by search engines */}
      <div>
        <h3>{description || '対応機能'}</h3>
        <ul>
          {keywords.map((keyword) => (
            <li key={keyword}>{keyword}</li>
          ))}
        </ul>
      </div>

      {/* Additional structured content for better SEO */}
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
