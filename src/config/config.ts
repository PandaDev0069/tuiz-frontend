// src/config/config.ts
// Single source of truth for public config used in the browser.
// Only reads NEXT_PUBLIC_* keys.
// Import from anywhere as: import { cfg } from '@/config/config';

type Cfg = Readonly<{
  appName: string;
  apiBase: string;                 // your backend URL (Render/local)
  supabaseUrl: string;
  supabaseAnonKey: string;
  isDev: boolean;
}>;

function must(key: string, val: string | undefined): string {
  if (!val) throw new Error(`Missing environment variable: ${key}`);
  return val;
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080';

export const cfg: Cfg = Object.freeze({
  appName: 'TUIZ',
  apiBase,
  supabaseUrl: must('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: must('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  isDev: process.env.NODE_ENV !== 'production',
});
