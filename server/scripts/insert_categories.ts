import { getStorage } from "../storage";

async function insertCategories() {
  const storage = await getStorage();
  const categories = [
    {
      name: "HIIT",
      description: "High-Intensity Interval Training: short bursts of intense exercise alternated with recovery periods.",
      isDefault: false,
    },
    {
      name: "Plyometrics",
      description: "Jumping and explosive movement exercises to develop power.",
      isDefault: false,
    },
    {
      name: "Mobility",
      description: "Exercises focused on improving range of motion and joint health.",
      isDefault: false,
    },
    {
      name: "Balance",
      description: "Exercises aimed at improving stability and coordination.",
      isDefault: false,
    },
    {
      name: "Yoga/Pilates",
      description: "Mind-body routines for flexibility, core strength, and relaxation.",
      isDefault: false,
    },
    {
      name: "Rehabilitation/Prehab",
      description: "Exercises for injury recovery or prevention.",
      isDefault: false,
    },
    {
      name: "Sport-Specific",
      description: "Training tailored for specific sports or athletic performance.",
      isDefault: false,
    },
  ];

  for (const category of categories) {
    try {
      await storage.createCategory(category);
      console.log(`Inserted category: ${category.name}`);
    } catch (e) {
      console.error(`Failed to insert category ${category.name}:`, e);
    }
  }
  console.log("Category insertion complete.");
}

insertCategories();
