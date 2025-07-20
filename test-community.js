import { createClient } from '@supabase/supabase-js';

// Test script to verify community presence functionality
async function testCommunityPresence() {
  // Get Supabase config from environment
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('Missing Supabase environment variables');
    console.log('VITE_SUPABASE_URL:', !!supabaseUrl);
    console.log('VITE_SUPABASE_ANON_KEY:', !!supabaseKey);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Testing community presence table...');
    
    // Test 1: Try to query the table
    const { data: queryData, error: queryError } = await supabase
      .from('community_presence')
      .select('*')
      .limit(1);
    
    console.log('Query test:', { queryData, queryError });
    
    // Test 2: Try to insert test data
    const testData = {
      user_id: 'test-user-123',
      username: 'Test User',
      profile_image_url: null,
      workout_name: 'Test Workout',
      exercise_names: 'Push-ups, Squats',
      last_active: new Date().toISOString(),
    };
    
    console.log('Attempting to insert:', testData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('community_presence')
      .upsert(testData);
    
    console.log('Insert test:', { insertData, insertError });
    
    if (insertError) {
      console.error('Insert failed:', insertError.message);
      console.error('Error details:', insertError);
    } else {
      console.log('Insert successful!');
      
      // Clean up test data
      await supabase
        .from('community_presence')
        .delete()
        .eq('user_id', 'test-user-123');
      console.log('Test data cleaned up');
    }
    
  } catch (err) {
    console.error('Exception:', err);
  }
}

testCommunityPresence();
