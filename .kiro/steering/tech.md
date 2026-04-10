# Technology Stack

## Build System & Package Management

**Package Manager**: pnpm (v8.15.0+)
**Node Version**: 18.0.0+
**Monorepo Structure**: Multi-app workspace with shared dependencies

## Frontend Stack

**Framework**: Next.js 14.0.4 (App Router)
**Runtime**: React 18.2.0
**Language**: TypeScript 5.3.3 with strict mode enabled
**Styling**: Tailwind CSS 3.4.0 with tailwindcss-animate
**UI Components**: 
- Radix UI primitives (Dialog, Dropdown, Select, Tabs, Tooltip, etc.)
- Custom UI components in `src/components/ui/`
- Framer Motion for animations
- Lucide React & HugeIcons for icons

**State Management**: React Context API (see `src/contexts/auth-context.tsx`)

## Backend & Database

**Database**: Supabase (PostgreSQL)
**ORM**: Supabase JS Client v2.90.1+
**Authentication**: Supabase Auth with PKCE flow + custom provider authentication
**API**: Next.js API Routes (App Router convention in `src/app/api/`)
**Security**: Row Level Security (RLS) policies in Supabase

## Key Libraries

**Document Processing**:
- Google Cloud Vision API (@google-cloud/vision) for OCR
- Tesseract.js as fallback OCR
- OpenCV.js for image processing
- XLSX for Excel file handling

**Forms & Validation**:
- React Signature Canvas for digital signatures
- React Day Picker for date selection
- Custom form handling (no form library)

**Utilities**:
- clsx + tailwind-merge (via `cn()` utility)
- date-fns for date manipulation
- axios for HTTP requests

## Testing

**Framework**: Jest 29.7.0 with jsdom environment
**Testing Library**: @testing-library/react 14.1.2
**Config**: `jest.config.js` and `jest.setup.js` in frontend root

## Development Configuration

**TypeScript**: 
- Path alias: `@/*` maps to `src/*`
- Module resolution: bundler
- Strict mode enabled
- JSX: preserve (handled by Next.js)

**ESLint**: Next.js ESLint config (builds ignore linting errors)
**Prettier**: Configured for consistent formatting

## Common Commands

```bash
# Development (runs all apps in parallel)
pnpm dev

# Development with port cleanup
pnpm dev:clean

# Build all apps
pnpm build

# Run tests across all apps
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format

# Kill duplicate ports (Windows-specific)
pnpm kill-ports
```

## Frontend-Specific Commands

```bash
cd apps/frontend

# Development server (port 3001)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run tests
npm test

# Watch mode for tests
npm run test:watch

# Type check without emitting
npm run typecheck
```

## Environment Variables

Required variables in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Google Cloud Vision (OCR)
# Requires google-vision-key.json file in frontend root
```

## API Route Conventions

- Routes in `src/app/api/` follow App Router file conventions
- Use `route.ts` for API endpoints
- Export named functions: GET, POST, PATCH, DELETE
- Return `Response` or `NextResponse` objects
- Error handling via try-catch with appropriate status codes

## Database Client Patterns

**Client-side**: Use `src/lib/supabase.ts` (browser client with session persistence)
**Server-side**: Use `src/lib/supabase-server.ts` (server client for API routes)

## Security Notes

- Never commit `google-vision-key.json` or service account files
- Use environment variables for all secrets
- Supabase client configured with 60-second timeout for storage uploads
- PKCE flow enabled for authentication
- Custom error suppression for browser extension conflicts
