# Parvis Frontend (`parvis-website`)

**Parvis** (*Learn. Practice. Progress.*) is an intentional online learning platform built to help learners move beyond passive video watching through structured courses, interactive study tools, AI-assisted practice, progress tracking, and verifiable certificates of completion.

This repository contains the **Parvis Learner Web Application**, built with **React 19**, **Vite 7**, **React Router 7**, and **TanStack Query 5**.

---

## Key Features

- **Course & Tutorial Discovery (`/courses`, `/courses/:id`)**
  - Browse curated multi-lesson courses and focused single-video tutorials by category, difficulty, and search query.
  - Detailed course syllabus, learning outcomes, duration breakdown, and one-click enrollment.
- **Interactive Learning Workspace (`/learn/:id`)**
  - Distraction-free lesson player (`react-youtube`) with automatic playback position persistence and lesson completion tracking.
  - Built-in **Study Notes**, lesson summaries, **Practice Quizzes**, **Practical Exercises**, and **AI Study Assistant** powered by Google Gemini.
  - Course-specific community discussions for peer learning and Q&A.
- **Learner Dashboard & Progress Tracking (`/my-learning`, `/tutorials`)**
  - Track in-progress and completed courses, saved tutorials, daily learning streaks, and earned certificates.
- **Verifiable Certificates of Completion (`/certificates/:id`)**
  - Public certificate verification page and PDF certificate download (`LRN-XXXXXXXX`) with QR code verification.
- **Account, Onboarding & Billing (`/login`, `/register`, `/welcome`, `/profile`, `/settings`, `/billing/return`)**
  - Email/password and Google OAuth authentication, email verification, and guided learner onboarding.
  - Profile customization, avatar upload, notification/reminder preferences, Web Push opt-in, and Paystack subscription management (**Free**, **Growth**, and **Pro** plans).
- **Editorial & Public Pages (`/`, `/about`, `/blog`, `/blog/:slug`, `/privacy`, `/terms`)**
  - Responsive landing page, Parvis blog, about page, and legal documentation.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | React 19 (`react`, `react-dom`) |
| **Build Tool** | Vite 7 (`@vitejs/plugin-react`) |
| **Routing** | React Router DOM 7 (`react-router-dom`) |
| **Server State & Caching** | TanStack React Query 5 (`@tanstack/react-query`) |
| **Animations & Icons** | Framer Motion 13 (`framer-motion`), Lucide React (`lucide-react`) |
| **Integrations** | Google OAuth (`@react-oauth/google`), YouTube Player (`react-youtube`) |
| **Testing** | Vitest 5, React Testing Library (`jsdom`), Playwright (`@playwright/test`) |
| **Code Quality** | ESLint 9, Prettier 3 |

---

## Project Structure

```text
parvis-website/
├── public/                 # Static assets, service worker (Web Push), icons, and branding
├── src/
│   ├── assets/             # Bundled images and visual assets
│   ├── components/         # Shared layout and UI components
│   │   ├── Analytics.jsx   # Route analytics tracker
│   │   ├── Protected.jsx   # Authenticated route guard
│   │   ├── Shell.jsx       # Navigation shell, header, footer, and mobile menu
│   │   └── UI.jsx          # Reusable design system primitives, modals, and skeletons
│   ├── context/            # Auth and application state providers
│   ├── hooks/              # Custom React hooks and API query hooks
│   ├── lib/                # API client, formatters, and helper utilities
│   ├── pages/              # Route-level views (lazy-loaded in App.jsx)
│   │   ├── Landing.jsx
│   │   ├── Explore.jsx
│   │   ├── CourseDetail.jsx
│   │   ├── Learn.jsx
│   │   ├── MyLearning.jsx
│   │   ├── CertificateView.jsx
│   │   ├── Auth.jsx
│   │   ├── Onboarding.jsx
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx
│   │   ├── Notifications.jsx
│   │   ├── BillingReturn.jsx
│   │   └── PublicInfo.jsx  # About, Blog, BlogPost, Privacy & Terms
│   ├── test/               # Vitest unit/component tests
│   ├── App.jsx             # Top-level router and error boundary
│   ├── main.jsx            # Application bootstrap & providers
│   └── index.css           # Global styles, typography, and design tokens
├── e2e/                    # Playwright end-to-end browser tests
├── .env.example            # Template for environment variables
├── vite.config.js          # Vite bundler, dev server, and /api proxy configuration
└── package.json
```

---

## Prerequisites

- **Node.js** `>= 22.12.0`
- **npm** `>= 10`
- A running instance of **`parvis-backend`** (defaults to `http://127.0.0.1:3000` in development)

---

## Getting Started

1. **Install dependencies:**

   ```bash
   npm ci
   ```

2. **Configure environment variables:**

   Copy `.env.example` to `.env` if you do not already have one:

   ```bash
   cp -n .env.example .env
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   Vite starts on `http://localhost:5173` and proxies `/api` requests to `API_PROXY_TARGET` (`http://127.0.0.1:3000` by default).

---

## Environment Variables

Configured in `.env` (see [`.env.example`](./.env.example)):

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `/api` | Base URL for backend API requests (uses Vite proxy locally or reverse proxy in production) |
| `VITE_GOOGLE_CLIENT_ID` | *(empty)* | Google OAuth 2.0 Client ID (must match `GOOGLE_CLIENT_ID` on the backend) |
| `API_PROXY_TARGET` | `http://127.0.0.1:3000` | Local backend server URL targeted by the Vite development `/api` proxy |

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Build production assets into `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Lint source files with ESLint |
| `npm test` | Run unit and component tests with Vitest (`vitest run`) |
| `npm run test:e2e` | Run end-to-end browser tests with Playwright (`playwright test`) |
| `npm run format` | Format `src/` with Prettier |
