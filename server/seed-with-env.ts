import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: '.env' });

import { seedExercises } from './seed-exercises';
import { getStorage } from './storage';

async function seedWithDatabase() {
  console.log('🌱 Starting database seeding with proper environment...');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  try {
    // Test connection first
    const storage = await getStorage();
    console.log('✅ Database connection established');
    
    // Check current state
    const existingExercises = await storage.getExercises();
    console.log(`📊 Current exercises in database: ${existingExercises.length}`);
    
    // Seed exercises
    console.log('🏋️ Seeding exercises...');
    await seedExercises();
    
    // Verify seeding
    const newExercises = await storage.getExercises();
    console.log(`✅ Exercises after seeding: ${newExercises.length}`);
    
    // Also check categories and muscle groups
    const categories = await storage.getCategories();
    const muscleGroups = await storage.getMuscleGroups();
    console.log(`📂 Categories: ${categories.length}`);
    console.log(`💪 Muscle groups: ${muscleGroups.length}`);
    
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedWithDatabase();
