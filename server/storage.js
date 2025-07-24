// Simplified JavaScript storage module for Netlify serverless functions
// Avoid complex imports that might fail in serverless environment

// Simplified approach - use fallback data for now to avoid import issues

// In-memory storage fallback
class InMemoryStorage {
  constructor() {
    this.exercises = [];
    this.workouts = [];
    this.categories = [
      { id: 1, name: 'Strength', iconColor: '#FFD300' },
      { id: 2, name: 'Cardio', iconColor: '#FF6B6B' },
      { id: 3, name: 'Flexibility', iconColor: '#4ECDC4' }
    ];
    this.muscleGroups = [
      { id: 1, name: 'Chest', color: '#FF6B6B' },
      { id: 2, name: 'Back', color: '#4ECDC4' },
      { id: 3, name: 'Legs', color: '#45B7D1' },
      { id: 4, name: 'Arms', color: '#96CEB4' },
      { id: 5, name: 'Shoulders', color: '#FFEAA7' },
      { id: 6, name: 'Core', color: '#DDA0DD' }
    ];
    this.quotes = [];
  }

  async getExercises() {
    return this.exercises;
  }

  async getCategories() {
    return this.categories;
  }

  async getMuscleGroups() {
    return this.muscleGroups;
  }

  async getQuotes() {
    return this.quotes;
  }

  async getWorkouts() {
    return this.workouts;
  }
}

// Removed PostgresStorage for now to avoid import issues

// Storage factory function - simplified to avoid import issues
async function getStorage() {
  console.log('🔍 getStorage called');
  console.log('  - DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('  - Using InMemoryStorage (simplified for serverless compatibility)');
  return new InMemoryStorage();
}

module.exports = {
  getStorage,
  InMemoryStorage
};
