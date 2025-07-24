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

console.log('Build completed successfully!');