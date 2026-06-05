# FitCheck 🎯

> AI-powered outfit feedback app — built for Stylicaa

A consumer-grade React Native mobile application where users upload outfit photos and receive AI-powered feedback on style, fit, color harmony, and occasion suitability.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (Expo SDK 54), TypeScript, Expo Router |
| Styling | NativeWind v4, Custom Design Tokens |
| State | Zustand, TanStack Query |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express, TypeScript |
| Database | **Neon PostgreSQL** |
| ORM | **Drizzle ORM** |
| Storage | **Cloudinary** |
| AI | Groq (llama-4-scout-17b) |
| Auth | Email/Password + JWT + bcrypt + Expo SecureStore |

---

## Project Structure

```
FitCheck/
├── apps/
│   ├── mobile/          # React Native (Expo) app
│   │   ├── app/         # Expo Router screens
│   │   │   ├── (auth)/  # Login, Signup, Onboarding
│   │   │   ├── (tabs)/  # Home, Upload, History, Profile
│   │   │   ├── feedback/[outfitId].tsx
│   │   │   ├── upload/  # Preview, Occasion
│   │   │   └── profile/ # Edit, Settings
│   │   └── src/
│   │       ├── components/
│   │       ├── constants/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── store/
│   └── backend/         # Express API server
│       └── src/
│           ├── db/              # Drizzle schema, migrations, connection
│           ├── controllers/
│           ├── middleware/
│           ├── routes/
│           ├── services/        # imageService (Cloudinary), groqService
│           └── utils/
└── packages/
    └── shared/          # Shared Zod schemas + TypeScript types
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+
- Expo CLI (`npm install -g expo-cli`)
- A [Neon](https://neon.tech) PostgreSQL project (free tier)
- A [Cloudinary](https://cloudinary.com) account (free tier)
- A Groq API key (free at [console.groq.com](https://console.groq.com))

---

### 1. Database Setup (Neon)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy your **Connection String** from the dashboard
3. Add it to `apps/backend/.env` as `DATABASE_URL`
4. Run schema push:

```bash
cd apps/backend
npm run db:push
```

---

### 2. Backend Setup

```bash
cd apps/backend

# Copy env file and fill in your values
cp .env.example .env
# Edit .env: add DATABASE_URL, CLOUDINARY_*, GROQ_API_KEY

# Install dependencies
npm install

# Start development server
npm run dev
```

The API runs at `http://localhost:3000`.

---

### 3. Mobile Setup

```bash
cd apps/mobile

# Start Expo
npm start
```

> **Note:** For physical device testing, set `EXPO_PUBLIC_API_URL` in a `.env` file to your machine's local IP (e.g., `http://192.168.1.100:3000`).

---

## Running Without All Keys

| Missing | Behavior |
|---------|---------|
| `GROQ_API_KEY` | AI feedback uses realistic mock responses |
| `CLOUDINARY_*` | Image uploads will fail at the upload step |
| `DATABASE_URL` | Server will crash on start — Neon is required |

---

## Key Flows

### Upload → Feedback
1. User picks/takes a photo → Expo Image Picker
2. Image compressed to 1200px JPEG → Expo Image Manipulator
3. Multipart upload → Multer (memory buffer) → **Cloudinary**
4. Outfit row saved to **Neon PostgreSQL** via Drizzle
5. Groq vision model analyzes the image URL
6. Structured feedback JSON stored in `feedback` table
7. User redirected to Feedback screen

### Auth Flow
1. Email signup → bcrypt hash → Drizzle INSERT → JWT issued → stored in Expo SecureStore
2. App launch → token hydrated → `GET /users/profile` → auto-login
3. Protected routes redirect unauthenticated users to `/auth/login`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | ❌ | Email signup |
| POST | `/auth/login` | ❌ | Email login |
| GET | `/users/profile` | ✅ | Get profile |
| PUT | `/users/profile` | ✅ | Update profile |
| POST | `/outfits/upload` | ✅ | Upload outfit to Cloudinary |
| GET | `/outfits/history` | ✅ | Paginated history |
| GET | `/outfits/:id` | ✅ | Single outfit + feedback |
| POST | `/feedback/generate` | ✅ | Generate AI feedback |
| GET | `/feedback/:outfitId` | ✅ | Get feedback |
| GET | `/admin/submissions` | ✅ Admin | All submissions |
| PATCH | `/admin/review/:id` | ✅ Admin | Review/flag |

---

## Environment Variables

### Backend (`apps/backend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | Secret for signing JWTs |
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `GROQ_API_KEY` | ⚠️ | Groq API key (mock mode if missing) |
| `PORT` | ❌ | Server port (default: 3000) |

### Mobile (`apps/mobile/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | ✅ | Backend URL |

---

## Database Scripts

```bash
cd apps/backend

npm run db:push      # Apply schema to Neon (development)
npm run db:generate  # Generate migration SQL files
npm run db:studio    # Open Drizzle Studio (visual DB browser)
```

---

## Design System

The app uses a custom fashion-tech dark theme:
- **Primary**: Deep charcoal `#0A0A0F`
- **Accent**: Gold `#C8A96E`
- **Typography**: Inter (400/500/600/700)
- **Radius**: Rounded cards (16–32px)
- **Shadows**: Subtle with gold glow on primary elements

---

Built with ❤️ for Stylicaa
