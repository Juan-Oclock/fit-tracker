import type { InsertQuote } from '@shared/schema';

// All 31 quotes (10 initial + 21 additional)
const allQuotes: InsertQuote[] = [
  // Initial 10 quotes from migration
  {
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown",
    category: "motivation",
    isActive: true
  },
  {
    text: "Your body can do it. It's your mind you have to convince.",
    author: "Unknown",
    category: "motivation",
    isActive: true
  },
  {
    text: "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
    author: "Rikki Rogers",
    category: "strength",
    isActive: true
  },
  {
    text: "The groundwork for all happiness is good health.",
    author: "Leigh Hunt",
    category: "general",
    isActive: true
  },
  {
    text: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
    category: "general",
    isActive: true
  },
  {
    text: "Success isn't always about greatness. It's about consistency.",
    author: "Dwayne Johnson",
    category: "motivation",
    isActive: true
  },
  {
    text: "The pain you feel today will be the strength you feel tomorrow.",
    author: "Unknown",
    category: "motivation",
    isActive: true
  },
  {
    text: "Don't limit your challenges, challenge your limits.",
    author: "Unknown",
    category: "motivation",
    isActive: true
  },
  {
    text: "Fitness is not about being better than someone else. It's about being better than you used to be.",
    author: "Unknown",
    category: "motivation",
    isActive: true
  },
  {
    text: "Every workout is progress.",
    author: "Unknown",
    category: "motivation",
    isActive: true
  },
  // Additional 21 quotes
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
  },
  {
    text: "The groundwork for all happiness is good health.",
    author: "Leigh Hunt",
    category: "health",
    isActive: true
  }
];

async function seedQuotesViaAPI() {
  const baseUrl = 'http://localhost:3000';
  let successCount = 0;
  let errorCount = 0;

  console.log('Seeding quotes via API...');
  
  for (const quote of allQuotes) {
    try {
      const response = await fetch(`${baseUrl}/api/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quote),
      });

      if (response.ok) {
        successCount++;
        console.log(`✓ Added: "${quote.text.substring(0, 50)}..."`);
      } else {
        errorCount++;
        console.log(`✗ Failed to add: "${quote.text.substring(0, 50)}..." - ${response.status}`);
      }
    } catch (error) {
      errorCount++;
      console.log(`✗ Error adding: "${quote.text.substring(0, 50)}..." - ${error}`);
    }
  }

  console.log(`\nSeeding completed!`);
  console.log(`✓ Successfully added: ${successCount} quotes`);
  console.log(`✗ Failed to add: ${errorCount} quotes`);
  
  // Verify the quotes were added
  try {
    const response = await fetch(`${baseUrl}/api/quotes`);
    if (response.ok) {
      const quotes = await response.json();
      console.log(`\nVerification: Found ${quotes.length} total quotes in the system`);
    }
  } catch (error) {
    console.log('Could not verify quotes count');
  }
}

seedQuotesViaAPI().catch(console.error);