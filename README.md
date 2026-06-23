# Aaro — Trainer Session Attendance Dashboard

**Naan Mudhalvan Internship** — UNM–NM Oracle Internship | 4th Semester  
Technology: React JSX | Role: Frontend Developer

---

## Project Overview

A web-based attendance management system for training managers and administrators to record, track, and analyze student attendance across multiple training batches.

## Technology Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | ^18.3.1 | UI library |
| Vite | ^5.x | Build tool |
| React Router DOM | ^6.23.1 | Client-side routing |
| Tailwind CSS | ^3.4.4 | Utility-first styling |
| Axios | ^1.7.2 | HTTP client (future API) |
| Recharts | ^2.12.7 | Chart components |

## Prerequisites

- Node.js v20.x LTS (minimum v18.18)
- npm v10.x

## Setup & Installation

```bash
# Clone the repository
git clone <repo-url>
cd trainer-attendance-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173)

## Mock Login Credentials

| Role | Email | Password |
|------|-------|---------|
| Admin | admin@nmattendance.com | any value |
| Manager | manager@nmattendance.com | any value |
| Trainer | trainer@nmattendance.com | any value |

> In development mode (`VITE_USE_MOCK=true`), any non-empty password is accepted.

## Environment Variables

| Variable | Dev | Prod |
|----------|-----|------|
| `VITE_USE_MOCK` | `true` | `false` |
| `VITE_APP_TITLE` | Dashboard title | Dashboard title |
| `VITE_API_BASE_URL` | — | API endpoint |

## Build for Production

```bash
npm run build
npm run preview  # Preview the production build
```

## Deployment

Deploy the `dist/` folder to Vercel or Netlify:
- **Vercel**: Connect the repo, set `npm run build` and output `dist`
- **Netlify**: Drag-and-drop `dist` or connect via Git

## Project Structure

```
src/
├── assets/              Static media
├── components/
│   ├── common/          Reusable UI primitives (Button, Badge, Card, etc.)
│   ├── layout/          Sidebar, TopBar, PageWrapper
│   └── charts/          Recharts chart wrappers
├── pages/               Route-level page components
├── services/            Data access layer (mock + future API)
├── hooks/               Custom React hooks
├── context/             AuthContext, AppContext
├── routes/              AppRouter, ProtectedRoute
├── utils/               dateUtils, calcUtils, exportUtils, validationUtils
├── constants/           Enums, routes, theme, storage keys
├── data/                Mock data seed files
└── styles/              Global CSS + Tailwind directives
```

## Development Phases

- [x] Phase 1 — Architecture planning & review
- [x] Phase 2.1 — Project initialization & foundation
- [ ] Phase 2.2 — Layout system (Sidebar, TopBar, PageWrapper)
- [ ] Phase 3 — Shared component library
- [ ] Phase 4 — Batch Management module
- [ ] Phase 5 — Student Management module
- [ ] Phase 6 — Attendance module
- [ ] Phase 7 — Reports module
- [ ] Phase 8 — Analytics module
- [ ] Phase 9 — Validation & polish
- [ ] Phase 10 — Deployment
