-- Add duration_seconds column to workout_exercises table
ALTER TABLE "workout_exercises" ADD COLUMN "duration_seconds" integer DEFAULT 0 NOT NULL;
