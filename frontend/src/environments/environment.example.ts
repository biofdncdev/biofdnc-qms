// Example file for reference only. Real values are read from NG_APP_* env vars.
const env = (import.meta as any).env || {};

export const environment = {
  production: env.NG_APP_PRODUCTION === 'true',
  supabaseUrl: env.NG_APP_SUPABASE_URL || 'https://YOUR-PROJECT.supabase.co',
  supabaseKey: env.NG_APP_SUPABASE_KEY || 'YOUR_PUBLIC_ANON_KEY',
};
