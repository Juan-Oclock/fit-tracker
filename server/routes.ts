import type { Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./storage";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import { exportUserData } from './routes/export.js';
import { clearUserData } from './routes/clear-data.js';
import { 
  insertExerciseSchema, 
  insertWorkoutSchema, 
  createWorkoutWithExercisesSchema,
  insertWorkoutExerciseSchema, 
  insertPersonalRecordSchema,
  updateGoalSchema,
  insertMonthlyGoalSchema,
  insertCategorySchema,
  insertQuoteSchema // Add this missing import
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const storage = await getStorage();
      
      // Create or update user in our database
      const user = await storage.upsertUser({
        id: userId,
        email: req.user.email,
        firstName: req.user.user_metadata?.first_name || null,
        lastName: req.user.user_metadata?.last_name || null,
        profileImageUrl: req.user.user_metadata?.avatar_url || null,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Goal management route
  app.put('/api/user/goal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const storage = await getStorage();
      const validatedData = updateGoalSchema.parse(req.body);
      
      // First ensure user exists in our database
      await storage.upsertUser({
        id: userId,
        email: req.user.email,
        firstName: req.user.user_metadata?.first_name || null,
        lastName: req.user.user_metadata?.last_name || null,
        profileImageUrl: req.user.user_metadata?.avatar_url || null,
      });
      
      const updatedUser = await storage.updateUserGoal(userId, validatedData.weeklyGoal);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Exercise routes (public - no auth required)
  app.get("/api/exercises", async (req, res) => {
    try {
      const storage = await getStorage();
      const { category, search } = req.query;
      
      if (search) {
        const exercises = await storage.searchExercises(search as string);
        res.json(exercises);
      } else if (category) {
        const exercises = await storage.getExercisesByCategory(category as string);
        res.json(exercises);
      } else {
        const exercises = await storage.getExercises();
        res.json(exercises);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const id = parseInt(req.params.id);
      const exercise = await storage.getExerciseById(id);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const storage = await getStorage();
      const validatedData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(validatedData);
      res.status(201).json(exercise);
    } catch (error) {
      res.status(400).json({ message: "Invalid exercise data" });
    }
  });

  app.put("/api/exercises/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const id = parseInt(req.params.id);
      const validatedData = insertExerciseSchema.partial().parse(req.body);
      const exercise = await storage.updateExercise(id, validatedData);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ message: "Invalid exercise data" });
    }
  });

  app.delete("/api/exercises/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExercise(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage === "Cannot delete exercise that is used in workouts") {
        res.status(400).json({ message: "Cannot delete exercise that is used in workouts" });
      } else {
        res.status(500).json({ message: "Failed to delete exercise" });
      }
    }
  });

  // Add these routes after the exercise routes
  // Category routes (public - no auth required for reading)
  app.get("/api/categories", async (req, res) => {
    try {
      const storage = await getStorage();
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: "Failed to fetch categories", error: errorMessage });
    }
  });
  
  app.post("/api/categories", async (req, res) => {
    try {
      console.log("POST /api/categories - Request body:", req.body);
      const storage = await getStorage();
      console.log("Storage obtained successfully");
      const validatedData = insertCategorySchema.parse(req.body);
      console.log("Data validated successfully:", validatedData);
      const category = await storage.createCategory(validatedData);
      console.log("Category created successfully:", category);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error in POST /api/categories:", error);
      res.status(400).json({ message: "Invalid category data or category already exists" });
    }
  });
  
  app.put("/api/categories/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, validatedData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error: any) {
      console.error("Error updating category:", error);
      
      // Handle specific database errors
      if (error?.code === '23505' || error?.message?.includes('unique constraint')) {
        return res.status(409).json({ 
          message: `A category with this name already exists. Please choose a different name.` 
        });
      }
      
      // Handle validation errors from Zod
      if (error?.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid category data: " + error.errors.map((e: any) => e.message).join(", ")
        });
      }
      
      // Handle other database constraint errors
      if (error?.code?.startsWith('23')) {
        return res.status(400).json({ message: "Database constraint violation" });
      }
      
      // Generic error fallback
      res.status(500).json({ message: "Internal server error while updating category" });
    }
  });
  
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting category:", error);
      
      // Handle foreign key constraint violations
      if (error?.code === '23503') {
        return res.status(409).json({ 
          message: "Cannot delete category because it is being used by exercises or workouts" 
        });
      }
      
      // Handle other database constraint errors
      if (error?.code?.startsWith('23')) {
        return res.status(400).json({ message: "Database constraint violation" });
      }
      
      // Generic error fallback
      res.status(500).json({ message: "Internal server error while deleting category" });
    }
  });

  // Muscle Groups routes (protected)
  app.get("/api/muscle-groups", isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const muscleGroups = await storage.getMuscleGroups();
      res.json(muscleGroups);
    } catch (error) {
      console.error("Error fetching muscle groups:", error);
      res.status(500).json({ message: "Failed to fetch muscle groups" });
    }
  });

  app.post("/api/muscle-groups", isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const muscleGroup = await storage.createMuscleGroup(req.body);
      res.status(201).json(muscleGroup);
    } catch (error) {
      console.error("Error creating muscle group:", error);
      
      // Handle unique constraint violations
      if (error?.code === '23505') {
        return res.status(409).json({ 
          message: "A muscle group with this name already exists. Please choose a different name." 
        });
      }
      
      // Handle validation errors
      if (error?.code?.startsWith('23')) {
        return res.status(400).json({ message: "Invalid muscle group data" });
      }
      
      res.status(500).json({ message: "Failed to create muscle group" });
    }
  });

  app.put("/api/muscle-groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid muscle group ID" });
      }
      
      const storage = await getStorage();
      const muscleGroup = await storage.updateMuscleGroup(id, req.body);
      
      if (!muscleGroup) {
        return res.status(404).json({ message: "Muscle group not found. It may have been deleted by another user." });
      }
      
      res.json(muscleGroup);
    } catch (error) {
      console.error("Error updating muscle group:", error);
      
      // Handle unique constraint violations
      if (error?.code === '23505') {
        return res.status(409).json({ 
          message: "A muscle group with this name already exists. Please choose a different name." 
        });
      }
      
      // Handle validation errors
      if (error?.code?.startsWith('23')) {
        return res.status(400).json({ message: "Invalid muscle group data" });
      }
      
      res.status(500).json({ message: "Failed to update muscle group" });
    }
  });

  app.delete("/api/muscle-groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid muscle group ID" });
      }
      
      const storage = await getStorage();
      const success = await storage.deleteMuscleGroup(id);
      
      if (!success) {
        return res.status(404).json({ message: "Muscle group not found. It may have already been deleted." });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting muscle group:", error);
      
      // Handle foreign key constraint violations
      if (error?.code === '23503') {
        return res.status(409).json({ 
          message: "Cannot delete muscle group because it is being used by exercises" 
        });
      }
      
      // Handle other database constraint errors
      if (error?.code?.startsWith('23')) {
        return res.status(400).json({ message: "Database constraint violation" });
      }
      
      // Generic error fallback
      res.status(500).json({ message: "Internal server error while deleting muscle group" });
    }
  });

  // Workout routes (protected)
  app.get("/api/workouts", isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
      
      if (startDate && endDate) {
        const workouts = await storage.getWorkoutsByDateRange(
          startDate as string, 
          endDate as string,
          userId
        );
        res.json(workouts);
      } else {
        const userId = (req as any).user.id; // Fix: Cast to any to access user.id
        const workouts = await storage.getWorkouts(userId);
        res.json(workouts);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get("/api/workouts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const workout = await storage.getWorkoutById(id, userId);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  app.post("/api/workouts", isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const userId = req.user.id;
      
      console.log("Received workout data:", JSON.stringify(req.body, null, 2));
      
      // Check if the request contains exercises (new format) or is a simple workout (legacy)
      if (req.body.exercises !== undefined) {
        // New format: workout with exercises
        console.log("Validating workout with exercises...");
        const validatedData = createWorkoutWithExercisesSchema.parse(req.body);
        console.log("Validation successful, creating workout...");
        const workout = await storage.createWorkoutWithExercises(validatedData, userId);
        res.status(201).json(workout);
      } else {
        // Legacy format: simple workout
        console.log("Validating simple workout...");
        const validatedData = insertWorkoutSchema.parse(req.body);
        const workout = await storage.createWorkout(validatedData, userId);
        res.status(201).json(workout);
      }
    } catch (error) {
      console.error("Workout creation error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      res.status(400).json({ message: "Invalid workout data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put("/api/workouts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const validatedData = insertWorkoutSchema.partial().parse(req.body);
      const workout = await storage.updateWorkout(id, validatedData, userId);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      res.json(workout);
    } catch (error) {
      res.status(400).json({ message: "Invalid workout data" });
    }
  });

  app.delete("/api/workouts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorkout(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workout" });
    }
  });

  // Workout Exercise routes
  app.get("/api/workouts/:workoutId/exercises", async (req, res) => {
    try {
      const storage = await getStorage();
      const workoutId = parseInt(req.params.workoutId);
      const exercises = await storage.getWorkoutExercises(workoutId);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout exercises" });
    }
  });

  app.post("/api/workout-exercises", async (req, res) => {
    try {
      const storage = await getStorage();
      const validatedData = insertWorkoutExerciseSchema.parse(req.body);
      const workoutExercise = await storage.createWorkoutExercise(validatedData);
      res.status(201).json(workoutExercise);
    } catch (error) {
      res.status(400).json({ message: "Invalid workout exercise data" });
    }
  });

  app.put("/api/workout-exercises/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const id = parseInt(req.params.id);
      const validatedData = insertWorkoutExerciseSchema.partial().parse(req.body);
      const workoutExercise = await storage.updateWorkoutExercise(id, validatedData);
      
      if (!workoutExercise) {
        return res.status(404).json({ message: "Workout exercise not found" });
      }
      
      res.json(workoutExercise);
    } catch (error) {
      res.status(400).json({ message: "Invalid workout exercise data" });
    }
  });

  app.delete("/api/workout-exercises/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorkoutExercise(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Workout exercise not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workout exercise" });
    }
  });

  // Personal Records routes (protected)
  app.get("/api/personal-records", isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const userId = req.user.id;
      const { exerciseId } = req.query;
      
      if (exerciseId) {
        const records = await storage.getPersonalRecordsByExercise(parseInt(exerciseId as string), userId);
        res.json(records);
      } else {
        const records = await storage.getPersonalRecords(userId);
        res.json(records);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch personal records" });
    }
  });

  app.post("/api/personal-records", isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const userId = req.user.id;
      const validatedData = insertPersonalRecordSchema.parse(req.body);
      const record = await storage.createPersonalRecord(validatedData, userId);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ message: "Invalid personal record data" });
    }
  });

  // Analytics routes (protected)
  app.get("/api/stats/workouts", isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const userId = req.user.id;
      console.log('Fetching workout stats for user:', userId);
      
      // Ensure user exists in storage before getting stats
      await storage.upsertUser({
        id: userId,
        email: req.user.email,
        firstName: req.user.user_metadata?.first_name || null,
        lastName: req.user.user_metadata?.last_name || null,
        profileImageUrl: req.user.user_metadata?.avatar_url || null,
      });
      
      const stats = await storage.getWorkoutStats(userId);
      console.log('Workout stats result:', stats);
      res.json(stats);
    } catch (error) {
      console.error("Error in /api/stats/workouts:", error);
      res.status(500).json({ message: "Failed to fetch workout stats" });
    }
  });

  app.get("/api/stats/exercises", isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const userId = req.user.id;
      const stats = await storage.getExerciseStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise stats" });
    }
  });

  // Monthly Goals
  app.get("/api/goals/monthly", isAuthenticated, async (req: any, res) => {
    const user = (req as any).user; // Cast to any to access user properties
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required" });
    }
  
    try {
      const storage = await getStorage();
      const monthlyGoalData = await storage.getMonthlyGoalData(user.id, parseInt(month as string), parseInt(year as string));
      return res.json(monthlyGoalData);
    } catch (error) {
      console.error("Error fetching monthly goal data:", error);
      return res.status(500).json({ error: "Failed to fetch monthly goal data" });
    }
  });

  app.put("/api/goals/monthly", isAuthenticated, async (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Create a custom validation schema that excludes userId (server will add it)
      const clientGoalSchema = insertMonthlyGoalSchema.omit({ userId: true });
      const validatedData = clientGoalSchema.parse(req.body);
      const { month, year, targetWorkouts } = validatedData;
      
      const storage = await getStorage();
      const goal = await storage.upsertMonthlyGoal(user.id, month, year, targetWorkouts);
      return res.json(goal);
    } catch (error: any) {
      console.error("Error updating monthly goal:", error);
      // Check if it's a validation error
      if (error?.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to update monthly goal" });
    }
  });

  // Add after the monthly goals routes around line 388
  // Quote routes (admin only for CRUD, public for daily quote)
  app.get("/api/quotes", async (req, res) => {
    try {
      const storage = await getStorage();
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/daily", async (req, res) => {
    try {
      const storage = await getStorage();
      const quote = await storage.getDailyQuote();
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily quote" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const storage = await getStorage();
      const validatedData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(validatedData);
      res.status(201).json(quote);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote data" });
    }
  });

  app.put("/api/quotes/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const id = parseInt(req.params.id);
      const validatedData = insertQuoteSchema.partial().parse(req.body);
      const quote = await storage.updateQuote(id, validatedData);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote data" });
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteQuote(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quote" });
    }
  });

  // Future: Import quotes from API
  app.post("/api/quotes/import", async (req, res) => {
    try {
      const storage = await getStorage();
      const { source } = req.body; // 'quotable' or 'zenquotes'
      
      // This will be implemented later
      res.status(501).json({ message: "Import feature coming soon" });
    } catch (error) {
      res.status(500).json({ message: "Failed to import quotes" });
    }
  });

  // Goal Photos routes
  app.post("/api/goals/photos", isAuthenticated, async (req: any, res) => {
    try {
      const { month, year, imageUrl, type, description } = req.body;
      const userId = req.user.id;
      
      const storage = await getStorage();
      const photo = await storage.createGoalPhoto(userId, month, year, imageUrl, type, description);
      
      res.status(201).json(photo);
    } catch (error) {
      console.error("Error creating goal photo:", error);
      res.status(500).json({ error: "Failed to create goal photo" });
    }
  });
  
  app.get("/api/goals/photos/:month/:year", isAuthenticated, async (req: any, res) => {
    try {
      const month = parseInt(req.params.month);
      const year = parseInt(req.params.year);
      const userId = req.user.id;
      
      const storage = await getStorage();
      const photos = await storage.getGoalPhotos(userId, month, year);
      
      res.json(photos);
    } catch (error) {
      console.error("Error fetching goal photos:", error);
      res.status(500).json({ error: "Failed to fetch goal photos" });
    }
  });

  // Delete goal photo endpoint
  app.delete("/api/goals/photos/:photoId", isAuthenticated, async (req: any, res) => {
    try {
      const photoId = parseInt(req.params.photoId);
      const userId = req.user.id;
      
      console.log(`[Delete Goal Photo] User ${userId} attempting to delete photo ${photoId}`);
      
      const storage = await getStorage();
      const deleted = await storage.deleteGoalPhoto(photoId, userId);
      
      if (deleted) {
        console.log(`[Delete Goal Photo] Successfully deleted photo ${photoId} for user ${userId}`);
        res.json({ success: true, message: "Goal photo deleted successfully" });
      } else {
        console.log(`[Delete Goal Photo] Failed to delete photo ${photoId} for user ${userId} - photo not found or unauthorized`);
        res.status(404).json({ error: "Goal photo not found or unauthorized" });
      }
    } catch (error) {
      console.error("Error deleting goal photo:", error);
      res.status(500).json({ error: "Failed to delete goal photo" });
    }
  });

  // Add this after the existing workout routes
  app.get('/api/workouts-with-exercises', isAuthenticated, async (req: any, res) => {
  try {
    const storage = await getStorage(); // This line was missing!
    const workouts = await storage.getWorkoutsWithExercises(req.user.id);
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts with exercises:', error);
    res.status(500).json({ error: 'Failed to fetch workouts with exercises' });
  }
});

  // Debug endpoint to check workout duration data
  app.get('/api/debug/workouts', isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const workouts = await storage.getWorkoutsWithExercises(req.user.id);
      
      const debugData = workouts.map(workout => ({
        id: workout.id,
        name: workout.name,
        duration: workout.duration,
        exerciseCount: workout.exercises?.length || 0,
        totalExerciseDuration: workout.exercises?.reduce((sum, ex) => sum + (ex.durationSeconds || 0), 0) || 0
      }));
      
      res.json(debugData);
    } catch (error) {
      console.error('Error in debug endpoint:', error);
      res.status(500).json({ error: 'Debug endpoint failed' });
    }
  });

  // Fix endpoint to update existing workout durations
  app.post('/api/fix/workout-durations', isAuthenticated, async (req: any, res) => {
    try {
      const storage = await getStorage();
      const workouts = await storage.getWorkoutsWithExercises(req.user.id);
      
      let updatedCount = 0;
      
      for (const workout of workouts) {
        // Only update if duration is null, 0, or missing
        if (!workout.duration || workout.duration === 0) {
          const totalExerciseDurationSeconds = workout.exercises?.reduce((sum, ex) => sum + (ex.durationSeconds || 0), 0) || 0;
          
          if (totalExerciseDurationSeconds > 0) {
            const durationMinutes = Math.round(totalExerciseDurationSeconds / 60);
            await storage.updateWorkoutDuration(workout.id, durationMinutes);
            updatedCount++;
          }
        }
      }
      
      res.json({ message: `Updated ${updatedCount} workouts with calculated durations` });
    } catch (error) {
      console.error('Error fixing workout durations:', error);
      res.status(500).json({ error: 'Failed to fix workout durations' });
    }
  });

  // Community presence endpoint for updating user activity feed
  app.post('/api/community/presence', isAuthenticated, async (req: any, res) => {
    try {
      const { workoutName, exerciseNames } = req.body;
      
      if (!workoutName || !Array.isArray(exerciseNames)) {
        return res.status(400).json({ error: 'workoutName and exerciseNames array are required' });
      }
      
      const storage = await getStorage();
      
      // Get user profile data
      const userProfile = await storage.getUserProfile(req.user.id);
      const username = userProfile?.username || req.user.email || 'Anonymous';
      const profileImageUrl = userProfile?.profile_image_url || null;
      
      // Check if user is opted in for community sharing
      const showInCommunity = userProfile?.show_in_community || false;
      if (!showInCommunity) {
        return res.status(200).json({ message: 'User not opted in for community sharing' });
      }
      
      // Upsert community presence
      await storage.upsertCommunityPresence({
        userId: req.user.id,
        username,
        profileImageUrl,
        workoutName,
        exerciseNames: exerciseNames.join(', '),
        lastActive: new Date().toISOString()
      });
      
      res.json({ success: true, message: 'Community presence updated successfully' });
    } catch (error) {
      console.error('Error updating community presence:', error);
      res.status(500).json({ error: 'Failed to update community presence' });
    }
  });

  // Export user data endpoint
  app.get('/api/export/data', isAuthenticated, exportUserData);

  // Clear all user data endpoint
  app.delete('/api/clear/data', isAuthenticated, clearUserData);

  const httpServer = createServer(app);
  return httpServer;
}