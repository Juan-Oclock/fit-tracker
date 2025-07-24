// This file will be compiled to JavaScript and used in production
import { getStorage } from './storage.js';

// Basic default exercises for initial seeding
const DEFAULT_EXERCISES = [
  { name: "Bench Press", category: "strength", muscleGroup: "Chest", instructions: "Lie on bench, lower bar to chest, press up", equipment: "Barbell" },
  { name: "Squat", category: "strength", muscleGroup: "Legs", instructions: "Stand with feet shoulder-width apart, squat down, stand up", equipment: "Barbell" },
  { name: "Deadlift", category: "strength", muscleGroup: "Back", instructions: "Lift barbell from ground to hip level", equipment: "Barbell" },
  { name: "Running", category: "cardio", muscleGroup: "Full Body", instructions: "Run at steady pace", equipment: "None" },
  { name: "Plank", category: "flexibility", muscleGroup: "Core", instructions: "Hold plank position", equipment: "None" },
];

// Basic categories
const DEFAULT_CATEGORIES = [
  { name: "strength", description: "Exercises focused on building muscle and strength" },
  { name: "cardio", description: "Exercises focused on cardiovascular endurance" },
  { name: "flexibility", description: "Exercises focused on improving flexibility and mobility" },
  { name: "mixed", description: "Exercises that combine multiple fitness aspects" }
];

// Basic muscle groups
const DEFAULT_MUSCLE_GROUPS = [
  { name: "Chest", description: "Pectoral muscles" },
  { name: "Back", description: "Latissimus dorsi, rhomboids, and trapezius" },
  { name: "Legs", description: "Quadriceps, hamstrings, and calves" },
  { name: "Core", description: "Abdominal and lower back muscles" },
  { name: "Arms", description: "Biceps, triceps, and forearms" },
  { name: "Shoulders", description: "Deltoid muscles" }
];

// Simplified seeding function that won't timeout
export async function seedEssentialData() {
  const storage = await getStorage();
  
  try {
    // Check if we already have exercises
    const existingExercises = await storage.getExercises();
    if (existingExercises.length > 0) {
      console.log('Database already has exercises, skipping essential seeding');
      return;
    }
    
    // Seed minimal set of exercises
    console.log('Seeding essential exercises...');
    for (const exercise of DEFAULT_EXERCISES) {
      await storage.createExercise(exercise);
    }
    
    // Seed categories
    console.log('Seeding essential categories...');
    for (const category of DEFAULT_CATEGORIES) {
      try {
        await storage.createCategory(category);
      } catch (error) {
        // Ignore duplicates
      }
    }
    
    // Seed muscle groups
    console.log('Seeding essential muscle groups...');
    for (const muscleGroup of DEFAULT_MUSCLE_GROUPS) {
      try {
        await storage.createMuscleGroup(muscleGroup);
      } catch (error) {
        // Ignore duplicates
      }
    }
    
    console.log('Essential data seeding completed');
  } catch (error) {
    console.error('Error seeding essential data:', error);
    // Don't throw - we want to continue even if seeding fails
  }
}