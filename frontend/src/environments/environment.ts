// Values are provided at build time via Netlify/Angular envs (NG_APP_*).
// For local dev with a .env file, Angular exposes variables prefixed with NG_APP_.
const env = (import.meta as any).env || {};

export const environment = {
  production: env.NG_APP_PRODUCTION === 'true',
  supabaseUrl: env.NG_APP_SUPABASE_URL || '',
  supabaseKey: env.NG_APP_SUPABASE_KEY || '',
};
