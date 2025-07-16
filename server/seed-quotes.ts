import { getStorage } from './storage';
import type { InsertQuote } from '@shared/schema';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const additionalQuotes: InsertQuote[] = [
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "motivation",
    isActive: true
  },
  {
    text: "What seems impossible today will one day become your warm-up.",
    author: "Unknown",
    category: "motivation",
    isActive: true
  },
  {
    text: "Champions aren't made in the gyms. Champions are made from something deep inside them - a desire, a dream, a vision.",
    author: "Muhammad Ali",
    category: "motivation",
    isActive: true
  },
  {
    text: "The successful warrior is the average man with laser-like focus.",
    author: "Bruce Lee",
    category: "focus",
    isActive: true
  },
  {
    text: "You don't have to be extreme, just consistent.",
    author: "Unknown",
    category: "consistency",
    isActive: true
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    category: "discipline",
    isActive: true
  },
  {
    text: "The body achieves what the mind believes.",
    author: "Unknown",
    category: "mindset",
    isActive: true
  },
  {
    text: "Sweat is fat crying.",
    author: "Unknown",
    category: "motivation",
    isActive: true
  },
  {
    text: "A one-hour workout is 4% of your day. No excuses.",
    author: "Unknown",
    category: "motivation",
    isActive: true
  },
  {
    text: "The resistance that you fight physically in the gym and the resistance that you fight in life can only build a strong character.",
    author: "Arnold Schwarzenegger",
    category: "strength",
    isActive: true
  },
  {
    text: "If you want something you've never had, you must be willing to do something you've never done.",
    author: "Thomas Jefferson",
    category: "motivation",
    isActive: true
  },
  {
    text: "The clock is ticking. Are you becoming the person you want to be?",
    author: "Greg Plitt",
    category: "motivation",
    isActive: true
  },
  {
    text: "Your health account, your bank account, they're the same thing. The more you put in, the more you can take out.",
    author: "Jack LaLanne",
    category: "health",
    isActive: true
  },
  {
    text: "Exercise is a celebration of what your body can do, not a punishment for what you ate.",
    author: "Unknown",
    category: "mindset",
    isActive: true
  },
  {
    text: "The groundwork for all happiness is good health.",
    author: "Leigh Hunt",
    category: "health",
    isActive: true
  },
  {
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun",
    category: "habits",
    isActive: true
  },
  {
    text: "You are your only limit.",
    author: "Unknown",
    category: "motivation",
    isActive: true
  },
  {
    text: "Fall seven times, stand up eight.",
    author: "Japanese Proverb",
    category: "resilience",
    isActive: true
  },
  {
    text: "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson",
    category: "motivation",
    isActive: true
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "belief",
    isActive: true
  },
  {
    text: "Progress, not perfection.",
    author: "Unknown",
    category: "progress",
    isActive: true
  }
];

export async function seedAdditionalQuotes() {
  try {
    console.log('Seeding additional quotes...');
    const storage = await getStorage();
    const importedQuotes = await storage.importQuotesFromAPI(additionalQuotes);
    console.log(`Successfully imported ${importedQuotes.length} additional quotes`);
    return importedQuotes;
  } catch (error) {
    console.error('Error seeding quotes:', error);
    throw error;
  }
}

// ES module equivalent of require.main === module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdditionalQuotes()
    .then(() => {
      console.log('Quote seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Quote seeding failed:', error);
      process.exit(1);
    });
}