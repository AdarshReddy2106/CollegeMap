const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zlgjprkgzhihzpmhcipl.supabase.co';
const supabaseKey = 'sb_publishable_fCnvC2cqBXvlXFseIJHVrg_Z-wcWVtv';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearLeaderboard() {
  console.log('🧹 Attempting to clear all leaderboard submissions from Supabase table: jee_daily_submissions...');
  try {
    const { data, error } = await supabase
      .from('jee_daily_submissions')
      .delete()
      .neq('user_email', '');

    if (error) {
      console.error('❌ Supabase Delete Error:', error.message);
    } else {
      console.log('✅ Successfully deleted all leaderboard submissions from Supabase!');
    }
  } catch (err) {
    console.error('❌ Execution Exception:', err.message);
  }
}

clearLeaderboard();
