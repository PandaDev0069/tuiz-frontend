// ====================================================
// File Name   : metadata.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-26
// Last Update : 2025-08-30
//
// Description:
// - Metadata configuration exports for different pages
// - Provides SEO metadata for home, login, register, join, and dashboard pages
// - Includes OpenGraph and Twitter card metadata
//
// Notes:
// - All metadata is derived from PAGE_METADATA constants
// - Used for Next.js page metadata generation
// ====================================================

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import { Metadata } from 'next';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
// (No external libraries needed)

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
// (No internal component imports)

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
// (No service or hook imports)

//----------------------------------------------------
// 5. Config & Type Imports
//----------------------------------------------------
import { SITE_CONFIG, PAGE_METADATA } from '@/config/constants';

//----------------------------------------------------
// 6. Metadata Exports
//----------------------------------------------------
export const homeMetadata: Metadata = {
  title: PAGE_METADATA.HOME.title,
  description: PAGE_METADATA.HOME.description,
  keywords: PAGE_METADATA.HOME.keywords,
  openGraph: {
    title: PAGE_METADATA.HOME.title,
    description: PAGE_METADATA.HOME.description,
    url: SITE_CONFIG.BASE_URL,
    siteName: SITE_CONFIG.SITE_NAME,
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.SITE_NAME} - ${SITE_CONFIG.SITE_DESCRIPTION}`,
      },
    ],
    locale: SITE_CONFIG.LOCALE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_METADATA.HOME.title,
    description: PAGE_METADATA.HOME.description,
    images: ['/logo.png'],
  },
};

export const loginMetadata: Metadata = {
  title: PAGE_METADATA.LOGIN.title,
  description: PAGE_METADATA.LOGIN.description,
  keywords: PAGE_METADATA.LOGIN.keywords,
  openGraph: {
    title: PAGE_METADATA.LOGIN.title,
    description: PAGE_METADATA.LOGIN.description,
    url: `${SITE_CONFIG.BASE_URL}/auth/login`,
    siteName: SITE_CONFIG.SITE_NAME,
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.SITE_NAME} - ログイン`,
      },
    ],
    locale: SITE_CONFIG.LOCALE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_METADATA.LOGIN.title,
    description: PAGE_METADATA.LOGIN.description,
    images: ['/logo.png'],
  },
};

export const registerMetadata: Metadata = {
  title: PAGE_METADATA.REGISTER.title,
  description: PAGE_METADATA.REGISTER.description,
  keywords: PAGE_METADATA.REGISTER.keywords,
  openGraph: {
    title: PAGE_METADATA.REGISTER.title,
    description: PAGE_METADATA.REGISTER.description,
    url: `${SITE_CONFIG.BASE_URL}/auth/register`,
    siteName: SITE_CONFIG.SITE_NAME,
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.SITE_NAME} - アカウント作成`,
      },
    ],
    locale: SITE_CONFIG.LOCALE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_METADATA.REGISTER.title,
    description: PAGE_METADATA.REGISTER.description,
    images: ['/logo.png'],
  },
};

export const joinMetadata: Metadata = {
  title: PAGE_METADATA.JOIN.title,
  description: PAGE_METADATA.JOIN.description,
  keywords: PAGE_METADATA.JOIN.keywords,
  openGraph: {
    title: PAGE_METADATA.JOIN.title,
    description: PAGE_METADATA.JOIN.description,
    url: `${SITE_CONFIG.BASE_URL}/join`,
    siteName: SITE_CONFIG.SITE_NAME,
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.SITE_NAME} - TUIZ参加・クイズゲーム参加`,
      },
    ],
    locale: SITE_CONFIG.LOCALE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_METADATA.JOIN.title,
    description: PAGE_METADATA.JOIN.description,
    images: ['/logo.png'],
  },
};

export const dashboardMetadata: Metadata = {
  title: PAGE_METADATA.DASHBOARD.title,
  description: PAGE_METADATA.DASHBOARD.description,
  keywords: PAGE_METADATA.DASHBOARD.keywords,
  openGraph: {
    title: PAGE_METADATA.DASHBOARD.title,
    description: PAGE_METADATA.DASHBOARD.description,
    url: `${SITE_CONFIG.BASE_URL}/dashboard`,
    siteName: SITE_CONFIG.SITE_NAME,
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.SITE_NAME} - ダッシュボード・クイズ作成・管理`,
      },
    ],
    locale: SITE_CONFIG.LOCALE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_METADATA.DASHBOARD.title,
    description: PAGE_METADATA.DASHBOARD.description,
    images: ['/logo.png'],
  },
};
