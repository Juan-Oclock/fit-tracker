import type { Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./storage";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import { 
  insertExerciseSchema, 
  insertWorkoutSchema, 
  createWorkoutWithExercisesSchema,
  insertWorkoutExerciseSchema, 
  insertPersonalRecordSchema,
  updateGoalSchema
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
      
      // Check if the request contains exercises (new format) or is a simple workout (legacy)
      if (req.body.exercises !== undefined) {
        // New format: workout with exercises
        const validatedData = createWorkoutWithExercisesSchema.parse(req.body);
        const workout = await storage.createWorkoutWithExercises(validatedData, userId);
        res.status(201).json(workout);
      } else {
        // Legacy format: simple workout
        const validatedData = insertWorkoutSchema.parse(req.body);
        const workout = await storage.createWorkout(validatedData, userId);
        res.status(201).json(workout);
      }
    } catch (error) {
      console.error("Workout creation error:", error);
      res.status(400).json({ message: "Invalid workout data" });
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
      const stats = await storage.getWorkoutStats(userId);
      res.json(stats);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}