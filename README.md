# Day1Main - Medical Insurer Operating System

A comprehensive South African medical insurer and health-financing operating system with compliance built into the architecture.

## Features

- **Dual Operating Modes**: Medical Scheme Administration (CMS) and Insurance (FSCA/PA)
- **Compliance by Construction**: POPIA, FICA, and SARS compliance built-in
- **Complete Lifecycle Management**: Members, policies, claims, payments, and more
- **Property-Based Testing**: Correctness properties verified through automated testing
- **Modern Tech Stack**: NestJS, Next.js, PostgreSQL, Redis

## Project Structure

```
day1main/
├── apps/
│   ├── backend/          # NestJS backend API
│   └── frontend/         # Next.js frontend application
├── packages/             # Shared packages (to be added)
└── docker-compose.yml    # Local development services
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker and Docker Compose

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Development Services

```bash
docker-compose up -d
```

This starts PostgreSQL and Redis containers for local development.

### 3. Set Up Environment Variables

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
```

### 4. Run Database Migrations

```bash
cd apps/backend
pnpm prisma migrate dev
```

### 5. Start Development Servers

```bash
# From root directory
pnpm dev
```

This starts:
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

## Development

### Backend (NestJS)

```bash
cd apps/backend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm lint         # Lint code
```

### Frontend (Next.js)

```bash
cd apps/frontend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Lint code
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:cov
```

## Architecture

Day1Main is built with a modular architecture consisting of 12 core services:

1. Identity & Access (IAM)
2. Member & Policy Administration
3. Product & Rules Engine
4. Provider Network Management
5. Claims & Pre-Authorisation
6. Payments & Collections
7. Finance Ledger & Reconciliation
8. Broker Management
9. Marketing & CRM
10. Complaints & Disputes
11. Compliance & Risk
12. Reporting & Analytics

## Documentation

- [Requirements](.kiro/specs/day1main-medical-insurer/requirements.md)
- [Design](.kiro/specs/day1main-medical-insurer/design.md)
- [Implementation Tasks](.kiro/specs/day1main-medical-insurer/tasks.md)

## License

PROPRIETARY - All rights reserved
