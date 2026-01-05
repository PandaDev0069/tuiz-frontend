// ====================================================
// File Name   : config.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-19
// Last Update : 2025-08-26
//
// Description:
// - Single source of truth for public config used in the browser
// - Only reads NEXT_PUBLIC_* environment variables
// - Provides frozen configuration object for application settings
// - Handles development and production API base URLs
//
// Notes:
// - Import from anywhere as: import { cfg } from '@/config/config';
// - Configuration object is frozen to prevent mutations
// - Environment variables are validated on initialization
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const APP_NAME = 'TUIZ';
const NODE_ENV_DEVELOPMENT = 'development';
const NODE_ENV_PRODUCTION = 'production';
const LOCAL_API_BASE = 'http://localhost:8080';
const DEFAULT_PRODUCTION_API_BASE = 'https://tuiz-info-king-backend.onrender.com';

const ENV_VARS = {
  API_BASE: 'NEXT_PUBLIC_API_BASE',
  SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Configuration type interface
 */
type Cfg = Readonly<{
  appName: string;
  apiBase: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isDev: boolean;
}>;

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Function: must
 * Description:
 * - Validates that an environment variable is present
 * - Throws error if variable is missing or undefined
 *
 * Parameters:
 * - key (string): Environment variable key name
 * - val (string | undefined): Environment variable value
 *
 * Returns:
 * - string: The validated environment variable value
 *
 * @throws {Error} If environment variable is missing
 */
function must(key: string, val: string | undefined): string {
  if (!val) throw new Error(`Missing environment variable: ${key}`);
  return val;
}

const apiBase =
  process.env.NODE_ENV === NODE_ENV_DEVELOPMENT
    ? LOCAL_API_BASE
    : (process.env[ENV_VARS.API_BASE] ?? DEFAULT_PRODUCTION_API_BASE);

/**
 * Configuration object
 * Description:
 * - Frozen configuration object containing all public app settings
 * - Automatically selects API base URL based on environment
 * - Validates required environment variables on initialization
 */
export const cfg: Cfg = Object.freeze({
  appName: APP_NAME,
  apiBase,
  supabaseUrl: must(ENV_VARS.SUPABASE_URL, process.env[ENV_VARS.SUPABASE_URL]),
  supabaseAnonKey: must(ENV_VARS.SUPABASE_ANON_KEY, process.env[ENV_VARS.SUPABASE_ANON_KEY]),
  isDev: process.env.NODE_ENV !== NODE_ENV_PRODUCTION,
});

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
