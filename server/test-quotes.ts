import { getStorage } from './storage';

async function testQuotes() {
  try {
    const storage = await getStorage();
    const quotes = await storage.getQuotes();
    console.log(`Found ${quotes.length} quotes in storage:`);
    
    if (quotes.length > 0) {
      console.log('First few quotes:');
      quotes.slice(0, 3).forEach((quote, index) => {
        console.log(`${index + 1}. "${quote.text}" - ${quote.author}`);
      });
    } else {
      console.log('No quotes found. Running seed script...');
      
      // Import and run the seed function
      const { seedAllQuotes } = await import('./seed-all-quotes');
      const result = await seedAllQuotes();
      console.log(`Seeded ${result.length} quotes successfully!`);
      
      // Verify again
      const newQuotes = await storage.getQuotes();
      console.log(`Now we have ${newQuotes.length} quotes total`);
    }
    
    // Test daily quote
    const dailyQuote = await storage.getDailyQuote();
    if (dailyQuote) {
      console.log(`\nToday's quote: "${dailyQuote.text}" - ${dailyQuote.author}`);
    } else {
      console.log('\nNo daily quote available');
    }
    
  } catch (error) {
    console.error('Error testing quotes:', error);
  }
}

testQuotes();