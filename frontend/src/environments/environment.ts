// Prefer values injected at runtime via public/env.js (window.__env)
// and fall back to import.meta.env for local builds.
const metaEnv = (import.meta as any).env || {};
const runtimeEnv = (globalThis as any).__env || {};

export const environment = {
  production: (metaEnv.NG_APP_PRODUCTION || runtimeEnv.NG_APP_PRODUCTION) === 'true',
  supabaseUrl: metaEnv.NG_APP_SUPABASE_URL || runtimeEnv.NG_APP_SUPABASE_URL || '',
  supabaseKey: metaEnv.NG_APP_SUPABASE_KEY || runtimeEnv.NG_APP_SUPABASE_KEY || '',
};
