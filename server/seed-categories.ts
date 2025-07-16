import { getStorage } from "./storage";

const DEFAULT_CATEGORIES = [
  { name: "strength", isDefault: true },
  { name: "cardio", isDefault: true },
  { name: "flexibility", isDefault: true },
  { name: "mixed", isDefault: true },
];

export async function seedCategories() {
  const storage = await getStorage();
  
  for (const category of DEFAULT_CATEGORIES) {
    try {
      await storage.createCategory(category);
      console.log(`Created category: ${category.name}`);
    } catch (error) {
      console.log(`Category ${category.name} already exists or error occurred:`, error);
    }
  }
}

// Execute the function when this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCategories()
    .then(() => {
      console.log('Categories seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding categories:', error);
      process.exit(1);
    });
}