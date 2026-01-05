// ====================================================
// File Name   : constants.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-26
// Last Update : 2025-08-30
//
// Description:
// - Application-wide constants and configuration
// - Site configuration, SEO metadata, and page metadata
// - Centralized constants for consistent usage across the application
//
// Notes:
// - All constants are exported as const for immutability
// - SEO and page metadata are organized by page type
// - Constants are used throughout the application for consistency
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
/**
 * Site configuration constants
 * Description:
 * - Base URL, site name, description, and locale settings
 * - Used for site-wide configuration and metadata
 */
export const SITE_CONFIG = {
  BASE_URL: 'https://tuiz-info-king.vercel.app',
  SITE_NAME: 'TUIZ情報王',
  SITE_DESCRIPTION: 'リアルタイムでクイズを作成・参加できる革新的な学習プラットフォーム',
  LOCALE: 'ja_JP',
} as const;

/**
 * SEO configuration constants
 * Description:
 * - Default SEO title, description, image, and keywords
 * - Used for meta tags and SEO optimization
 */
export const SEO_CONFIG = {
  DEFAULT_TITLE:
    'TUIZ情報王｜リアルタイムクイズ作成・参加アプリ｜TUIZ参加できる学習プラットフォーム',
  DEFAULT_DESCRIPTION:
    'TUIZ情報王は、リアルタイムでクイズを作成・参加できる無料プラットフォームです。友達と一緒にTUIZ参加して、学びながら楽しもう！',
  DEFAULT_IMAGE: '/logo.png',
  KEYWORDS: [
    'Quiz',
    'TUIZ',
    'TUIZ情報王',
    'TUIZ参加',
    'リアルタイムクイズ',
    'クイズ作成',
    'クイズ参加',
    '学習クイズアプリ',
    'インタラクティブクイズ',
    'リアルタイム',
    '学習',
    '教育',
    '研修',
    'イベント',
    'ゲーム',
    'インタラクティブ',
    'オンライン',
    'プラットフォーム',
    '情報王',
  ] as string[],
} as const;

/**
 * Page-specific metadata constants
 * Description:
 * - SEO metadata for different pages (HOME, LOGIN, REGISTER, JOIN, DASHBOARD)
 * - Each page has title, description, and keywords
 * - Used for page-specific meta tags
 */
export const PAGE_METADATA = {
  HOME: {
    title: 'TUIZ情報王｜リアルタイムクイズ作成・参加アプリ｜TUIZ参加できる学習プラットフォーム',
    description:
      'TUIZ情報王は、リアルタイムでクイズを作成・参加できる無料プラットフォームです。友達と一緒にTUIZ参加して、学びながら楽しもう！',
    keywords: [
      'Quiz',
      'TUIZ',
      'TUIZ情報王',
      'TUIZ参加',
      'リアルタイムクイズ',
      'クイズ作成',
      'クイズ参加',
      '学習クイズアプリ',
      'インタラクティブクイズ',
      'リアルタイム',
      '学習',
      '教育',
      '研修',
      'イベント',
      'ゲーム',
      'インタラクティブ',
      'オンライン',
      'プラットフォーム',
      '情報王',
    ] as string[],
  },
  LOGIN: {
    title: 'ログイン | TUIZ情報王 - リアルタイムクイズ作成・管理',
    description:
      'TUIZ情報王にログインして、リアルタイムクイズの作成・管理を始めましょう。安全で簡単な認証システムでTUIZ参加を体験。',
    keywords: [
      'ログイン',
      '認証',
      'TUIZ',
      'TUIZ参加',
      'クイズ',
      'ホスト',
      '管理',
      'リアルタイム',
      'TUIZ情報王',
    ] as string[],
  },
  REGISTER: {
    title: 'アカウント作成 | TUIZ情報王 - リアルタイムクイズプラットフォーム',
    description:
      'TUIZ情報王で新しいアカウントを作成して、リアルタイムクイズの世界に参加しましょう。無料で簡単登録、TUIZ参加を始めよう！',
    keywords: [
      'アカウント作成',
      '新規登録',
      'TUIZ',
      'TUIZ参加',
      'TUIZ情報王',
      'クイズ',
      'ユーザー登録',
      'リアルタイム',
      '学習プラットフォーム',
    ] as string[],
  },
  JOIN: {
    title: 'TUIZ参加 - クイズゲームに参加 | TUIZ情報王',
    description:
      'ルームコードを入力してTUIZ情報王のクイズゲームに参加しましょう。リアルタイムで楽しく学習できるTUIZ参加体験。',
    keywords: [
      'TUIZ参加',
      'クイズ参加',
      'ゲーム参加',
      'ルームコード',
      'TUIZ',
      'TUIZ情報王',
      'リアルタイム',
      'クイズゲーム',
      '学習',
      'Quiz',
    ] as string[],
  },
  DASHBOARD: {
    title: 'ダッシュボード | TUIZ情報王 - クイズ作成・管理',
    description:
      'TUIZ情報王のダッシュボードでクイズを作成・管理しましょう。リアルタイムクイズの作成から公開まで一元管理。',
    keywords: [
      'ダッシュボード',
      'TUIZ情報王',
      'クイズ作成',
      'クイズ管理',
      'TUIZ',
      'リアルタイム',
      '学習プラットフォーム',
      'Quiz',
    ] as string[],
  },
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
