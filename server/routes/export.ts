import { Request, Response } from "express";
import { getStorage } from "../storage";

export async function exportUserData(req: any, res: Response) {
  try {
    console.log('Export endpoint called for user:', req.user?.id);
    const userId = req.user?.id;
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ error: "Unauthorized" });
    }

    const storage = await getStorage();
    
    // Fetch all user data
    const [
      workoutsWithExercises,
      personalRecords,
      userProfile,
      monthlyGoals
    ] = await Promise.all([
      storage.getWorkoutsWithExercises(userId),
      storage.getPersonalRecords(userId),
      storage.getUserProfile(userId),
      // Get monthly goals for current year and previous year
      Promise.all([
        ...Array.from({ length: 12 }, (_, i) => 
          storage.getMonthlyGoal(userId, i + 1, new Date().getFullYear())
        ),
        ...Array.from({ length: 12 }, (_, i) => 
          storage.getMonthlyGoal(userId, i + 1, new Date().getFullYear() - 1)
        )
      ]).then(goals => goals.filter(Boolean))
    ]);

    // Prepare CSV data structure
    const csvData = {
      workouts: [] as any[],
      exercises: [] as any[],
      personalRecords: [] as any[],
      profile: userProfile,
      monthlyGoals: monthlyGoals
    };

    // Process workouts and exercises
    for (const workout of workoutsWithExercises) {
      csvData.workouts.push({
        id: workout.id,
        name: workout.name,
        date: workout.date,
        duration: workout.duration,
        category: workout.category,
        notes: workout.notes,
        totalExercises: workout.exercises?.length || 0
      });

      // Add exercises for this workout
      if (workout.exercises) {
        for (const exercise of workout.exercises) {
          csvData.exercises.push({
            workoutId: workout.id,
            workoutName: workout.name,
            workoutDate: workout.date,
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exercise?.name || 'Unknown',
            category: exercise.exercise?.category || '',
            muscleGroup: exercise.exercise?.muscleGroup || '',
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            restTime: exercise.restTime,
            durationSeconds: exercise.durationSeconds,
            notes: exercise.notes
          });
        }
      }
    }

    // Process personal records
    csvData.personalRecords = personalRecords.map(record => ({
      id: record.id,
      exerciseId: record.exerciseId,
      weight: record.weight,
      reps: record.reps,
      date: record.date
    }));

    // Convert to CSV format
    const csvContent = generateCSV(csvData);
    console.log('Generated CSV content length:', csvContent.length);
    console.log('CSV preview:', csvContent.substring(0, 200));
    
    // Set headers for CSV download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `fit-tracker-export-${timestamp}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).send(csvContent);

  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
}

function generateCSV(data: any): string {
  let csv = '';
  
  // User Profile Section
  csv += '=== USER PROFILE ===\n';
  if (data.profile) {
    csv += `Username,${data.profile.username || 'Not set'}\n`;
    csv += `Show in Community,${data.profile.show_in_community ? 'Yes' : 'No'}\n`;
  }
  csv += '\n';

  // Workouts Section
  csv += '=== WORKOUTS ===\n';
  csv += 'ID,Name,Date,Duration (minutes),Category,Notes,Total Exercises\n';
  for (const workout of data.workouts) {
    csv += `${workout.id},"${escapeCSV(workout.name)}","${workout.date}",${workout.duration || ''},"${workout.category || ''}","${escapeCSV(workout.notes || '')}",${workout.totalExercises}\n`;
  }
  csv += '\n';

  // Exercises Section
  csv += '=== WORKOUT EXERCISES ===\n';
  csv += 'Workout ID,Workout Name,Workout Date,Exercise ID,Exercise Name,Category,Muscle Group,Sets,Reps,Weight,Rest Time (sec),Duration (sec),Notes\n';
  for (const exercise of data.exercises) {
    csv += `${exercise.workoutId},"${escapeCSV(exercise.workoutName)}","${exercise.workoutDate}",${exercise.exerciseId},"${escapeCSV(exercise.exerciseName)}","${exercise.category}","${exercise.muscleGroup}",${exercise.sets},"${exercise.reps || ''}",${exercise.weight || ''},${exercise.restTime || ''},${exercise.durationSeconds},"${escapeCSV(exercise.notes || '')}"\n`;
  }
  csv += '\n';

  // Personal Records Section
  csv += '=== PERSONAL RECORDS ===\n';
  csv += 'ID,Exercise ID,Weight,Reps,Date\n';
  for (const record of data.personalRecords) {
    csv += `${record.id},${record.exerciseId},${record.weight},${record.reps},"${record.date}"\n`;
  }
  csv += '\n';

  // Monthly Goals Section
  csv += '=== MONTHLY GOALS ===\n';
  csv += 'Month,Year,Target Workouts,Completed Workouts,Progress %\n';
  for (const goal of data.monthlyGoals) {
    const progress = goal.completedWorkouts && goal.targetWorkouts 
      ? Math.round((goal.completedWorkouts / goal.targetWorkouts) * 100)
      : 0;
    csv += `${goal.month},${goal.year},${goal.targetWorkouts},${goal.completedWorkouts || 0},${progress}%\n`;
  }

  return csv;
}

function escapeCSV(str: string): string {
  if (!str) return '';
  // Escape quotes by doubling them and wrap in quotes if contains comma, quote, or newline
  const escaped = str.replace(/"/g, '""');
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped}"`;
  }
  return escaped;
}


