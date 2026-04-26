---
title: "Getting Started"
description: "Installation, build, and environment configuration"
---

## 1. Installation & Build

### 1.1 Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL database (Supabase recommended)
- Wallet private key (optional, for server-side signing)

### 1.2 Install Dependencies

```bash
npm install
```

The postinstall script automatically runs `prisma generate`.

### 1.3 Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with the appropriate values (see Section 6).

### 1.4 Database Setup

```bash
# Push schema to database
npm run db:push

# Or use migration
npm run db:migrate

# Seed initial data
npm run db:seed

# Open Prisma Studio (visual database browser)
npm run db:studio
```

### 1.5 Development Mode

```bash
npm run dev
```

Starts the Next.js dev server at `http://localhost:3000` with hot reload.

### 1.6 Production Build

```bash
npm run build
```

Build steps:
1. `prisma generate` — Generate Prisma Client
2. `next build` — Build optimized production bundle

### 1.7 Production Start

```bash
npm start
```

### 1.8 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Development server |
| `build` | `prisma generate && next build` | Production build |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run ESLint |
| `db:generate` | `prisma generate` | Generate Prisma Client |
| `db:push` | `prisma db push` | Push schema to database |
| `db:migrate` | `prisma migrate dev` | Run migrations |
| `db:seed` | `prisma db seed` | Seed database |
| `db:studio` | `prisma studio` | Visual database browser |
| `db:reset` | `prisma migrate reset` | Reset database |

---

## 2. Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string (Supabase pooler) |
| `DIRECT_URL` | No | `DATABASE_URL` | Direct database connection (bypass pooler) |
| `NEXT_PUBLIC_BASE_RPC_URL` | Yes | `https://sepolia.base.org` | Base RPC URL |
| `NEXT_PUBLIC_BASE_CHAIN_ID` | No | `84532` | Chain ID (84532=Sepolia, 8453=Mainnet) |
| `NEXT_PUBLIC_BASESCAN_URL` | No | `https://sepolia.basescan.org` | Block explorer URL |
| `BASESCAN_API_KEY` | No | - | BaseScan API key for contract verification |
| `WALLET_PRIVATE_KEY` | No | - | Server-side wallet private key (0x prefixed) |
| `CRON_SECRET` | No | `dev-secret-change-in-production` | Secret for cron/sync endpoints |
