import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

// Test script to verify Neon connection works
async function testNeonConnection() {
  console.log('Testing Neon connection...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found');
    return;
  }
  
  try {
    console.log('Creating Neon connection...');
    const sql = neon(process.env.DATABASE_URL);
    // Note: drizzle setup not needed for simple connection test
    
    console.log('Testing simple query...');
    const result = await sql`SELECT 1 as test`;
    console.log('Query result:', result);
    
    console.log('✅ Neon connection successful!');
  } catch (error) {
    console.error('❌ Neon connection failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testNeonConnection();
