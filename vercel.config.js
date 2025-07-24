export default {
  version: 2,
  builds: [
    { src: 'package.json', use: '@vercel/node' },
    { src: 'api/index.js', use: '@vercel/node' },
  ],
  routes: [
    { src: '/api/(.*)', dest: '/api/index.js' },
    { src: '/(.*)', dest: '/dist/public/$1' },
    { src: '/', dest: '/dist/public/index.html' }
  ],
  env: {
    NODE_ENV: 'production'
  }
};