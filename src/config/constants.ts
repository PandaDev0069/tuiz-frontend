export const SITE_CONFIG = {
  BASE_URL: 'https://tuiz-info-king.vercel.app',
  SITE_NAME: 'TUIZ情報王',
  SITE_DESCRIPTION: 'リアルタイムでクイズを作成・参加できる革新的な学習プラットフォーム',
  TWITTER_HANDLE: '@tuiz_official',
  LOCALE: 'ja_JP',
} as const;

export const SEO_CONFIG = {
  DEFAULT_TITLE: 'リアルタイムクイズ作成 & 参加 | TUIZ情報王',
  DEFAULT_DESCRIPTION:
    'Next.js と Socket.IO によるインタラクティブな学習プラットフォームで、リアルタイムのクイズ体験を。今すぐホストまたは参加！',
  DEFAULT_IMAGE: '/logo.png',
  KEYWORDS: [
    'クイズ',
    'リアルタイム',
    '学習',
    '教育',
    '研修',
    'イベント',
    'ゲーム',
    'インタラクティブ',
    'オンライン',
    'プラットフォーム',
    'TUIZ',
    '情報王',
  ] as string[],
} as const;

export const PAGE_METADATA = {
  HOME: {
    title: 'リアルタイムクイズ作成 & 参加 | TUIZ情報王',
    description:
      'Next.js と Socket.IO によるインタラクティブな学習プラットフォームで、リアルタイムのクイズ体験を。今すぐホストまたは参加！',
    keywords: [
      'クイズ',
      'リアルタイム',
      '学習',
      '教育',
      '研修',
      'イベント',
      'ゲーム',
      'インタラクティブ',
      'オンライン',
      'プラットフォーム',
      'TUIZ',
      '情報王',
    ] as string[],
  },
  LOGIN: {
    title: 'ログイン | TUIZ情報王',
    description:
      'TUIZ情報王にログインして、リアルタイムクイズの作成・管理を始めましょう。安全で簡単な認証システム。',
    keywords: ['ログイン', '認証', 'TUIZ', 'クイズ', 'ホスト', '管理', 'リアルタイム'] as string[],
  },
  REGISTER: {
    title: 'アカウント作成 | TUIZ情報王',
    description:
      'TUIZ情報王で新しいアカウントを作成して、リアルタイムクイズの世界に参加しましょう。無料で簡単登録。',
    keywords: [
      'アカウント作成',
      '新規登録',
      'TUIZ',
      'クイズ',
      'ユーザー登録',
      'リアルタイム',
      '学習プラットフォーム',
    ] as string[],
  },
  JOIN: {
    title: 'クイズゲームに参加 | TUIZ情報王',
    description:
      'ルームコードを入力してTUIZ情報王のクイズゲームに参加しましょう。リアルタイムで楽しく学習できます。',
    keywords: [
      'クイズ参加',
      'ゲーム参加',
      'ルームコード',
      'TUIZ',
      'リアルタイム',
      'クイズゲーム',
      '学習',
    ] as string[],
  },
} as const;
