// Script to clean up invalid weights in workout_exercises
// Usage: node scripts/cleanup-workout-weights.js

import postgres from 'postgres';

// Use the same connection string as your backend
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const sql = postgres(connectionString, { ssl: 'require' });

async function cleanupWeights() {
  try {
    // 1. Alter column to text
    await sql.unsafe("ALTER TABLE workout_exercises ALTER COLUMN weight TYPE text;");
    console.log('Altered weight column to text.');

    // 2. Delete rows where weight is empty string
    const delResult = await sql.unsafe("DELETE FROM workout_exercises WHERE weight = '';");
    console.log('Deleted rows with empty string weights. Result:', delResult);

    // 3. Alter column back to numeric, treating empty string as NULL
    await sql.unsafe("ALTER TABLE workout_exercises ALTER COLUMN weight TYPE numeric USING NULLIF(weight, '')::numeric;");
    console.log('Altered weight column back to numeric.');
  } catch (err) {
    console.error('Error running cleanup:', err);
  } finally {
    await sql.end();
  }
}

cleanupWeights();
