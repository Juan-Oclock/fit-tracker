import { config } from 'dotenv';
import { getStorage } from './storage';

// Load environment variables from .env file
config({ path: '../.env' });

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL starts with postgres:', process.env.DATABASE_URL?.startsWith('postgres'));
  
  try {
    const storage = await getStorage();
    console.log('✅ Storage initialized successfully');
    
    // Test basic operations
    const exercises = await storage.getExercises();
    console.log(`📊 Found ${exercises.length} exercises in database`);
    
    const categories = await storage.getCategories();
    console.log(`📂 Found ${categories.length} categories in database`);
    
    const muscleGroups = await storage.getMuscleGroups();
    console.log(`💪 Found ${muscleGroups.length} muscle groups in database`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDatabaseConnection();
