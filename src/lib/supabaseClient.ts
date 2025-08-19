// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { cfg } from '@/config/config';

export const supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
