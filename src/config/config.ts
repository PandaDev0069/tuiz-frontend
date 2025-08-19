// Minimal env reader for the frontend. Exports a typed object with defaults.

export type Env = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_API_BASE?: string;
};

export const getEnv = (): Env => {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE ?? undefined,
  };
};

export const requireClientEnv = (key: keyof Env): string => {
  const val = process.env[key];
  if (!val) {
    // Keep runtime behavior non-fatal for local dev; return empty string but log to help developer.
    // In production you may want to throw here.
    console.warn(`Environment variable ${key} is not set.`);
    return "";
  }
  return val;
};
