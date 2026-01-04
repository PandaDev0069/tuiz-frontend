// ====================================================
// File Name   : supabaseClient.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-20
//
// Description:
// - Supabase client initialization and configuration
// - Provides singleton Supabase client instance for frontend
// - Configures authentication with session persistence and auto-refresh
//
// Notes:
// - Uses configuration from @/config/config for URL and keys
// - Session persistence enabled for user authentication
// - Auto token refresh enabled for seamless user experience
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { createClient } from '@supabase/supabase-js';
import { cfg } from '@/config/config';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const AUTH_PERSIST_SESSION = true;
const AUTH_AUTO_REFRESH_TOKEN = true;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Constant: supabase
 * Description:
 * - Singleton Supabase client instance
 * - Configured with authentication settings for session persistence and token refresh
 * - Uses Supabase URL and anonymous key from configuration
 */
export const supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
  auth: {
    persistSession: AUTH_PERSIST_SESSION,
    autoRefreshToken: AUTH_AUTO_REFRESH_TOKEN,
  },
});

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
