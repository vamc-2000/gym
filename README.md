# 🏋️ GymStreak

**GymStreak** is a premium fitness management platform built with Next.js, Prisma, and MongoDB. It focuses on gamifying the fitness journey through streaks, leaderboards, and personalized workout/diet plans.

## ✨ Features
- **📊 Interactive Dashboard**: Real-time stats on BMI, calories, and progress.
- **🔥 Streak System**: Keep the momentum going with daily workout tracking.
- **🏆 Global Leaderboard**: Compete with other athletes and earn achievement badges.
- **📅 Smart Scheduler**: Integrated calendar for workouts, meals, and supplements.
- **🎨 Modern UI**: Anime-inspired aesthetic with smooth Framer Motion animations.
- **🔐 Secure Auth**: JWT-based authentication with role-based access control (Admin/User).

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB via Prisma
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Validation**: Zod

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string

### Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file and add:
   ```env
   DATABASE_URL="your_mongodb_url"
   JWT_SECRET="your_jwt_secret"
   ```

3. **Initialize & Seed**:
   ```bash
   npm run init
   ```

4. **Run Dev Server**:
   ```bash
   npm run dev
   ```

## 📄 Documentation
For detailed technical information, refer to the [Project Documentation](./PROJECT_DOCUMENTATION.md).

## 🛝 Presentation
The slide content for the project presentation can be found in `presentation_slides.md`.

---
Built with ❤️ for athletes.
