# TokTickIT - IT Service Desk Application

TokTickIT is a full-stack IT Service Desk application built as part of CPE334 Introduction to Software Engineering.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Bootstrap 5
- **Backend:** Node.js, Express, TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Testing:** Vitest, Supertest, React Testing Library

---

## Directory Structure

```text
toktickit/
├── client/         # React + TypeScript + Vite frontend
├── server/         # Node.js + Express + Prisma backend
├── docs/           # Lab documentation (lab-01)
├── .gitignore      # Git ignore patterns
└── README.md       # Project setup and usage instructions
```

---

## Setup & Running Instructions

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database instance

### 2. Frontend Setup (`client`)
```bash
cd client
npm install
npm run dev     # Starts Vite dev server at http://localhost:5173
npm test        # Runs Vitest UI tests
```

### 3. Backend Setup (`server`)
```bash
cd server
npm install
# Copy environment template and configure database URL
cp .env.example .env
# Set DATABASE_URL in .env to your PostgreSQL database instance

npx prisma migrate dev  # Run Prisma database migrations
npm run prisma:seed    # Seed initial categories
npm run dev            # Starts Express API server at http://localhost:3000
npm test               # Runs Vitest API tests
```

---

## Branching & Workflow

- `main`: Stable release (production)
- `lab1-staging`: Integration branch for Lab 1
- Feature branches: `feature/<issue-number>-<feature-name>`