# FitTracker - Modern Workout Tracker

A modern, minimalist workout tracking Progressive Web App (PWA) designed to help users log exercises, monitor fitness progress, and achieve personal health goals through advanced authentication and user-centric design.

![FitTracker Screenshot](https://via.placeholder.com/800x400/3b82f6/ffffff?text=FitTracker+Dashboard)

## 🚀 Features

### Core Functionality
- **Workout Creation**: Create custom workouts with exercise selection and detailed tracking
- **Exercise Database**: Comprehensive library with 50+ exercises, categories, and muscle groups
- **Progress Tracking**: Visual analytics and personal records monitoring
- **Workout History**: Complete session history with search and filtering
- **Photo Upload**: Add workout selfies with automatic compression
- **Goal Setting**: Dynamic weekly workout goals with progress tracking

### Technical Features
- **Progressive Web App (PWA)**: Install on mobile devices for native-like experience
- **Offline Support**: Service worker caching for offline functionality
- **Responsive Design**: Mobile-first design optimized for all screen sizes
- **Dark Mode**: System-aware theme switching
- **Real-time Updates**: Instant UI updates with optimistic mutations

### Authentication & Security
- **Supabase Auth**: Secure email/password and Google OAuth authentication
- **Private Data**: User-isolated data with secure backend API
- **Session Management**: Persistent login with JWT token verification
- **Development Security**: Admin interface restricted to development environment

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** component primitives
- **TanStack Query** for server state management
- **Wouter** for lightweight routing
- **Vite** for development and builds

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** via Supabase
- **JWT** authentication middleware

### Infrastructure
- **Supabase** for database and authentication
- **Vercel/Netlify** ready for deployment
- **PWA** manifest and service worker
- **Custom domain** support (fittracker.juan-oclock.com)

## 🏗️ Project Structure

```
fittracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   ├── pages/         # Route components
│   │   └── main.tsx       # Application entry point
│   └── index.html
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database operations
│   └── supabaseAuth.ts   # Authentication middleware
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and validation
└── public/              # Static assets
    └── exercises/       # Exercise images
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fittracker.git
   cd fittracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create environment variables in your deployment platform:
   ```env
   DATABASE_URL=your_supabase_database_url
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

### Supabase Configuration

1. Create a new Supabase project
2. Get your project URL and anon key from the API settings
3. Update the authentication settings:
   - **Site URL**: Your domain (e.g., `https://fittracker.juan-oclock.com`)
   - **Redirect URLs**: Add your domain with `/**` wildcard
4. Enable Google OAuth if desired in the Auth providers section

## 📱 PWA Installation

FitTracker can be installed as a Progressive Web App:

1. Visit the app in your mobile browser
2. Tap "Add to Home Screen" when prompted
3. The app will install like a native app
4. Enjoy offline functionality and native-like experience

## 🏃‍♂️ Usage

### Creating Your First Workout
1. Sign up or log in with email/password or Google
2. Click "New Workout" from the dashboard
3. Add exercises from the comprehensive database
4. Track sets, reps, weight, and notes
5. Optional: Add a workout selfie
6. Save your session

### Setting Goals
1. Go to the dashboard
2. Click "Set Goal" in the statistics section
3. Choose your weekly workout target (1-14 workouts)
4. Goals update weekly to encourage consistency

### Tracking Progress
1. Visit the "Progress" page for analytics
2. View workout trends and personal records
3. Monitor your consistency and improvements
4. Export data as CSV for external analysis

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management

### Admin Interface
- Only available in development mode (`NODE_ENV=development`)
- Access at `/admin` to manage exercises and categories
- Automatically hidden in production for security

### Database Schema
- **users**: User profiles and authentication data
- **exercises**: Exercise definitions with instructions and images
- **workouts**: Workout sessions with metadata
- **workout_exercises**: Junction table for workout-exercise relationships
- **personal_records**: User fitness milestones

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on git push

### Manual Deployment
1. Run `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Ensure environment variables are configured
4. Set up domain redirects for SPA routing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Exercise data and images from fitness industry standards
- UI components powered by Radix UI and Tailwind CSS
- Authentication provided by Supabase
- Icons from Lucide React

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/fittracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/fittracker/discussions)
- **Email**: support@fittracker.juan-oclock.com

---

Built with ❤️ for fitness enthusiasts who love clean, modern interfaces and reliable progress tracking.