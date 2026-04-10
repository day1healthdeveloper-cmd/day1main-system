# Project Structure

## Monorepo Organization

```
day1main/
├── apps/
│   └── frontend/          # Next.js application (port 3001)
├── .kiro/                 # Kiro AI configuration
│   ├── specs/            # Feature specifications
│   └── steering/         # AI guidance documents
└── package.json          # Root workspace configuration
```

## Frontend Application Structure

```
apps/frontend/
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   ├── components/       # React components
│   ├── contexts/         # React Context providers
│   ├── lib/              # Utility functions & clients
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── scripts/              # Database & utility scripts
└── [config files]        # next.config.js, tsconfig.json, etc.
```

## App Directory (Next.js App Router)

**Route Structure**: File-based routing with route groups and layouts

```
src/app/
├── page.tsx                    # Landing page (/)
├── layout.tsx                  # Root layout with AuthProvider
├── globals.css                 # Global styles
│
├── api/                        # API Routes
│   ├── ocr/route.ts           # Google Vision OCR endpoint
│   ├── leads/route.ts         # Lead capture
│   ├── applications/route.ts  # Application submission
│   └── admin/                 # Admin API endpoints
│       ├── members/[id]/route.ts
│       └── [other resources]/
│
├── admin/                      # Admin department pages
├── broker/                     # Broker portal
├── call-centre/               # Call centre interface
├── claims/                    # Member claims view
├── claims-assessor/           # Claims processing workbench
├── compliance/                # Compliance department
├── finance/                   # Finance department
├── marketing/                 # Marketing department
├── operations/                # Operations department
├── provider/                  # Provider portal
├── apply/                     # Member application flow
├── login/                     # Authentication
├── dashboard/                 # Member dashboard
└── [other routes]/
```

## Components Organization

```
src/components/
├── ui/                        # Reusable UI primitives
│   ├── dialog.tsx            # Modal dialogs
│   ├── toast.tsx             # Toast notifications
│   ├── moving-border.tsx     # Animated borders
│   ├── glowing-button.tsx    # Styled buttons
│   └── [other primitives]/
│
├── admin/                     # Admin-specific components
├── apply-steps/              # Application flow steps
│   ├── Step1Personal.tsx
│   ├── Step2Documents.tsx
│   ├── Step5Dependents.tsx
│   ├── Step6MedicalHistory.tsx
│   ├── Step7Banking.tsx
│   └── Step6ReviewTermsSubmit.tsx
│
├── benefits/                  # Benefit display components
├── feedback/                  # User feedback components
├── hooks/                     # Custom React hooks
├── landing-page/             # Landing page sections
├── layout/                   # Layout components (headers, sidebars)
└── policy/                   # Policy-related components
```

## Library & Utilities

```
src/lib/
├── supabase.ts               # Client-side Supabase client
├── supabase-server.ts        # Server-side Supabase client
├── storage.ts                # Storage utilities
├── utils.ts                  # Common utilities (cn() helper)
└── generate-member-number.ts # Member number generation
```

## Type Definitions

```
src/types/
└── application.ts            # ApplicationData, Dependent, MedicalHistory
```

## Public Assets

```
public/
├── brochures/                # PDF plan brochures
├── plan exact wording/       # Policy documents
├── icons/                    # Feature icons
├── animated icons/           # Animated GIFs
└── [images]                  # Logos, backgrounds, hero images
```

## Scripts Directory

Contains 77+ utility scripts for database operations:
- Member data analysis and import
- Claims schema validation
- Provider data management
- Excel/CSV data processing
- Database integrity checks

## Configuration Files

**Root Level**:
- `package.json` - Workspace configuration with pnpm
- `.gitignore` - Excludes node_modules, .env files, google-vision-key.json
- `.prettierrc` - Code formatting rules
- `.eslintrc.json` - Linting configuration

**Frontend Level**:
- `next.config.js` - Next.js configuration (port 3001, SWC minification)
- `tsconfig.json` - TypeScript config with `@/*` path alias
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `jest.config.js` - Jest testing configuration

## Naming Conventions

**Files**:
- Pages: `page.tsx` (App Router convention)
- API Routes: `route.ts` (App Router convention)
- Components: PascalCase (e.g., `Step1Personal.tsx`)
- Utilities: kebab-case (e.g., `generate-member-number.ts`)
- Types: kebab-case (e.g., `application.ts`)

**Components**:
- React components: PascalCase
- Utility functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase

**Database**:
- Tables: snake_case (e.g., `member_dependants`)
- Columns: snake_case (e.g., `created_at`)

## Key Architectural Patterns

**Authentication Flow**:
1. User logs in via `/login`
2. AuthContext (`src/contexts/auth-context.tsx`) manages session
3. Dual authentication: Supabase Auth (departments) + Custom (providers)
4. Protected routes check `isAuthenticated` from context

**API Route Pattern**:
1. Import server-side Supabase client from `lib/supabase-server.ts`
2. Validate request and authentication
3. Perform database operations
4. Return NextResponse with appropriate status codes
5. Error handling with try-catch

**Component Pattern**:
1. Import utilities via `@/` path alias
2. Use `cn()` for conditional Tailwind classes
3. Fetch data via API routes (not direct Supabase calls in components)
4. Use React Context for global state
5. Custom hooks in `components/hooks/`

**Multi-Step Forms**:
- Centralized state in parent component
- Step components receive `data`, `updateData`, `nextStep`, `prevStep` props
- Data persists across steps via parent state
- Final submission on last step

## Department-Specific Routes

Each department has dedicated routes with role-based access:
- `/admin/*` - System administration
- `/broker/*` - Broker management
- `/call-centre/*` - Customer support
- `/claims-assessor/*` - Claims processing
- `/compliance/*` - Regulatory compliance
- `/finance/*` - Financial operations
- `/marketing/*` - Marketing campaigns
- `/operations/*` - Operational tasks
- `/provider/*` - Provider portal

## Testing Structure

```
src/
├── app/__tests__/            # Page-level tests
└── lib/__tests__/            # Utility function tests
```

Test files colocated with source files using `__tests__` directories.
