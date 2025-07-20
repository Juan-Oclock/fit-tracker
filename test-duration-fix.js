// Test script to check and fix workout durations
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testDurationFix() {
  try {
    console.log('🔍 Checking current workout duration data...');
    
    // First, check the debug endpoint
    const debugResponse = await fetch(`${BASE_URL}/api/debug/workouts`, {
      headers: {
        'Authorization': 'Bearer test-token', // You'll need a valid token
        'Content-Type': 'application/json'
      }
    });
    
    if (!debugResponse.ok) {
      console.log('❌ Debug endpoint failed:', debugResponse.status);
      console.log('Note: You need to be logged in to test this endpoint');
      return;
    }
    
    const debugData = await debugResponse.json();
    console.log('📊 Current workout data:');
    debugData.forEach(workout => {
      console.log(`  - ${workout.name}: duration=${workout.duration}min, exercises=${workout.exerciseCount}, total exercise time=${workout.totalExerciseDuration}s`);
    });
    
    // Check if any workouts need fixing
    const needsFix = debugData.filter(w => !w.duration || w.duration === 0);
    
    if (needsFix.length > 0) {
      console.log(`\n🔧 Found ${needsFix.length} workouts that need duration fixes`);
      
      // Call the fix endpoint
      const fixResponse = await fetch(`${BASE_URL}/api/fix/workout-durations`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      
      if (fixResponse.ok) {
        const fixResult = await fixResponse.json();
        console.log('✅ Fix result:', fixResult.message);
      } else {
        console.log('❌ Fix failed:', fixResponse.status);
      }
    } else {
      console.log('\n✅ All workouts already have proper durations!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nNote: Make sure the server is running and you have proper authentication');
  }
}

// Run the test
testDurationFix();
