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
    } catch (error) {
      // Category might already exist, continue
    }
  }
}