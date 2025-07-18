import { getStorage } from "./storage";

// Comprehensive exercise database with proper categorization
const EXERCISE_DATABASE = [
  // CHEST EXERCISES
  { name: "Bench Press", category: "strength", muscleGroup: "Upper Chest,Middle Chest,Triceps", instructions: "Lie on bench, lower bar to chest, press up", equipment: "Barbell" },
  { name: "Incline Bench Press", category: "strength", muscleGroup: "Upper Chest,Front Delts,Triceps", instructions: "Lie on inclined bench, lower bar to upper chest, press up", equipment: "Barbell" },
  { name: "Decline Bench Press", category: "strength", muscleGroup: "Lower Chest,Triceps", instructions: "Lie on declined bench, lower bar to lower chest, press up", equipment: "Barbell" },
  { name: "Dumbbell Bench Press", category: "strength", muscleGroup: "Middle Chest,Upper Chest,Triceps", instructions: "Lie on bench with dumbbells, lower to chest level, press up", equipment: "Dumbbells" },
  { name: "Incline Dumbbell Press", category: "strength", muscleGroup: "Upper Chest,Front Delts,Triceps", instructions: "Lie on inclined bench with dumbbells, press up from chest level", equipment: "Dumbbells" },
  { name: "Dumbbell Flyes", category: "strength", muscleGroup: "Middle Chest,Upper Chest", instructions: "Lie on bench, lower dumbbells in arc motion, squeeze chest", equipment: "Dumbbells" },
  { name: "Push-ups", category: "strength", muscleGroup: "Middle Chest,Triceps,Front Delts", instructions: "Lower body to ground, push back up", equipment: "Bodyweight" },
  { name: "Incline Push-ups", category: "strength", muscleGroup: "Lower Chest,Triceps", instructions: "Push-ups with feet elevated", equipment: "Bodyweight" },
  { name: "Decline Push-ups", category: "strength", muscleGroup: "Upper Chest,Front Delts,Triceps", instructions: "Push-ups with hands elevated", equipment: "Bodyweight" },
  { name: "Chest Dips", category: "strength", muscleGroup: "Lower Chest,Triceps", instructions: "Lower body between parallel bars, push back up", equipment: "Dip bars" },

  // BACK EXERCISES
  { name: "Deadlift", category: "strength", muscleGroup: "Lower Back,Traps,Rhomboids,Lats,Glutes,Hamstrings", instructions: "Lift barbell from ground to hip level", equipment: "Barbell" },
  { name: "Pull-ups", category: "strength", muscleGroup: "Lats,Rhomboids,Middle Back,Biceps", instructions: "Hang from bar, pull body up until chin over bar", equipment: "Pull-up bar" },
  { name: "Chin-ups", category: "strength", muscleGroup: "Lats,Biceps,Rhomboids", instructions: "Pull-ups with underhand grip", equipment: "Pull-up bar" },
  { name: "Bent-Over Barbell Row", category: "strength", muscleGroup: "Lats,Rhomboids,Middle Back,Rear Delts", instructions: "Bend over, row barbell to lower chest", equipment: "Barbell" },
  { name: "T-Bar Row", category: "strength", muscleGroup: "Lats,Rhomboids,Middle Back", instructions: "Row T-bar to chest in bent-over position", equipment: "T-Bar" },
  { name: "Seated Cable Row", category: "strength", muscleGroup: "Lats,Rhomboids,Middle Back", instructions: "Pull cable to abdomen while seated", equipment: "Cable machine" },
  { name: "Lat Pulldown", category: "strength", muscleGroup: "Lats,Rhomboids,Biceps", instructions: "Pull bar down to chest while seated", equipment: "Cable machine" },
  { name: "One-Arm Dumbbell Row", category: "strength", muscleGroup: "Lats,Rhomboids,Middle Back", instructions: "Row dumbbell to hip with one arm", equipment: "Dumbbells" },
  { name: "Face Pulls", category: "strength", muscleGroup: "Rear Delts,Rhomboids,Middle Back", instructions: "Pull cable to face level", equipment: "Cable machine" },
  { name: "Shrugs", category: "strength", muscleGroup: "Traps", instructions: "Lift shoulders up toward ears", equipment: "Dumbbells" },

  // SHOULDER EXERCISES
  { name: "Overhead Press", category: "strength", muscleGroup: "Front Delts,Side Delts,Triceps", instructions: "Press barbell overhead from shoulder level", equipment: "Barbell" },
  { name: "Dumbbell Shoulder Press", category: "strength", muscleGroup: "Front Delts,Side Delts,Triceps", instructions: "Press dumbbells overhead", equipment: "Dumbbells" },
  { name: "Lateral Raises", category: "strength", muscleGroup: "Side Delts", instructions: "Raise dumbbells to sides until parallel to ground", equipment: "Dumbbells" },
  { name: "Front Raises", category: "strength", muscleGroup: "Front Delts", instructions: "Raise dumbbells in front until parallel to ground", equipment: "Dumbbells" },
  { name: "Rear Delt Flyes", category: "strength", muscleGroup: "Rear Delts", instructions: "Bend over, raise dumbbells to sides", equipment: "Dumbbells" },
  { name: "Arnold Press", category: "strength", muscleGroup: "Front Delts,Side Delts,Triceps", instructions: "Rotate dumbbells while pressing overhead", equipment: "Dumbbells" },
  { name: "Pike Push-ups", category: "strength", muscleGroup: "Front Delts,Triceps", instructions: "Push-ups in pike position", equipment: "Bodyweight" },

  // ARM EXERCISES
  { name: "Barbell Curls", category: "strength", muscleGroup: "Biceps", instructions: "Curl barbell from extended arms to chest", equipment: "Barbell" },
  { name: "Dumbbell Curls", category: "strength", muscleGroup: "Biceps", instructions: "Curl dumbbells alternating or together", equipment: "Dumbbells" },
  { name: "Hammer Curls", category: "strength", muscleGroup: "Biceps,Forearms", instructions: "Curl dumbbells with neutral grip", equipment: "Dumbbells" },
  { name: "Preacher Curls", category: "strength", muscleGroup: "Biceps", instructions: "Curl barbell on preacher bench", equipment: "Barbell" },
  { name: "Close-Grip Bench Press", category: "strength", muscleGroup: "Triceps,Middle Chest", instructions: "Bench press with narrow grip", equipment: "Barbell" },
  { name: "Tricep Dips", category: "strength", muscleGroup: "Triceps", instructions: "Lower and raise body using triceps", equipment: "Dip bars" },
  { name: "Overhead Tricep Extension", category: "strength", muscleGroup: "Triceps", instructions: "Extend dumbbell overhead", equipment: "Dumbbells" },
  { name: "Tricep Pushdowns", category: "strength", muscleGroup: "Triceps", instructions: "Push cable down using triceps", equipment: "Cable machine" },
  { name: "Diamond Push-ups", category: "strength", muscleGroup: "Triceps,Middle Chest", instructions: "Push-ups with hands in diamond shape", equipment: "Bodyweight" },
  { name: "Wrist Curls", category: "strength", muscleGroup: "Forearms", instructions: "Curl wrists with light weight", equipment: "Dumbbells" },

  // LEG EXERCISES
  { name: "Squat", category: "strength", muscleGroup: "Quads,Glutes,Hamstrings", instructions: "Stand with feet shoulder-width apart, squat down, stand up", equipment: "Barbell" },
  { name: "Front Squat", category: "strength", muscleGroup: "Quads,Glutes", instructions: "Squat with barbell in front rack position", equipment: "Barbell" },
  { name: "Goblet Squat", category: "strength", muscleGroup: "Quads,Glutes", instructions: "Squat holding dumbbell at chest", equipment: "Dumbbells" },
  { name: "Bulgarian Split Squat", category: "strength", muscleGroup: "Quads,Glutes", instructions: "Single leg squat with rear foot elevated", equipment: "Bodyweight" },
  { name: "Lunges", category: "strength", muscleGroup: "Quads,Glutes,Hamstrings", instructions: "Step forward into lunge position", equipment: "Bodyweight" },
  { name: "Romanian Deadlift", category: "strength", muscleGroup: "Hamstrings,Glutes,Lower Back", instructions: "Hinge at hips, lower barbell to mid-shin", equipment: "Barbell" },
  { name: "Leg Press", category: "strength", muscleGroup: "Quads,Glutes", instructions: "Press weight with legs on leg press machine", equipment: "Leg press machine" },
  { name: "Leg Curls", category: "strength", muscleGroup: "Hamstrings", instructions: "Curl legs against resistance", equipment: "Machine" },
  { name: "Leg Extensions", category: "strength", muscleGroup: "Quads", instructions: "Extend legs against resistance", equipment: "Machine" },
  { name: "Calf Raises", category: "strength", muscleGroup: "Calves", instructions: "Raise up on toes", equipment: "Bodyweight" },
  { name: "Hip Thrusts", category: "strength", muscleGroup: "Glutes,Hamstrings", instructions: "Thrust hips up with shoulders on bench", equipment: "Barbell" },

  // CORE EXERCISES
  { name: "Plank", category: "strength", muscleGroup: "Abs,Obliques", instructions: "Hold plank position", equipment: "Bodyweight" },
  { name: "Side Plank", category: "strength", muscleGroup: "Obliques,Abs", instructions: "Hold side plank position", equipment: "Bodyweight" },
  { name: "Crunches", category: "strength", muscleGroup: "Abs", instructions: "Crunch upper body toward knees", equipment: "Bodyweight" },
  { name: "Bicycle Crunches", category: "strength", muscleGroup: "Abs,Obliques", instructions: "Alternate elbow to opposite knee", equipment: "Bodyweight" },
  { name: "Russian Twists", category: "strength", muscleGroup: "Obliques,Abs", instructions: "Rotate torso side to side", equipment: "Bodyweight" },
  { name: "Mountain Climbers", category: "strength", muscleGroup: "Abs,Obliques", instructions: "Alternate bringing knees to chest in plank", equipment: "Bodyweight" },
  { name: "Dead Bug", category: "strength", muscleGroup: "Abs", instructions: "Extend opposite arm and leg while lying down", equipment: "Bodyweight" },
  { name: "Hanging Leg Raises", category: "strength", muscleGroup: "Abs", instructions: "Raise legs while hanging from bar", equipment: "Pull-up bar" },

  // CARDIO EXERCISES
  { name: "Running", category: "cardio", muscleGroup: "Quads,Hamstrings,Calves,Glutes", instructions: "Run at steady pace", equipment: "None" },
  { name: "Cycling", category: "cardio", muscleGroup: "Quads,Hamstrings,Calves", instructions: "Cycle at moderate intensity", equipment: "Bike" },
  { name: "Swimming", category: "cardio", muscleGroup: "Lats,Front Delts,Triceps,Abs", instructions: "Swim laps at steady pace", equipment: "Pool" },
  { name: "Rowing", category: "cardio", muscleGroup: "Lats,Rhomboids,Quads,Glutes", instructions: "Row at steady pace", equipment: "Rowing machine" },
  { name: "Elliptical", category: "cardio", muscleGroup: "Quads,Hamstrings,Glutes", instructions: "Use elliptical at moderate intensity", equipment: "Elliptical machine" },
  { name: "Jump Rope", category: "cardio", muscleGroup: "Calves,Forearms", instructions: "Jump rope at steady pace", equipment: "Jump rope" },
  { name: "Burpees", category: "cardio", muscleGroup: "Abs,Quads,Triceps,Front Delts", instructions: "Squat, jump back to plank, push-up, jump forward, jump up", equipment: "Bodyweight" },
  { name: "High Knees", category: "cardio", muscleGroup: "Quads,Calves", instructions: "Run in place bringing knees high", equipment: "Bodyweight" },
  { name: "Jumping Jacks", category: "cardio", muscleGroup: "Quads,Calves,Side Delts", instructions: "Jump while spreading legs and raising arms", equipment: "Bodyweight" },

  // FLEXIBILITY EXERCISES
  { name: "Cat-Cow Stretch", category: "flexibility", muscleGroup: "Lower Back,Abs", instructions: "Alternate between arching and rounding spine", equipment: "None" },
  { name: "Child's Pose", category: "flexibility", muscleGroup: "Lower Back,Lats", instructions: "Kneel and stretch arms forward", equipment: "None" },
  { name: "Downward Dog", category: "flexibility", muscleGroup: "Hamstrings,Calves,Lats", instructions: "Form inverted V shape with body", equipment: "None" },
  { name: "Pigeon Pose", category: "flexibility", muscleGroup: "Glutes,Hip Flexors", instructions: "Stretch hip in pigeon position", equipment: "None" },
  { name: "Hamstring Stretch", category: "flexibility", muscleGroup: "Hamstrings", instructions: "Stretch hamstrings while seated or standing", equipment: "None" },
  { name: "Quad Stretch", category: "flexibility", muscleGroup: "Quads", instructions: "Pull foot to glutes to stretch quads", equipment: "None" },
  { name: "Shoulder Stretch", category: "flexibility", muscleGroup: "Front Delts,Rear Delts", instructions: "Stretch shoulders across body", equipment: "None" },
  { name: "Chest Stretch", category: "flexibility", muscleGroup: "Middle Chest,Front Delts", instructions: "Stretch chest in doorway or with partner", equipment: "None" },
  { name: "Hip Flexor Stretch", category: "flexibility", muscleGroup: "Hip Flexors", instructions: "Lunge position to stretch hip flexors", equipment: "None" },
  { name: "Calf Stretch", category: "flexibility", muscleGroup: "Calves", instructions: "Stretch calves against wall or step", equipment: "None" },

  // MIXED/FUNCTIONAL EXERCISES
  { name: "Turkish Get-Up", category: "mixed", muscleGroup: "Abs,Glutes,Front Delts,Triceps", instructions: "Complex movement from lying to standing with weight", equipment: "Kettlebell" },
  { name: "Farmer's Walk", category: "mixed", muscleGroup: "Forearms,Traps,Abs,Quads", instructions: "Walk carrying heavy weights", equipment: "Dumbbells" },
  { name: "Bear Crawl", category: "mixed", muscleGroup: "Abs,Front Delts,Quads", instructions: "Crawl on hands and feet", equipment: "Bodyweight" },
  { name: "Kettlebell Swings", category: "mixed", muscleGroup: "Glutes,Hamstrings,Lower Back,Front Delts", instructions: "Swing kettlebell from hips to shoulder height", equipment: "Kettlebell" },
  { name: "Thrusters", category: "mixed", muscleGroup: "Quads,Glutes,Front Delts,Triceps", instructions: "Squat to overhead press in one motion", equipment: "Dumbbells" },
  { name: "Man Makers", category: "mixed", muscleGroup: "Abs,Triceps,Front Delts,Quads,Glutes", instructions: "Burpee with dumbbell rows and overhead press", equipment: "Dumbbells" },
  { name: "Wall Balls", category: "mixed", muscleGroup: "Quads,Glutes,Front Delts", instructions: "Squat and throw medicine ball to wall", equipment: "Medicine ball" },
  { name: "Box Jumps", category: "mixed", muscleGroup: "Quads,Glutes,Calves", instructions: "Jump onto elevated platform", equipment: "Box" },
];

export async function seedExercises() {
  const storage = await getStorage();
  
  console.log("Starting exercise database seeding...");
  
  // Get existing exercises to avoid duplicates
  const existingExercises = await storage.getExercises();
  const existingNames = new Set(existingExercises.map(ex => ex.name.toLowerCase()));
  
  let created = 0;
  let updated = 0;
  let skipped = 0;
  
  for (const exercise of EXERCISE_DATABASE) {
    try {
      const exerciseName = exercise.name.toLowerCase();
      
      // Check if exercise already exists
      const existingExercise = existingExercises.find(ex => ex.name.toLowerCase() === exerciseName);
      
      if (existingExercise) {
        // Update existing exercise if muscle groups or other details are different
        const needsUpdate = 
          existingExercise.muscleGroup !== exercise.muscleGroup ||
          existingExercise.category !== exercise.category ||
          existingExercise.instructions !== exercise.instructions ||
          existingExercise.equipment !== exercise.equipment;
          
        if (needsUpdate) {
          await storage.updateExercise(existingExercise.id, {
            category: exercise.category,
            muscleGroup: exercise.muscleGroup,
            instructions: exercise.instructions,
            equipment: exercise.equipment
          });
          console.log(`✅ Updated: ${exercise.name}`);
          updated++;
        } else {
          console.log(`⏭️  Skipped: ${exercise.name} (no changes needed)`);
          skipped++;
        }
      } else {
        // Create new exercise
        await storage.createExercise(exercise);
        console.log(`🆕 Created: ${exercise.name}`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${exercise.name}:`, error);
    }
  }
  
  console.log("\n📊 Exercise seeding completed!");
  console.log(`🆕 Created: ${created} exercises`);
  console.log(`✅ Updated: ${updated} exercises`);
  console.log(`⏭️  Skipped: ${skipped} exercises`);
  console.log(`📝 Total processed: ${EXERCISE_DATABASE.length} exercises`);
}

// Execute the function when this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedExercises()
    .then(() => {
      console.log('Exercise seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding exercises:', error);
      process.exit(1);
    });
}
