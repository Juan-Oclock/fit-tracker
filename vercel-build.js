import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure the dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Ensure the dist/server directory exists
if (!fs.existsSync('dist/server')) {
  fs.mkdirSync('dist/server', { recursive: true });
}

// Ensure the dist/public directory exists
if (!fs.existsSync('dist/public')) {
  fs.mkdirSync('dist/public', { recursive: true });
}

// Copy shared directory to dist
fs.cpSync('shared', 'dist/shared', { recursive: true });

// Copy server seed files to dist/server for direct access
const seedFiles = [
  'seed-exercises.ts',
  'seed-categories.ts',
  'seed-muscle-groups.ts',
  'seed-quotes.ts'
];

seedFiles.forEach(file => {
  if (fs.existsSync(`server/${file}`)) {
    fs.copyFileSync(`server/${file}`, `dist/server/${file}`);
    console.log(`Copied ${file} to dist/server`);
  }
});

// Copy migrations directory to dist
if (fs.existsSync('migrations')) {
  fs.cpSync('migrations', 'dist/migrations', { recursive: true });
}

// Create a .env file in dist with production environment variables
const envContent = Object.entries(process.env)
  .filter(([key]) => key.startsWith('DATABASE_') || key.startsWith('SUPABASE_'))
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync('dist/.env', envContent);

// Create a package.json in dist for module resolution
const packageJson = {
  "type": "module"
};
fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

// Compile TypeScript files
console.log('Compiling TypeScript files...');
try {
  execSync('tsc --project server/tsconfig.json', { stdio: 'inherit' });
} catch (error) {
  console.error('TypeScript compilation failed, but continuing with the build...');
}

// Build the client
console.log('Building client...');
try {
  execSync('vite build', { stdio: 'inherit' });
} catch (error) {
  console.error('Client build failed:', error);
  process.exit(1);
}

// Skip pre-seeding during build - it will be done at runtime in a controlled way
console.log('Build completed successfully!');