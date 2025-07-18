export const DEFAULT_MUSCLE_GROUPS = [
  "Upper Chest",
  "Middle Chest",
  "Lower Chest",
  "Chest",
  "Back",
  "Lats",
  "Lower Back",
  "Middle Back",
  "Traps",
  "Rhomboids",
  "Shoulders",
  "Front Delts",
  "Side Delts",
  "Rear Delts",
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
  "mixed",
  "HIIT",
  "Plyometrics",
  "Mobility",
  "Balance",
  "Yoga/Pilates",
  "Rehabilitation/Prehab",
  "Sport-Specific"
] as const;

export const DEFAULT_EXERCISE_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  strength: "Strength training exercises",
  cardio: "Cardiovascular exercises",
  flexibility: "Flexibility and mobility exercises",
  mixed: "Mixed or combination routines",
  HIIT: "High-Intensity Interval Training: short bursts of intense exercise alternated with recovery periods.",
  Plyometrics: "Jumping and explosive movement exercises to develop power.",
  Mobility: "Exercises focused on improving range of motion and joint health.",
  Balance: "Exercises aimed at improving stability and coordination.",
  "Yoga/Pilates": "Mind-body routines for flexibility, core strength, and relaxation.",
  "Rehabilitation/Prehab": "Exercises for injury recovery or prevention.",
  "Sport-Specific": "Training tailored for specific sports or athletic performance."
};

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
