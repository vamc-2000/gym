# GymStreak Project Documentation

## 🏋️ Overview
**GymStreak** is a high-performance, full-stack fitness management and tracking application. Designed with a focus on consistency and gamification, it empowers users to maintain workout streaks, track nutritional intake, and compete on global leaderboards.

The application features a modern, anime-inspired aesthetic with dynamic animations and a robust administrative backend for managing workout templates, diet plans, and user progress. The platform has evolved to include social connectivity and a comprehensive coaching module.

---

## 🚀 Key Features

### 1. User Dashboard & Personalization
- **Dynamic Greeting**: Context-aware greetings based on time of day and user name.
- **Physical Metrics**: Track Height, Weight, BMI, and Body Fat percentage.
- **Goal Setting**: Personalized goals (Weight Loss, Muscle Gain, etc.) and Fitness Levels (Beginner, Intermediate, Advanced).

### 2. Workout Management
- **Automated Plans**: AI-ready workout plans assigned based on user goals and fitness levels.
- **Workout Logging**: Real-time logging of exercises, sets, reps, and duration.
- **Exercise Library**: A comprehensive database of exercises with categories (Strength, Cardio, Flexibility), muscle group focus, and equipment requirements.
- **History**: Detailed logs of past workouts with calories burned and duration metrics.

### 3. Nutrition & Diet
- **Diet Plans**: Customized diet templates (Veg, Non-Veg, Both) with calorie and macronutrient targets.
- **Daily Logs**: Track calorie, protein, carb, and fat intake.
- **Meal Scheduling**: Integrated meal timers and status tracking.

### 4. Gamification & Engagement
- **Streak System**: Encourages daily activity by tracking consecutive days of workout completion.
- **Leaderboards**: 
  - **Global Ranking**: Long-term competition based on overall score.
  - **Daily Ranking**: High-intensity daily competition that resets every midnight.
- **Score Formula**: 
  - `Score = (Streak * 10) + Workout Count + Floor(Calories / 10)`
- **Achievement Badges**: Gold, Silver, and Bronze podiums for top performers.

### 5. Community & Social
- **Community Feed**: Share updates, photos, and achievements with privacy controls.
- **Interactions**: Like and comment on peers' posts to foster an engaging community.
- **Friendships**: Send, receive, and manage friend requests.
- **Direct Messaging (Chat)**: Real-time chat with friends, supporting text and media messages, complete with read receipts.
- **Stories**: Ephemeral media sharing (images/videos) that expires automatically.

### 6. Coaching & Trainer System
- **Trainer Profiles**: Specialized profiles for trainers highlighting their expertise, ratings, and active user count.
- **Client Management**: Assign users to trainers, and manage user progression via trainer notes (public and private).
- **Challenges**: Trainers can create competitive challenges (workout count, calorie burn, streak-based) for their assigned users.
- **Live Sessions**: Track active, real-time workout sessions under trainer supervision.

### 7. Scheduling & Notifications
- **Smart Scheduler**: Manage workouts, meals, water intake, sleep, and supplements.
- **Reward System**: Earn 5 points for every completed schedule item.
- **Notification System**: Category-based alerts (Workout, Goals, Nutrition, Recovery, Social, Admin, Marketing) with priority levels (Critical, High, Medium, Low) and DND settings.

### 8. Admin Panel
- **User Management**: Monitor user activity and progress.
- **Template Management**: Create and assign global workout and diet templates.
- **System Control**: Toggle registrations, admin approvals, and feature availability.
- **Communications**: Dispatch system-wide or targeted emails to users and admins.

---

## 🛠️ Technical Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Prisma ORM 6.19.3](https://www.prisma.io/)
- **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/) & [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
- **Form Validation**: [Zod](https://zod.dev/)
- **Email Service**: [Nodemailer](https://nodemailer.com/)
- **Runtime**: Node.js (v18+)

---

## 📂 Project Structure

```text
gym/
├── app/                  # Next.js App Router (Routes, Layouts, APIs)
├── components/           # Reusable UI Components
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/               # Base UI elements (Inputs, Buttons, etc.)
├── controllers/          # API Business Logic
├── repositories/         # Database Access Layer (Abstractions)
├── services/             # Higher-level Business Services
├── lib/                  # Shared Utilities (Prisma, Auth)
├── middlewares/          # Authentication and Authorization checks
├── prisma/               # Database Schema (schema.prisma)
├── public/               # Static Assets
├── types/                # TypeScript Definitions
└── utils/                # Helper functions (Timezones, Formatting)
```

---

## 💾 Data Model (Prisma)

The application uses a relational-style schema on MongoDB for flexibility and performance.

| Model | Description |
| :--- | :--- |
| **User** | Central entity storing profile, metrics, and relations to logs. |
| **UserPlan** | Links a user to their current 30-day workout and diet cycle. |
| **WorkoutLog** | Temporary entries for in-progress and completed sessions. |
| **WorkoutHistory** | Detailed immutable history of completed workouts. |
| **Streak** | Tracks current and longest streaks for gamification. |
| **Leaderboard** | Stores global scores and ranks (Streak > Calories > Workouts). |
| **DailyLeaderboard**| High-intensity daily ranking that resets every 24 hours. |
| **ScheduleItem** | Calendar-based items for daily tasks (workouts, meals). |
| **Diet** | Daily nutritional logs for macro and calorie tracking. |
| **Notification** | Stores category-based and priority-indexed messages. |
| **SystemSettings** | Global feature flags and system toggles. |
| **ExerciseLibrary**| Master list of exercises available in the system. |
| **CommunityPost** | User-generated content for the community feed. |
| **Friendship** | Tracks friend connections and pending requests. |
| **ChatMessage** | Direct messaging logs between friends. |
| **TrainerProfile** | Metadata, stats, and specialties for trainers. |
| **TrainerAssignment**| Link mapping users to their assigned trainers. |
| **Challenge** | Time-bound competitive events created by trainers. |

---

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gym
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file with the following:
   ```env
   DATABASE_URL="mongodb+srv://..."
   JWT_SECRET="your-secret-key"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   ```

4. **Initialize Database**
   ```bash
   npm run init
   ```
   *Note: This generates Prisma client, pushes the schema, and seeds initial data (Admin & Templates).*

5. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 📈 Future Roadmap
- **AI Integration**: Personalizing workout intensities based on historical performance.
- **Wearable Sync**: Integration with Apple Health and Google Fit.
- **Mobile App**: Native mobile experience using React Native.
