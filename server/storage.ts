import { 
  exercises, 
  workouts, 
  workoutExercises, 
  personalRecords,
  users,
  monthlyGoals,
  goalPhotos,
  type Exercise, 
  type InsertExercise,
  type Workout,
  type InsertWorkout,
  type CreateWorkoutWithExercises,
  type WorkoutExercise,
  type InsertWorkoutExercise,
  type PersonalRecord,
  type InsertPersonalRecord,
  type WorkoutWithExercises,
  type WorkoutStats,
  type ExerciseStats,
  type User,
  type UpsertUser,
  type MonthlyGoal,
  type InsertMonthlyGoal,
  type MonthlyGoalData,
  type GoalPhoto,
  type InsertGoalPhoto
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { neon } from "@neondatabase/serverless";
import { eq, and, gte, lte, ilike, sql as drizzleSql, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserGoal(userId: string, weeklyGoal: number): Promise<User | undefined>;
  ensureInitialized(): Promise<void>;

  // Exercise methods
  getExercises(): Promise<Exercise[]>;
  getExerciseById(id: number): Promise<Exercise | undefined>;
  getExercisesByCategory(category: string): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: number, exercise: Partial<InsertExercise>): Promise<Exercise | undefined>;
  searchExercises(query: string): Promise<Exercise[]>;

  // Workout methods
  getWorkouts(userId: string): Promise<Workout[]>;
  getWorkoutById(id: number, userId: string): Promise<WorkoutWithExercises | undefined>;
  getWorkoutsByDateRange(startDate: string, endDate: string, userId: string): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout, userId: string): Promise<Workout>;
  createWorkoutWithExercises(workoutData: CreateWorkoutWithExercises, userId: string): Promise<WorkoutWithExercises>;
  updateWorkout(id: number, workout: Partial<InsertWorkout>, userId: string): Promise<Workout | undefined>;
  deleteWorkout(id: number, userId: string): Promise<boolean>;

  // Workout Exercise methods
  getWorkoutExercises(workoutId: number): Promise<(WorkoutExercise & { exercise: Exercise })[]>;
  createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise>;
  updateWorkoutExercise(id: number, workoutExercise: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined>;
  deleteWorkoutExercise(id: number): Promise<boolean>;

  // Personal Record methods
  getPersonalRecords(userId: string): Promise<PersonalRecord[]>;
  getPersonalRecordsByExercise(exerciseId: number, userId: string): Promise<PersonalRecord[]>;
  createPersonalRecord(record: InsertPersonalRecord, userId: string): Promise<PersonalRecord>;

  // Analytics methods
  getWorkoutStats(userId: string): Promise<WorkoutStats>;
  getExerciseStats(userId: string): Promise<ExerciseStats[]>;

  // Monthly Goal methods
  getMonthlyGoal(userId: string, month: number, year: number): Promise<MonthlyGoal | undefined>;
  upsertMonthlyGoal(userId: string, month: number, year: number, targetWorkouts: number): Promise<MonthlyGoal>;
  getMonthlyGoalData(userId: string, month: number, year: number): Promise<MonthlyGoalData>;

  // Goal Photos methods
  createGoalPhoto(userId: string, month: number, year: number, imageUrl: string, type: 'before' | 'progress' | 'after', description?: string): Promise<GoalPhoto>;
  getGoalPhotos(userId: string, month: number, year: number): Promise<GoalPhoto[]>;
  getBeforePhoto(userId: string, month: number, year: number): Promise<GoalPhoto | undefined>;
  getLatestPhoto(userId: string, month: number, year: number): Promise<GoalPhoto | undefined>;
  deleteGoalPhoto(id: number, userId: string): Promise<boolean>;
  updateGoalPhoto(id: number, userId: string, description?: string): Promise<GoalPhoto | undefined>;
}

// Database connection - only initialize if DATABASE_URL is valid
let sql: any = null;
let db: any = null;

const initializeDatabase = () => {
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.log("Invalid or missing DATABASE_URL, skipping database initialization");
    return false;
  }
  
  try {
    sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql);
    return true;
  } catch (error) {
    console.log("Failed to initialize database:", error);
    return false;
  }
};

export class PostgresStorage implements IStorage {
  private isInitialized = false;
  private monthlyGoals: Map<string, MonthlyGoal>;

  constructor() {
    this.monthlyGoals = new Map();

    // Initialize with common exercises
    this.initializeDefaultExercises();
  }

  async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.initializeDefaultExercises();
      this.isInitialized = true;
    } catch (error) {
      console.log("Failed to initialize PostgreSQL storage:", error);
      throw error;
    }
  }

  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserGoal(userId: string, weeklyGoal: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        weeklyGoal, 
        goalSetAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  private async initializeDefaultExercises() {
    if (!db) throw new Error("Database not initialized");
    
    // Check if exercises already exist
    const existingExercises = await db.select().from(exercises).limit(1);
    if (existingExercises.length > 0) return;

    // Insert default exercises
    const defaultExercises = [
      { name: "Bench Press", category: "strength", muscleGroup: "Chest", instructions: "Lie on bench, lower bar to chest, press up", equipment: "Barbell" },
      { name: "Squat", category: "strength", muscleGroup: "Legs", instructions: "Stand with feet shoulder-width apart, squat down, stand up", equipment: "Barbell" },
      { name: "Deadlift", category: "strength", muscleGroup: "Back", instructions: "Lift barbell from ground to hip level", equipment: "Barbell" },
      { name: "Pull-ups", category: "strength", muscleGroup: "Back", instructions: "Hang from bar, pull body up until chin over bar", equipment: "Pull-up bar" },
      { name: "Push-ups", category: "strength", muscleGroup: "Chest", instructions: "Lower body to ground, push back up", equipment: "Bodyweight" },
      { name: "Running", category: "cardio", muscleGroup: "Full Body", instructions: "Run at steady pace", equipment: "None" },
      { name: "Cycling", category: "cardio", muscleGroup: "Legs", instructions: "Cycle at moderate intensity", equipment: "Bike" },
      { name: "Plank", category: "flexibility", muscleGroup: "Core", instructions: "Hold plank position", equipment: "None" },
    ];

    await db.insert(exercises).values(defaultExercises);
    console.log("Default exercises initialized in PostgreSQL");
  }

  async getExercises(): Promise<Exercise[]> {
    await this.ensureInitialized();
    return await db.select().from(exercises);
  }

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    const result = await db.select().from(exercises).where(eq(exercises.id, id));
    return result[0];
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return await db.select().from(exercises).where(eq(exercises.category, category));
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const result = await db.insert(exercises).values(exercise).returning();
    return result[0];
  }

  async updateExercise(id: number, updateData: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const result = await db.update(exercises).set(updateData).where(eq(exercises.id, id)).returning();
    return result[0];
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    return await db.select().from(exercises).where(ilike(exercises.name, `%${query}%`));
  }

  async getWorkouts(userId: string): Promise<Workout[]> {
    return await db.select().from(workouts).where(eq(workouts.userId, userId)).orderBy(desc(workouts.date));
  }

  async getWorkoutById(id: number, userId: string): Promise<WorkoutWithExercises | undefined> {
    const workout = await db.select().from(workouts).where(and(eq(workouts.id, id), eq(workouts.userId, userId)));
    if (workout.length === 0) return undefined;

    const exerciseList = await db
      .select({
        id: workoutExercises.id,
        workoutId: workoutExercises.workoutId,
        exerciseId: workoutExercises.exerciseId,
        sets: workoutExercises.sets,
        reps: workoutExercises.reps,
        weight: workoutExercises.weight,
        restTime: workoutExercises.restTime,
        notes: workoutExercises.notes,
        exercise: exercises
      })
      .from(workoutExercises)
      .leftJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
      .where(eq(workoutExercises.workoutId, id));

    return {
      ...workout[0],
      exercises: exerciseList
    };
  }

  async getWorkoutsByDateRange(startDate: string, endDate: string, userId: string): Promise<Workout[]> {
    return await db
      .select()
      .from(workouts)
      .where(and(
        gte(workouts.date, new Date(startDate)),
        lte(workouts.date, new Date(endDate)), 
        eq(workouts.userId, userId)
      ))
      .orderBy(desc(workouts.date));
  }

  async createWorkout(workout: InsertWorkout, userId: string): Promise<Workout> {
    const result = await db.insert(workouts).values({ ...workout, userId }).returning();
    return result[0];
  }

  async createWorkoutWithExercises(workoutData: CreateWorkoutWithExercises, userId: string): Promise<WorkoutWithExercises> {
    // Extract workout data and exercises
    const { exercises: exerciseData, ...workoutDetails } = workoutData;
    
    // Create the workout first
    const workoutResult = await db.insert(workouts).values({ ...workoutDetails, userId }).returning();
    const workout = workoutResult[0];
    
    // Create workout exercises if any
    const exerciseResults = [];
    if (exerciseData && exerciseData.length > 0) {
      for (const exercise of exerciseData) {
        if (exercise.exerciseId > 0) { // Only add valid exercises
          const exerciseResult = await db.insert(workoutExercises).values({
            ...exercise,
            workoutId: workout.id,
          }).returning();
          
          // Get exercise details
          const exerciseDetails = await db.select().from(exercises).where(eq(exercises.id, exercise.exerciseId));
          
          exerciseResults.push({
            ...exerciseResult[0],
            exercise: exerciseDetails[0]
          });
        }
      }
    }
    
    return {
      ...workout,
      exercises: exerciseResults
    };
  }

  async updateWorkout(id: number, updateData: Partial<InsertWorkout>, userId: string): Promise<Workout | undefined> {
    const result = await db.update(workouts).set(updateData).where(and(eq(workouts.id, id), eq(workouts.userId, userId))).returning();
    return result[0];
  }

  async deleteWorkout(id: number, userId: string): Promise<boolean> {
    // Delete workout exercises first
    await db.delete(workoutExercises).where(eq(workoutExercises.workoutId, id));
    // Then delete workout
    const result = await db.delete(workouts).where(and(eq(workouts.id, id), eq(workouts.userId, userId)));
    return result.rowsAffected > 0;
  }

  async getWorkoutExercises(workoutId: number): Promise<(WorkoutExercise & { exercise: Exercise })[]> {
    return await db
      .select({
        id: workoutExercises.id,
        workoutId: workoutExercises.workoutId,
        exerciseId: workoutExercises.exerciseId,
        sets: workoutExercises.sets,
        reps: workoutExercises.reps,
        weight: workoutExercises.weight,
        restTime: workoutExercises.restTime,
        notes: workoutExercises.notes,
        exercise: exercises
      })
      .from(workoutExercises)
      .leftJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
      .where(eq(workoutExercises.workoutId, workoutId));
  }

  async createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const result = await db.insert(workoutExercises).values(workoutExercise).returning();
    return result[0];
  }

  async updateWorkoutExercise(id: number, updateData: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined> {
    const result = await db.update(workoutExercises).set(updateData).where(eq(workoutExercises.id, id)).returning();
    return result[0];
  }

  async deleteWorkoutExercise(id: number): Promise<boolean> {
    const result = await db.delete(workoutExercises).where(eq(workoutExercises.id, id));
    return result.rowsAffected > 0;
  }

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    return await db.select().from(personalRecords).where(eq(personalRecords.userId, userId)).orderBy(desc(personalRecords.date));
  }

  async getPersonalRecordsByExercise(exerciseId: number, userId: string): Promise<PersonalRecord[]> {
    return await db
      .select()
      .from(personalRecords)
      .where(and(eq(personalRecords.exerciseId, exerciseId), eq(personalRecords.userId, userId)))
      .orderBy(desc(personalRecords.date));
  }

  async createPersonalRecord(record: InsertPersonalRecord, userId: string): Promise<PersonalRecord> {
    const result = await db.insert(personalRecords).values({ ...record, userId }).returning();
    return result[0];
  }

  async getWorkoutStats(userId: string): Promise<WorkoutStats> {
    await this.ensureInitialized();

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const totalWorkouts = await db.select({ count: drizzleSql<number>`count(*)` }).from(workouts).where(eq(workouts.userId, userId));
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const thisWeek = await db
      .select({ count: drizzleSql<number>`count(*)` })
      .from(workouts)
      .where(and(gte(workouts.date, startOfWeek), eq(workouts.userId, userId)));

    const recordsCount = await db.select({ count: drizzleSql<number>`count(*)` }).from(personalRecords).where(eq(personalRecords.userId, userId));

    // Calculate total volume (sum of sets * reps * weight)
    const volumeResult = await db
      .select({ 
        volume: drizzleSql<number>`COALESCE(SUM(${workoutExercises.sets} * ${workoutExercises.reps} * ${workoutExercises.weight}), 0)` 
      })
      .from(workoutExercises);

    // Check if user can set a new goal (once per week)
    const canSetNewGoal = !user?.goalSetAt || 
      new Date(user.goalSetAt) < startOfWeek;

    return {
      totalWorkouts: totalWorkouts[0]?.count || 0,
      thisWeek: thisWeek[0]?.count || 0,
      personalRecords: recordsCount[0]?.count || 0,
      totalVolume: volumeResult[0]?.volume || 0,
      weeklyGoal: user?.weeklyGoal || 4,
      averageDuration: 60,
      canSetNewGoal,
    };
  }

  async getExerciseStats(userId: string): Promise<ExerciseStats[]> {
    const stats = await db
      .select({
        exerciseId: exercises.id,
        exerciseName: exercises.name,
        totalVolume: drizzleSql<number>`COALESCE(SUM(${workoutExercises.sets} * ${workoutExercises.reps} * ${workoutExercises.weight}), 0)`,
        maxWeight: drizzleSql<number>`COALESCE(MAX(${workoutExercises.weight}), 0)`,
        totalSets: drizzleSql<number>`COALESCE(SUM(${workoutExercises.sets}), 0)`,
        lastPerformed: drizzleSql<string>`COALESCE(MAX(${workouts.date}), '')`
      })
      .from(exercises)
      .leftJoin(workoutExercises, eq(exercises.id, workoutExercises.exerciseId))
      .leftJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
      .where(eq(workouts.userId, userId))
      .groupBy(exercises.id, exercises.name);

    return stats;
  }

  // Monthly Goal methods
  async getMonthlyGoal(userId: string, month: number, year: number): Promise<MonthlyGoal | undefined> {
    const [goal] = await db.select().from(monthlyGoals).where(
      and(
        eq(monthlyGoals.userId, userId),
        eq(monthlyGoals.month, month),
        eq(monthlyGoals.year, year)
      )
    );
    return goal;
  }

  async upsertMonthlyGoal(userId: string, month: number, year: number, targetWorkouts: number): Promise<MonthlyGoal> {
    const [goal] = await db
      .insert(monthlyGoals)
      .values({
        userId,
        month,
        year,
        targetWorkouts,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [monthlyGoals.userId, monthlyGoals.month, monthlyGoals.year],
        set: {
          targetWorkouts,
          updatedAt: new Date()
        }
      })
      .returning();
    return goal;
  }

  async getMonthlyGoalData(userId: string, month: number, year: number): Promise<MonthlyGoalData> {
    const goal = await this.getMonthlyGoal(userId, month, year);
    
    // Get workouts for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const monthWorkouts = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          gte(workouts.date, startDate),
          lte(workouts.date, endDate)
        )
      );
    
    const workoutDates = monthWorkouts.map((w: any) => w.date.toISOString());
    const completedWorkouts = monthWorkouts.length;
    
    // Get goal photos
    const beforePhoto = await this.getBeforePhoto(userId, month, year);
    const latestPhoto = await this.getLatestPhoto(userId, month, year);
    
    return {
      month,
      year,
      targetWorkouts: goal?.targetWorkouts || 0,
      completedWorkouts,
      workoutDates,
      completionPercentage: goal?.targetWorkouts ? (completedWorkouts / goal.targetWorkouts) * 100 : 0,
      beforePhoto,
      latestPhoto
    };
  }

  // Goal Photos methods
  async createGoalPhoto(userId: string, month: number, year: number, imageUrl: string, type: 'before' | 'progress' | 'after', description?: string): Promise<GoalPhoto> {
    const [photo] = await db
      .insert(goalPhotos)
      .values({
        userId,
        month,
        year,
        imageUrl,
        type,
        description,
        timestamp: new Date()
      })
      .returning();
    return photo;
  }

  async getGoalPhotos(userId: string, month: number, year: number): Promise<GoalPhoto[]> {
    return await db
      .select()
      .from(goalPhotos)
      .where(
        and(
          eq(goalPhotos.userId, userId),
          eq(goalPhotos.month, month),
          eq(goalPhotos.year, year)
        )
      )
      .orderBy(goalPhotos.timestamp);
  }

  async getBeforePhoto(userId: string, month: number, year: number): Promise<GoalPhoto | undefined> {
    const [photo] = await db
      .select()
      .from(goalPhotos)
      .where(
        and(
          eq(goalPhotos.userId, userId),
          eq(goalPhotos.month, month),
          eq(goalPhotos.year, year),
          eq(goalPhotos.type, 'before')
        )
      )
      .orderBy(goalPhotos.timestamp)
      .limit(1);
    return photo;
  }

  async getLatestPhoto(userId: string, month: number, year: number): Promise<GoalPhoto | undefined> {
    const [photo] = await db
      .select()
      .from(goalPhotos)
      .where(
        and(
          eq(goalPhotos.userId, userId),
          eq(goalPhotos.month, month),
          eq(goalPhotos.year, year)
        )
      )
      .orderBy(desc(goalPhotos.timestamp))
      .limit(1);
    return photo;
  }

  async deleteGoalPhoto(id: number, userId: string): Promise<boolean> {
    const result = await db.delete(goalPhotos).where(and(eq(goalPhotos.id, id), eq(goalPhotos.userId, userId)));
    return result.rowsAffected > 0;
  }

  async updateGoalPhoto(id: number, userId: string, description?: string): Promise<GoalPhoto | undefined> {
    const [photo] = await db
      .update(goalPhotos)
      .set({ description })
      .where(and(eq(goalPhotos.id, id), eq(goalPhotos.userId, userId)))
      .returning();
    return photo;
  }
}

export class MemStorage implements IStorage {
  private monthlyGoals: Map<string, MonthlyGoal>;
  private goalPhotos: Map<number, GoalPhoto>;
  private users: Map<string, User>;
  private exercises: Map<number, Exercise>;
  private workouts: Map<number, Workout>;
  private workoutExercises: Map<number, WorkoutExercise>;
  private personalRecords: Map<number, PersonalRecord>;
  private currentExerciseId: number;
  private currentWorkoutId: number;
  private currentWorkoutExerciseId: number;
  private currentRecordId: number;
  private currentGoalPhotoId: number;

  constructor() {
    this.monthlyGoals = new Map();
    this.goalPhotos = new Map();
    this.users = new Map();
    this.exercises = new Map();
    this.workouts = new Map();
    this.workoutExercises = new Map();
    this.personalRecords = new Map();
    this.currentExerciseId = 1;
    this.currentWorkoutId = 1;
    this.currentWorkoutExerciseId = 1;
    this.currentRecordId = 1;
    this.currentGoalPhotoId = 1;

    // Initialize with common exercises
    this.initializeDefaultExercises();
  }

  async ensureInitialized(): Promise<void> {
    // No initialization needed for in-memory storage
  }

  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      id: userData.id,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      weeklyGoal: existingUser?.weeklyGoal || 4,
      goalSetAt: existingUser?.goalSetAt || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  async updateUserGoal(userId: string, weeklyGoal: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      weeklyGoal,
      goalSetAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  private initializeDefaultExercises() {
    const defaultExercises = [
      { 
        name: "Ab Wheel", 
        category: "strength", 
        muscleGroup: "Core", 
        instructions: "Roll forward while maintaining core tension, return to start", 
        equipment: "Ab Wheel",
        imageUrl: ""
      },
      { 
        name: "Arnold Press (Dumbbell)", 
        category: "strength", 
        muscleGroup: "Shoulders", 
        instructions: "Start with palms facing you, rotate and press overhead", 
        equipment: "Dumbbells",
        imageUrl: ""
      },
      { 
        name: "Back Extension", 
        category: "strength", 
        muscleGroup: "Back", 
        instructions: "Lie face down, lift chest and shoulders off ground", 
        equipment: "None",
        imageUrl: ""
      },
      { 
        name: "Ball Slams", 
        category: "cardio", 
        muscleGroup: "Full Body", 
        instructions: "Lift ball overhead, slam down with full force", 
        equipment: "Medicine Ball",
        imageUrl: ""
      },
      { 
        name: "Bench Press", 
        category: "strength", 
        muscleGroup: "Chest", 
        instructions: "Lie on bench, lower bar to chest, press up", 
        equipment: "Barbell",
        imageUrl: "/assets/bench_press.png"
      },
      { 
        name: "Squat", 
        category: "strength", 
        muscleGroup: "Legs", 
        instructions: "Stand with feet shoulder-width apart, squat down, stand up", 
        equipment: "Barbell",
        imageUrl: ""
      },
      { 
        name: "Aerobics", 
        category: "cardio", 
        muscleGroup: "Cardio", 
        instructions: "Perform rhythmic aerobic movements", 
        equipment: "None",
        imageUrl: ""
      },
      { 
        name: "Around the World", 
        category: "strength", 
        muscleGroup: "Chest", 
        instructions: "Move weights in circular motion around torso", 
        equipment: "Dumbbells",
        imageUrl: ""
      },
    ];

    defaultExercises.forEach(exercise => {
      const newExercise: Exercise = { 
        ...exercise, 
        id: this.currentExerciseId++,
        imageUrl: exercise.imageUrl || null
      };
      this.exercises.set(newExercise.id, newExercise);
    });
  }

  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(exercise => exercise.category === category);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const exercise: Exercise = { 
      ...insertExercise, 
      id: this.currentExerciseId++,
      instructions: insertExercise.instructions || null,
      equipment: insertExercise.equipment || null,
      imageUrl: insertExercise.imageUrl || null
    };
    this.exercises.set(exercise.id, exercise);
    return exercise;
  }

  async updateExercise(id: number, updateData: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const existingExercise = this.exercises.get(id);
    if (!existingExercise) return undefined;

    const updatedExercise: Exercise = {
      ...existingExercise,
      ...updateData,
      instructions: updateData.instructions !== undefined ? updateData.instructions : existingExercise.instructions,
      equipment: updateData.equipment !== undefined ? updateData.equipment : existingExercise.equipment,
      imageUrl: updateData.imageUrl !== undefined ? updateData.imageUrl : existingExercise.imageUrl,
    };
    
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.exercises.values()).filter(exercise => 
      exercise.name.toLowerCase().includes(lowerQuery) ||
      exercise.muscleGroup.toLowerCase().includes(lowerQuery) ||
      exercise.category.toLowerCase().includes(lowerQuery)
    );
  }

  async getWorkouts(userId: string): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getWorkoutById(id: number, userId: string): Promise<WorkoutWithExercises | undefined> {
    const workout = this.workouts.get(id);
    if (!workout || workout.userId !== userId) return undefined;

    const exercises = await this.getWorkoutExercises(id);
    return { ...workout, exercises };
  }

  async getWorkoutsByDateRange(startDate: string, endDate: string, userId: string): Promise<Workout[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return Array.from(this.workouts.values()).filter(workout => {
      const workoutDate = new Date(workout.date);
      return workout.userId === userId && workoutDate >= start && workoutDate <= end;
    });
  }

  async createWorkout(insertWorkout: InsertWorkout, userId: string): Promise<Workout> {
    const workout: Workout = { 
      ...insertWorkout, 
      id: this.currentWorkoutId++,
      userId,
      date: new Date(),
      duration: insertWorkout.duration || null,
      notes: insertWorkout.notes || null,
      imageUrl: insertWorkout.imageUrl || null
    };
    this.workouts.set(workout.id, workout);
    return workout;
  }

  async createWorkoutWithExercises(workoutData: CreateWorkoutWithExercises, userId: string): Promise<WorkoutWithExercises> {
    // Extract workout data and exercises
    const { exercises: exerciseData, ...workoutDetails } = workoutData;
    
    // Create the workout first
    const workout: Workout = { 
      ...workoutDetails, 
      id: this.currentWorkoutId++,
      userId,
      date: new Date(),
      duration: workoutDetails.duration || null,
      notes: workoutDetails.notes || null,
      imageUrl: workoutDetails.imageUrl || null
    };
    this.workouts.set(workout.id, workout);
    
    // Create workout exercises if any
    const exerciseResults = [];
    if (exerciseData && exerciseData.length > 0) {
      for (const exercise of exerciseData) {
        if (exercise.exerciseId > 0) { // Only add valid exercises
          const workoutExercise: WorkoutExercise = { 
            ...exercise, 
            id: this.currentWorkoutExerciseId++,
            workoutId: workout.id,
            reps: exercise.reps || null,
            weight: exercise.weight || null,
            restTime: exercise.restTime || null,
            notes: exercise.notes || null
          };
          this.workoutExercises.set(workoutExercise.id, workoutExercise);
          
          // Get exercise details
          const exerciseDetails = this.exercises.get(exercise.exerciseId);
          if (exerciseDetails) {
            exerciseResults.push({
              ...workoutExercise,
              exercise: exerciseDetails
            });
          }
        }
      }
    }
    
    return {
      ...workout,
      exercises: exerciseResults
    };
  }

  async updateWorkout(id: number, updateData: Partial<InsertWorkout>, userId: string): Promise<Workout | undefined> {
    const workout = this.workouts.get(id);
    if (!workout || workout.userId !== userId) return undefined;

    const updatedWorkout = { ...workout, ...updateData };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  async deleteWorkout(id: number, userId: string): Promise<boolean> {
    const workout = this.workouts.get(id);
    if (!workout || workout.userId !== userId) return false;

    // Also delete associated workout exercises
    const workoutExercises = Array.from(this.workoutExercises.values())
      .filter(we => we.workoutId === id);
    
    workoutExercises.forEach(we => this.workoutExercises.delete(we.id));
    
    return this.workouts.delete(id);
  }

  async getWorkoutExercises(workoutId: number): Promise<(WorkoutExercise & { exercise: Exercise })[]> {
    const workoutExercises = Array.from(this.workoutExercises.values())
      .filter(we => we.workoutId === workoutId);
    
    const result = [];
    for (const we of workoutExercises) {
      const exercise = this.exercises.get(we.exerciseId);
      if (exercise) {
        result.push({ ...we, exercise });
      }
    }
    
    return result;
  }

  async createWorkoutExercise(insertWorkoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const workoutExercise: WorkoutExercise = { 
      ...insertWorkoutExercise, 
      id: this.currentWorkoutExerciseId++,
      reps: insertWorkoutExercise.reps || null,
      weight: insertWorkoutExercise.weight || null,
      restTime: insertWorkoutExercise.restTime || null,
      notes: insertWorkoutExercise.notes || null
    };
    this.workoutExercises.set(workoutExercise.id, workoutExercise);
    return workoutExercise;
  }

  async updateWorkoutExercise(id: number, updateData: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined> {
    const workoutExercise = this.workoutExercises.get(id);
    if (!workoutExercise) return undefined;

    const updated = { ...workoutExercise, ...updateData };
    this.workoutExercises.set(id, updated);
    return updated;
  }

  async deleteWorkoutExercise(id: number): Promise<boolean> {
    return this.workoutExercises.delete(id);
  }

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    return Array.from(this.personalRecords.values())
      .filter(pr => pr.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getPersonalRecordsByExercise(exerciseId: number, userId: string): Promise<PersonalRecord[]> {
    return Array.from(this.personalRecords.values())
      .filter(pr => pr.exerciseId === exerciseId && pr.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createPersonalRecord(insertRecord: InsertPersonalRecord, userId: string): Promise<PersonalRecord> {
    const record: PersonalRecord = { 
      ...insertRecord, 
      id: this.currentRecordId++,
      userId,
      date: new Date()
    };
    this.personalRecords.set(record.id, record);
    return record;
  }

  async getWorkoutStats(userId: string): Promise<WorkoutStats> {
    const user = this.users.get(userId);
    const userWorkouts = Array.from(this.workouts.values()).filter(w => w.userId === userId);
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekWorkouts = userWorkouts.filter(workout => 
      new Date(workout.date) >= weekStart
    );

    const userRecords = Array.from(this.personalRecords.values()).filter(pr => pr.userId === userId);

    const totalVolume = Array.from(this.workoutExercises.values())
      .filter(we => {
        const workout = this.workouts.get(we.workoutId);
        return workout?.userId === userId;
      })
      .reduce((sum, we) => {
        const weight = parseFloat(we.weight || "0");
        const sets = we.sets || 0;
        const reps = parseInt(we.reps?.split("-")[0] || "0");
        return sum + (weight * sets * reps);
      }, 0);

    // Check if user can set a new goal (once per week)
    const canSetNewGoal = !user?.goalSetAt || 
      new Date(user.goalSetAt) < weekStart;

    return {
      totalWorkouts: userWorkouts.length,
      thisWeek: thisWeekWorkouts.length,
      personalRecords: userRecords.length,
      totalVolume,
      weeklyGoal: user?.weeklyGoal || 4,
      averageDuration: userWorkouts.length > 0 
        ? userWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / userWorkouts.length 
        : 0,
      canSetNewGoal,
    };
  }

  async getExerciseStats(userId: string): Promise<ExerciseStats[]> {
    const exerciseMap = new Map<number, ExerciseStats>();
    
    for (const we of Array.from(this.workoutExercises.values())) {
      const workout = this.workouts.get(we.workoutId);
      if (!workout || workout.userId !== userId) continue;

      const exercise = this.exercises.get(we.exerciseId);
      if (!exercise) continue;

      const weight = parseFloat(we.weight || "0");
      const sets = we.sets || 0;
      const reps = parseInt(we.reps?.split("-")[0] || "0");
      const volume = weight * sets * reps;

      if (!exerciseMap.has(we.exerciseId)) {
        exerciseMap.set(we.exerciseId, {
          exerciseId: we.exerciseId,
          exerciseName: exercise.name,
          totalVolume: 0,
          maxWeight: 0,
          totalSets: 0,
          lastPerformed: workout.date.toISOString()
        });
      }

      const stats = exerciseMap.get(we.exerciseId)!;
      stats.totalVolume += volume;
      stats.maxWeight = Math.max(stats.maxWeight, weight);
      stats.totalSets += sets;
      if (new Date(workout.date) > new Date(stats.lastPerformed)) {
        stats.lastPerformed = workout.date.toISOString();
      }
    }

    return Array.from(exerciseMap.values());
  }

  // Monthly Goal methods
  async getMonthlyGoal(userId: string, month: number, year: number): Promise<MonthlyGoal | undefined> {
    const key = `${userId}-${year}-${month}`;
    return this.monthlyGoals.get(key);
  }

  async upsertMonthlyGoal(userId: string, month: number, year: number, targetWorkouts: number): Promise<MonthlyGoal> {
    const key = `${userId}-${year}-${month}`;
    const existingGoal = this.monthlyGoals.get(key);
    
    const goal: MonthlyGoal = {
      id: existingGoal?.id || Date.now(),
      userId,
      month,
      year,
      targetWorkouts,
      completedWorkouts: null,
      createdAt: existingGoal?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    this.monthlyGoals.set(key, goal);
    return goal;
  }

  async getMonthlyGoalData(userId: string, month: number, year: number): Promise<MonthlyGoalData> {
    const goal = await this.getMonthlyGoal(userId, month, year);
    
    // Get workouts for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const workouts = Array.from(this.workouts.values()).filter(w => 
      w.userId === userId && 
      new Date(w.date) >= startDate && 
      new Date(w.date) <= endDate
    );
    
    const workoutDates = workouts.map(w => w.date.toISOString());
    const completedWorkouts = workouts.length;
    
    // Get goal photos
    const beforePhoto = await this.getBeforePhoto(userId, month, year);
    const latestPhoto = await this.getLatestPhoto(userId, month, year);
    
    return {
      month,
      year,
      targetWorkouts: goal?.targetWorkouts || 0,
      completedWorkouts,
      workoutDates,
      completionPercentage: goal?.targetWorkouts ? (completedWorkouts / goal.targetWorkouts) * 100 : 0,
      beforePhoto,
      latestPhoto
    };
  }

  // Goal Photos methods
  async createGoalPhoto(userId: string, month: number, year: number, imageUrl: string, type: 'before' | 'progress' | 'after', description?: string): Promise<GoalPhoto> {
    const photo: GoalPhoto = {
      id: this.currentGoalPhotoId++,
      userId,
      month,
      year,
      imageUrl,
      type,
      description: description || null,
      timestamp: new Date()
    };
    
    this.goalPhotos.set(photo.id, photo);
    return photo;
  }

  async getGoalPhotos(userId: string, month: number, year: number): Promise<GoalPhoto[]> {
    return Array.from(this.goalPhotos.values())
      .filter(p => p.userId === userId && p.month === month && p.year === year)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getBeforePhoto(userId: string, month: number, year: number): Promise<GoalPhoto | undefined> {
    return Array.from(this.goalPhotos.values())
      .find(p => p.userId === userId && p.month === month && p.year === year && p.type === 'before');
  }

  async getLatestPhoto(userId: string, month: number, year: number): Promise<GoalPhoto | undefined> {
    const photos = Array.from(this.goalPhotos.values())
      .filter(p => p.userId === userId && p.month === month && p.year === year)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return photos[0];
  }

  async deleteGoalPhoto(id: number, userId: string): Promise<boolean> {
    const photo = this.goalPhotos.get(id);
    if (!photo || photo.userId !== userId) return false;
    return this.goalPhotos.delete(id);
  }

  async updateGoalPhoto(id: number, userId: string, description?: string): Promise<GoalPhoto | undefined> {
    const photo = this.goalPhotos.get(id);
    if (!photo || photo.userId !== userId) return undefined;
    
    const updatedPhoto = { ...photo, description: description || null };
    this.goalPhotos.set(id, updatedPhoto);
    return updatedPhoto;
  }
}

// Manual migration function since drizzle-kit migrate is failing
async function ensureTablesExist() {
  try {
    // Create sessions table for Replit Auth
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);`;

    // Create users table for Replit Auth
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        muscle_group VARCHAR(100) NOT NULL,
        instructions TEXT,
        equipment VARCHAR(100)
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS workouts (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        date TIMESTAMP NOT NULL,
        duration INTEGER,
        category VARCHAR(100),
        notes TEXT
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id SERIAL PRIMARY KEY,
        workout_id INTEGER REFERENCES workouts(id),
        exercise_id INTEGER REFERENCES exercises(id),
        sets INTEGER NOT NULL,
        reps VARCHAR,
        weight VARCHAR,
        rest_time INTEGER,
        notes TEXT
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS personal_records (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        exercise_id INTEGER REFERENCES exercises(id),
        weight NUMERIC NOT NULL,
        reps INTEGER NOT NULL,
        date TIMESTAMP NOT NULL
      );
    `;
    
    console.log("Database tables ensured");
  } catch (error) {
    console.log("Tables may already exist:", error);
  }
}

// Initialize database and create storage instance
let storageInstance: IStorage | null = null;

const initStorage = async (): Promise<IStorage> => {
  if (storageInstance) return storageInstance;
  
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    try {
      const dbInitialized = initializeDatabase();
      if (dbInitialized) {
        // Test the connection first
        await sql`SELECT 1`;
        await ensureTablesExist();
        storageInstance = new PostgresStorage();
        console.log("Successfully connected to PostgreSQL database");
        return storageInstance;
      }
    } catch (error) {
      console.log("Failed to connect to PostgreSQL, falling back to memory storage:", error);
    }
  }
  
  console.log("Using memory storage");
  storageInstance = new MemStorage();
  return storageInstance;
};

export const getStorage = async (): Promise<IStorage> => {
  // Use singleton to ensure data persistence across requests
  if (storageInstance) {
    return storageInstance;
  }
  
  console.log("Using memory storage for reliable operation");
  storageInstance = new MemStorage();
  return storageInstance;
};
