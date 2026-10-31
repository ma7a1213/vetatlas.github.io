// Supabase Dashboard > Project Settings > API.
window.SUPABASE_CONFIG = {
  url: 'https://apcyhufyishrmjlhqijw.supabase.co',
  anonKey: 'sb_publishable_6kOczbdReBYBznZ8fcvo0A_ZBqSHMwz'
};

(function initializeSupabase() {
  if (!window.supabase || window.SUPABASE_CONFIG.url.includes('YOUR_PROJECT_ID')) return;
  window.vetSupabase = window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
  );
})();
