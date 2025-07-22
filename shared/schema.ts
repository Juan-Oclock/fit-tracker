import { pgTable, text, serial, integer, timestamp, jsonb, decimal, varchar, index, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  weeklyGoal: integer("weekly_goal").default(4),
  goalSetAt: timestamp("goal_set_at"),
  showInCommunity: boolean("show_in_community").default(false), // Opt-in for community dashboard
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // strength, cardio, flexibility
  muscleGroup: text("muscle_group").notNull(),
  instructions: text("instructions"),
  equipment: text("equipment"),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  duration: integer("duration"), // in minutes
  category: text("category"), // Auto-determined from exercises, nullable
  notes: text("notes"),
  imageUrl: text("image_url"), // Base64 compressed image or URL
});

export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  sets: integer("sets").notNull(),
  reps: text("reps"), // can be "8-12" or "10"
  weight: decimal("weight"),
  restTime: integer("rest_time"), // in seconds
  durationSeconds: integer("duration_seconds").notNull().default(0), // NEW: Track exercise timer duration
  notes: text("notes"),
});

export const personalRecords = pgTable("personal_records", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  weight: decimal("weight").notNull(),
  reps: integer("reps").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  date: true,
  userId: true, // userId is set on the server from authenticated user
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({
  id: true,
}); // durationSeconds is now included by default

// Extended workout schema that includes exercises for creation
export const createWorkoutWithExercisesSchema = insertWorkoutSchema.extend({
  exercises: z.array(insertWorkoutExerciseSchema.omit({ workoutId: true })).optional(),
  imageUrl: z.string().nullable().optional(),
}); // durationSeconds is included in exercises

export const insertPersonalRecordSchema = createInsertSchema(personalRecords).omit({
  id: true,
  date: true,
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type CreateWorkoutWithExercises = z.infer<typeof createWorkoutWithExercisesSchema>;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;

export type PersonalRecord = typeof personalRecords.$inferSelect;
export type InsertPersonalRecord = z.infer<typeof insertPersonalRecordSchema>;

// Client-side types for complex data
export type WorkoutWithExercises = Workout & {
  exercises: (WorkoutExercise & { exercise: Exercise })[];
};

export type ExerciseStats = {
  exerciseId: number;
  exerciseName: string;
  totalVolume: number;
  maxWeight: number;
  totalSets: number;
  lastPerformed: string;
};

// Add this after the existing tables
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  author: varchar("author", { length: 100 }),
  category: varchar("category", { length: 50 }).default("motivation"), // 'motivation', 'strength', 'cardio', 'general'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add validation schemas
export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Add types
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

// Update WorkoutStats type to replace totalVolume with quote
export type WorkoutStats = {
  totalWorkouts: number;
  thisWeek: number;
  personalRecords: {
    exerciseName: string;
    weight: number;
    category: string;
  } | null; // Change from number to object with exercise details
  dailyQuote: Quote | null;
  weeklyGoal: number;
  averageDuration: number;
  canSetNewGoal: boolean;
};

export const updateGoalSchema = z.object({
  weeklyGoal: z.number().min(1).max(14),
});

export type UpdateGoal = z.infer<typeof updateGoalSchema>;

// NEW: Goal Photos table for before/after pictures
export const goalPhotos = pgTable("goal_photos", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  imageUrl: text("image_url").notNull(), // Base64 compressed image or URL
  type: text("type").notNull(), // 'before' | 'progress' | 'after'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  description: text("description"), // Optional user description
});

// NEW: Monthly Goals table for tracking monthly targets
export const monthlyGoals = pgTable("monthly_goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  targetWorkouts: integer("target_workouts").notNull(),
  completedWorkouts: integer("completed_workouts").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    // Add unique constraint on userId, month, year combination
    userMonthYearUnique: unique().on(table.userId, table.month, table.year),
  };
});

// NEW: Schema validators
export const insertGoalPhotoSchema = createInsertSchema(goalPhotos).omit({
  id: true,
  userId: true,
  timestamp: true,
});

export const insertMonthlyGoalSchema = createInsertSchema(monthlyGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// NEW: Types
export type GoalPhoto = typeof goalPhotos.$inferSelect;
export type InsertGoalPhoto = z.infer<typeof insertGoalPhotoSchema>;

export type MonthlyGoal = typeof monthlyGoals.$inferSelect;
export type InsertMonthlyGoal = z.infer<typeof insertMonthlyGoalSchema>;

// NEW: Extended types for goal features
export type MonthlyGoalData = {
  month: number;
  year: number;
  targetWorkouts: number;
  completedWorkouts: number;
  workoutDates: string[]; // Array of workout dates in the month
  completionPercentage: number;
  beforePhoto?: GoalPhoto;
  latestPhoto?: GoalPhoto;
};

export type GoalStats = {
  currentMonth: MonthlyGoalData;
  previousMonth?: MonthlyGoalData;
  totalGoalPhotos: number;
  longestStreak: number;
  averageMonthlyCompletion: number;
};

// Add this new table after the existing tables
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"), // Add description field
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Add muscle groups table
export const muscleGroups = pgTable("muscle_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMuscleGroupSchema = createInsertSchema(muscleGroups).omit({
  id: true,
  createdAt: true,
});

export type MuscleGroup = typeof muscleGroups.$inferSelect;
export type InsertMuscleGroup = z.infer<typeof insertMuscleGroupSchema>;
