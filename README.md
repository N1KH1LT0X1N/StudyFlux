# 📚 StudyFlux – AI-Powered Learning Platform

[**▶ Live Demo: study-flux.vercel.app**](https://study-flux.vercel.app/)

**Contributors**
- [N1KH1LT0X1N](https://github.com/N1KH1LT0X1N)
- [vi800](https://github.com/vi800)
- [AstralKS](https://github.com/AstralKS)
- [MalayBhaveshPandya](https://github.com/MalayBhaveshPandya)

---

**StudyFlux** is a comprehensive AI-powered learning platform designed to make studying more interactive, engaging, and effective. With advanced features like AI-generated flashcards, quizzes, spaced repetition, gamification, and personalized dashboards, StudyFlux transforms how students learn and retain information.

Built with **Next.js 15**, **React 19**, **TypeScript**, **Prisma**, **PostgreSQL**, and powered by **Google Gemini AI**, StudyFlux provides a modern, scalable, and intelligent learning experience.

---

## ✨ Key Features

### 🧠 AI-Powered Learning
- **Smart Document Processing**: Upload PDFs and images, get AI-generated summaries and key points
- **AI Chatbot**: Ask questions about your documents and get contextual answers
- **Flashcard Generation**: Automatically generate flashcards from your study materials
- **Quiz Generation**: Create multiple-choice quizzes to test your knowledge
- **Spaced Repetition**: SM-2 algorithm for optimal flashcard review scheduling

### 📚 Study Tools
- **Document Management**: Upload, organize, and analyze study materials
- **Flashcards**: Create, review, and track flashcard performance
- **Quizzes**: Generate and take AI-powered quizzes with detailed explanations
- **Study Sessions**: Track your study time and progress
- **Notes**: Create and organize personal study notes

### 🎮 Gamification
- **Points & Levels**: Earn points for every study activity
- **Achievements**: Unlock badges for reaching milestones
- **Streaks**: Maintain daily study streaks
- **Leaderboard**: Compete with other learners

### 📊 Analytics & Insights
- **Progress Dashboard**: Visualize your learning journey
- **Study Charts**: Track study time and performance trends
- **Performance Metrics**: Monitor quiz scores and flashcard accuracy
- **Activity Feed**: Review your recent learning activities

### ⚙️ User Experience
- **Dark Mode**: Eye-friendly dark theme
- **Mobile Responsive**: Full mobile and tablet support
- **Real-time Notifications**: Stay updated on due flashcards and achievements
- **User Settings**: Customize profile, preferences, and privacy settings
- **Data Export**: Download all your data in JSON format

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and caching
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide Icons** - Icon library
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - RESTful API
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database
- **NextAuth.js** - Authentication
- **bcryptjs** - Password hashing

### AI & ML
- **Google Gemini AI** - Content generation
- **SM-2 Algorithm** - Spaced repetition
- **PDF Parse** - Document processing

### Storage
- **Supabase Storage** - File storage
- **PostgreSQL** - Database

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm/pnpm
- **PostgreSQL** database
- **Google AI API Key** ([Get one here](https://makersuite.google.com/app/apikey))
- **Supabase Account** (optional, for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/StudyFlux.git
   cd StudyFlux
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your credentials:
   ```env
   # App
   NEXT_PUBLIC_API_URL=http://localhost:3000

   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/studyflux"

   # NextAuth
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"

   # Google AI
   GOOGLE_AI_API_KEY="your-google-ai-api-key"

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Supabase (optional, for file storage)
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed achievements (optional)
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Environment Variables Guide

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js sessions | Yes |
| `NEXTAUTH_URL` | App URL (http://localhost:3000 for dev) | Yes |
| `GOOGLE_AI_API_KEY` | Google Gemini API key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | No |

---

## 🏗️ Project Structure

```
StudyFlux/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── ai/              # AI endpoints (chat, summarize)
│   │   ├── documents/       # Document CRUD
│   │   ├── flashcards/      # Flashcard management
│   │   ├── quizzes/         # Quiz generation and attempts
│   │   ├── user/            # User profile and settings
│   │   └── ...
│   ├── dashboard/           # Dashboard pages
│   │   ├── documents/       # Documents page
│   │   ├── flashcards/      # Flashcards page
│   │   ├── quizzes/         # Quizzes page
│   │   ├── settings/        # User settings
│   │   └── ...
│   └── (auth)/              # Auth pages (signin, signup)
├── components/              # React components
│   ├── dashboard/           # Dashboard-specific components
│   ├── flashcards/          # Flashcard components
│   ├── quiz/                # Quiz components
│   ├── gamification/        # Gamification components
│   ├── shared/              # Shared/reusable components
│   └── ui/                  # UI primitives
├── lib/                     # Utility libraries
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client
│   ├── quiz-generator.ts    # Quiz generation logic
│   ├── flashcard-generator.ts # Flashcard generation
│   ├── gamification.ts      # Points and achievements
│   ├── spaced-repetition.ts # SM-2 algorithm
│   └── react-query.ts       # React Query config
├── prisma/                  # Database schema
│   └── schema.prisma        # Prisma schema
└── public/                  # Static assets
```

---

## 🎯 Core Workflows

### 1. Upload & Study Workflow
1. **Upload Document** → AI processes and generates summary
2. **Generate Flashcards** → AI creates flashcards from document
3. **Review Flashcards** → Spaced repetition algorithm schedules reviews
4. **Earn Points** → Get rewarded for studying

### 2. Quiz Workflow
1. **Select Document** → Choose a study material
2. **Generate Quiz** → AI creates multiple-choice questions
3. **Take Quiz** → Answer questions with explanations
4. **View Results** → See score and detailed breakdown
5. **Earn Points** → Gain points based on performance

### 3. Gamification Loop
- **Study Activities** → Earn points and XP
- **Level Up** → Unlock new features
- **Earn Achievements** → Complete challenges
- **Maintain Streaks** → Study daily for bonuses
- **Compete** → Rise on the leaderboard

---

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npx prisma studio        # Open Prisma Studio
npx prisma migrate dev   # Create migration
npx prisma db push       # Push schema changes
npx prisma generate      # Generate Prisma Client

# Type Checking
npm run type-check       # Run TypeScript compiler
```

---

## 🧪 Testing (Coming Soon)

```bash
npm run test            # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import project to Vercel**
3. **Add environment variables**
4. **Deploy**

### Docker

```bash
# Build image
docker build -t studyflux .

# Run container
docker run -p 3000:3000 studyflux
```

### Manual Deployment

```bash
# Build
npm run build

# Start
npm run start
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For powerful AI capabilities
- **Vercel** - For amazing deployment platform
- **Prisma** - For excellent ORM
- **Tailwind CSS** - For beautiful styling
- **Next.js Team** - For the incredible framework

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/StudyFlux/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/StudyFlux/discussions)
- **Email**: support@studyflux.app

---

## 🗺️ Roadmap

- [ ] Mobile apps (iOS & Android)
- [ ] Collaborative study groups
- [ ] Live study sessions
- [ ] Voice notes and transcription
- [ ] Advanced analytics dashboard
- [ ] Plugin system for custom integrations
- [ ] Offline mode
- [ ] Multi-language support

---

**Made with ❤️ by the StudyFlux Team**
