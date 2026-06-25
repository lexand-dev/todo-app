# Todo App

Next.js + PostgreSQL (Neon) + Drizzle ORM.

## Setup

### 1. Create a Neon database

```bash
# Auth with Neon
neonctl auth

# Create a project
neonctl projects create --name todo-app --region-id aws-us-east-2

# Get connection string
neonctl connection-string --database-name neondb
```

Copy the connection string into `.env`:

```
DATABASE_URL=postgresql://...
```

### 2. Push schema to database

```bash
npm run db:push
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

```bash
vercel
```

Add `DATABASE_URL` as an environment variable in Vercel's dashboard or via CLI:

```bash
vercel env add DATABASE_URL
```
