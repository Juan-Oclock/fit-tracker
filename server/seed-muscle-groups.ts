import { getStorage } from "./storage";

const DEFAULT_MUSCLE_GROUPS = [
  // Chest muscles
  { name: "Upper Chest", description: "Upper portion of the pectoral muscles", isDefault: true },
  { name: "Middle Chest", description: "Middle portion of the pectoral muscles", isDefault: true },
  { name: "Lower Chest", description: "Lower portion of the pectoral muscles", isDefault: true },
  
  // Back muscles
  { name: "Lats", description: "Latissimus dorsi muscles", isDefault: true },
  { name: "Lower Back", description: "Lower back muscles including erector spinae", isDefault: true },
  { name: "Middle Back", description: "Middle back muscles including rhomboids", isDefault: true },
  { name: "Traps", description: "Trapezius muscles", isDefault: true },
  { name: "Rhomboids", description: "Rhomboid muscles", isDefault: true },
  
  // Shoulder muscles
  { name: "Front Delts", description: "Anterior deltoid muscles", isDefault: true },
  { name: "Side Delts", description: "Lateral deltoid muscles", isDefault: true },
  { name: "Rear Delts", description: "Posterior deltoid muscles", isDefault: true },
  
  // Arm muscles
  { name: "Biceps", description: "Bicep muscles", isDefault: true },
  { name: "Triceps", description: "Tricep muscles", isDefault: true },
  { name: "Forearms", description: "Forearm muscles", isDefault: true },
  
  // Leg muscles
  { name: "Glutes", description: "Gluteal muscles", isDefault: true },
  { name: "Hamstrings", description: "Hamstring muscles", isDefault: true },
  { name: "Quads", description: "Quadriceps muscles", isDefault: true },
  { name: "Calves", description: "Calf muscles", isDefault: true },
  
  // Core muscles
  { name: "Abs", description: "Abdominal muscles", isDefault: true },
  { name: "Obliques", description: "Oblique muscles", isDefault: true },
];

export async function seedMuscleGroups() {
  const storage = await getStorage();
  
  for (const muscleGroup of DEFAULT_MUSCLE_GROUPS) {
    try {
      await storage.createMuscleGroup(muscleGroup);
      console.log(`Created muscle group: ${muscleGroup.name}`);
    } catch (error) {
      console.log(`Muscle group ${muscleGroup.name} already exists or error occurred:`, error);
    }
  }
}

// Execute the function when this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMuscleGroups()
    .then(() => {
      console.log('Muscle groups seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding muscle groups:', error);
      process.exit(1);
    });
}
