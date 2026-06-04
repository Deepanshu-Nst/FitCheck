# FitCheck 🎯

> AI-powered outfit feedback app — built for Stylicaa

A consumer-grade React Native mobile application where users upload outfit photos and receive AI-powered feedback on style, fit, color harmony, and occasion suitability.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (Expo SDK 56), TypeScript, Expo Router |
| Styling | NativeWind v4, Custom Design Tokens |
| State | Zustand, TanStack Query |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL + Storage) |
| AI | Groq (llama-3.2-11b-vision-preview) |
| Auth | JWT + Expo SecureStore |

---

## Project Structure

```
FitCheck/
├── apps/
│   ├── mobile/          # React Native (Expo) app
│   │   ├── app/         # Expo Router screens
│   │   │   ├── (auth)/  # Login, Signup
│   │   │   ├── (tabs)/  # Home, Upload, History, Profile
│   │   │   ├── feedback/[outfitId].tsx
│   │   │   └── outfit/[id].tsx
│   │   └── src/
│   │       ├── components/
│   │       ├── constants/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── store/
│   └── backend/         # Express API server
│       └── src/
│           ├── controllers/
│           ├── middleware/
│           ├── routes/
│           ├── services/
│           ├── utils/
│           └── database/
└── packages/
    └── shared/          # Shared Zod schemas + TypeScript types
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+
- Expo CLI (`npm install -g expo-cli`)
- A Supabase project (free tier works)
- A Groq API key (free at [console.groq.com](https://console.groq.com))

---

### 1. Database Setup

Go to your [Supabase SQL Editor](https://app.supabase.com/project/_/sql) and run:

```
apps/backend/src/database/schema.sql
```

Also create a **Storage Bucket**:
- Name: `outfit-images`
- Public: **Yes**

---

### 2. Backend Setup

```bash
cd apps/backend

# Copy env file and fill in your values
cp .env.example .env

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

# Copy env file and fill in your values
cp .env.example .env

# Start Expo
npm start
```

> **Note:** For physical device testing, set `EXPO_PUBLIC_API_URL` to your machine's local IP (e.g., `http://192.168.1.100:3000`).

---

## Running Without API Keys

The app runs in **mock mode** when keys are missing:
- **No Groq key** → AI feedback uses realistic pre-built responses
- **No Supabase** → Backend will log warnings but start; DB calls will fail gracefully

---

## Key Flows

### Upload → Feedback
1. User picks/takes a photo → Expo Image Picker
2. Image compressed to 1200px JPEG → Expo Image Manipulator
3. Multipart upload to backend → Multer → Supabase Storage
4. Outfit metadata saved to PostgreSQL
5. Groq vision model analyzes the image
6. Structured feedback JSON parsed and stored
7. User redirected to Feedback screen

### Auth Flow
1. Email signup/login → JWT issued → stored in Expo SecureStore
2. App launch → token hydrated → profile fetched → auto-login
3. Protected routes redirect unauthenticated users to `/auth/login`

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | ❌ | Email signup |
| POST | `/auth/login` | ❌ | Email login |
| POST | `/auth/google` | ❌ | Google OAuth |
| GET | `/users/profile` | ✅ | Get profile |
| PUT | `/users/profile` | ✅ | Update profile |
| POST | `/outfits/upload` | ✅ | Upload outfit |
| GET | `/outfits/history` | ✅ | Paginated history |
| GET | `/outfits/:id` | ✅ | Single outfit |
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
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | ✅ | Service role key (bypasses RLS) |
| `GROQ_API_KEY` | ⚠️ | Groq API key (mock mode if missing) |
| `PORT` | ❌ | Server port (default: 3000) |

### Mobile (`apps/mobile/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | ✅ | Backend URL |
| `EXPO_PUBLIC_SUPABASE_URL` | ⚠️ | For future direct client use |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ⚠️ | Anon key (safe to expose) |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS` | ⚠️ | For Google Sign-In |

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
