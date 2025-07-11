export const DEFAULT_MUSCLE_GROUPS = [
  "Chest",
  "Back", 
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Core",
  "Abs",
  "Obliques",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Legs",
  "Full Body",
  "Cardio"
] as const;

export const DEFAULT_EXERCISE_CATEGORIES = [
  "strength",
  "cardio", 
  "flexibility",
  "mixed"
] as const;

// Dynamic arrays that can be modified by admin
export let MUSCLE_GROUPS = [...DEFAULT_MUSCLE_GROUPS];
export let EXERCISE_CATEGORIES = [...DEFAULT_EXERCISE_CATEGORIES];

export const EQUIPMENT_TYPES = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
  "Resistance Band",
  "Kettlebell",
  "Medicine Ball",
  "None"
] as const;

export const REST_TIMER_PRESETS = [
  { label: "30 seconds", value: 30 },
  { label: "1 minute", value: 60 },
  { label: "1.5 minutes", value: 90 },
  { label: "2 minutes", value: 120 },
  { label: "3 minutes", value: 180 },
  { label: "5 minutes", value: 300 },
] as const;

export const WORKOUT_GOALS = [
  "Weight Loss",
  "Muscle Gain", 
  "Strength",
  "Endurance",
  "General Fitness"
] as const;

export const APP_CONFIG = {
  name: "FitTracker",
  version: "1.0.0",
  description: "Modern workout tracker PWA",
  defaultRestTime: 120, // seconds
  maxExercisesPerWorkout: 20,
  maxSetsPerExercise: 10,
} as const;
