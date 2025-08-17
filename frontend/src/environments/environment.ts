// For production builds on Netlify, injecting env via import.meta.env is not
// reliable with the current Angular builder. Since Supabase anon key and URL
// are safe to expose on the client, we define them directly here so the app
// runs without runtime env injection issues.
export const environment = {
  production: true,
  supabaseUrl: 'https://obutpxyzhshjczbmtlxs.supabase.co',
  supabaseKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idXRweHl6aHNoamN6Ym10bHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODkxNjksImV4cCI6MjA3MDg2NTE2OX0.VWLSI3x1dN0QKvIy02iVh_rdjKcuaK1iqW-2RToTb8I',
};
