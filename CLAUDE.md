# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Peta Malaysia** is a Next.js application (using Pages Router) that visualizes Malaysian state data including income, population, crime statistics, water consumption, and expenditure. The app features:
- Interactive Malaysia map with state-level data visualization
- Polling system for user engagement with gamification (points/exp)
- Bilingual support (English/Bahasa Malaysia) via Google Translate API
- User authentication via Clerk
- Data storage via Supabase

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (with webpack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

Development server runs at `http://localhost:3000`

## Environment Setup

Required environment variables in `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PROJECT_ID=

# Google Translate API (optional)
NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=
```

See `ENV_LOCAL_REFERENCE.md` for full list of available environment variables.

## Architecture

### Next.js Pages Router Structure

- `pages/index.tsx` - Home page with Malaysia map and data visualization
- `pages/polls/index.tsx` - Polling system with gamification
- `pages/profile.tsx` - User profile and statistics
- `pages/api/` - API routes (auth callbacks, hello endpoint)
- `middleware.ts` - Clerk authentication middleware (protects non-public routes)

### Context Providers (Global State)

The app uses multiple React contexts wrapped in `pages/_app.tsx`:

1. **ClerkProvider** - Authentication state
2. **ThemeProvider** (`contexts/ThemeContext.tsx`) - Dark/light mode with localStorage persistence
3. **LanguageProvider** (`contexts/LanguageContext.tsx`) - EN/MS translation state and translation functions
4. **UserProfileProvider** (`contexts/UserProfileContext.tsx`) - User data, points, exp, selected state from Supabase
5. **DataProvider** (`contexts/DataContext.tsx`) - Malaysian state data (income, population, crime, water, expenditure) from government APIs

### Data Flow

**Malaysian Government Data**:
- Data is fetched from `data.gov.my` APIs via `hooks/useDataFetching.ts`
- API endpoints defined in `lib/constants.ts` (API_ENDPOINTS)
- Data categories: income_median, population, crime, water_consumption, expenditure
- `DataContext` provides `getStateData()` and `chartData` for components
- State name mapping handled via `STATE_MAPPING` in `lib/constants.ts`

**User Data (Supabase)**:
- Database schema defined in `lib/supabase.ts` (Database interface)
- Tables: `users`, `polls`, `poll_options`, `votes`, `states`
- Users table stores: clerk_user_id, username, email, selected_state, points, exp
- Polls support voting with state-level tracking
- `UserProfileContext` syncs Clerk auth with Supabase user records

### Translation System

Bilingual support (EN/MS) with two approaches:

**Pre-defined translations** (recommended for static text):
```tsx
import { useTranslation } from '@/hooks/useTranslation';

const title = useTranslation({
  en: 'Welcome',
  ms: 'Selamat Datang'
});
```

**Auto-translation via Google Translate API** (for dynamic content):
```tsx
const dynamicText = useTranslation('This will be auto-translated');
```

**Batch translations**:
```tsx
import { useTranslations } from '@/hooks/useTranslation';

const t = useTranslations({
  title: { en: 'Home', ms: 'Laman Utama' },
  subtitle: 'Auto-translate this'
});
```

- Common translations stored in `lib/translation.ts` (commonTranslations object)
- Translation utilities: `translateText()`, `detectLanguage()`, `getSupportedLanguages()`
- Full guide in `TRANSLATION_GUIDE.md`

### Component Structure

**UI Components** (`components/ui/`):
- Built with shadcn/ui and Radix UI primitives
- Styled with Tailwind CSS v4
- Includes: button, dialog, card, chart, tooltip, select, etc.

**Feature Components** (`components/`):
- `MalaysiaMap.tsx` - SVG-based interactive map, handles state selection and data display
- `ChartSection.tsx` - Data visualization using recharts
- `CategorySelectorDialog.tsx` - Category selection UI
- `StateSelector.tsx` - State selection dropdown
- `PageHeader.tsx` - Navigation with theme toggle and language toggle
- `MobileBottomNav.tsx` - Bottom navigation for mobile
- `UserStatsDialog.tsx` - User statistics modal
- `AuthButton.tsx` - Clerk authentication button

### Styling

- **Tailwind CSS v4** with PostCSS
- Dark mode support via ThemeContext
- Color schemes per data category:
  - income_median: blue (#3b82f6)
  - population: green (#10b981)
  - crime: red (#ef4444)
  - water_consumption: cyan (#06b6d4)
  - expenditure: orange (#f59e0b)

### Authentication Flow

1. Clerk handles authentication UI and session management
2. Middleware protects non-public routes (see `middleware.ts`)
3. Public routes: `/`, `/polls`, `/profile`, `/privacy`, `/terms`, `/api/hello`, sign-in/up pages
4. On sign-in, `UserProfileContext` creates/updates Supabase user record
5. User's selected state and gamification data (points/exp) stored in Supabase

## Key Files and Helpers

- `lib/helpers.ts` - Data formatting, state name mapping, value extraction
- `lib/constants.ts` - API endpoints, state mappings, chart configurations
- `lib/seo.ts` - SEO configuration and structured data
- `data/states.tsx` - Malaysia map SVG paths and state metadata
- `data/polls.ts` - Poll data structure
- `types/index.ts` - TypeScript type definitions

## Working with Data

**Accessing state data in components**:
```tsx
import { useData } from '@/contexts/DataContext';

const { activeState, selectedCategory, getStateData, chartData } = useData();
const stateInfo = getStateData('selangor', 'income_median');
```

**State name mapping**:
- Component IDs use lowercase (e.g., 'selangor', 'kualalumpur')
- Data APIs use proper names (e.g., 'Selangor', 'W.P. Kuala Lumpur')
- Use `mapStateName()` from `lib/helpers.ts` for conversion

## Testing and Building

- ESLint configured via `eslint.config.mjs`
- TypeScript strict mode enabled
- Build output in `.next/` (gitignored)
- Webpack mode enabled for builds

## Important Notes

- Uses Next.js 16 with React 19
- Pages Router (not App Router)
- Supabase auth is disabled (persistSession: false) - Clerk handles authentication
- Google Translate API has usage limits - prefer pre-defined translations for static text
- Mobile-responsive with dedicated mobile navigation component
