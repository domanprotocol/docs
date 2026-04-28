---
title: "Setup & Deployment"
description: "Install, configure, run, and deploy the DOMAN indexer service"
---

# Setup & Deployment

---

## Prerequisites

- Node.js >= 18.14
- npm

---

## Installation

```bash
git clone <repo-url>
cd doman-indexer
npm install
```

---

## Configuration

### Environment Variables

Copy the example file or create `.env.local` manually:

```bash
cp .env.local.example .env.local
```

```env
# RPC URL for Base Sepolia (required)
PONDER_RPC_URL_84532=https://sepolia.base.org

# PostgreSQL connection string (optional — defaults to SQLite)
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

| Variable | Required | Description |
|---|---|---|
| `PONDER_RPC_URL_84532` | Yes | RPC endpoint for Base Sepolia |
| `DATABASE_URL` | No | PostgreSQL connection string. Omit to use SQLite. |

### Ponder Configuration

The indexer is configured in `ponder.config.ts`:

```mermaid
graph LR
    PC["ponder.config.ts"]
    Chain["Chain: Base Sepolia<br/>Chain ID: 84532"]
    Contract["Contract: ScamReporter<br/>Address: 0x6553...237a<br/>Start Block: 40726553"]
    ABI["ABI: ScamReportAbi.ts"]

    PC --> Chain
    PC --> Contract
    Contract --> ABI
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run indexer in development mode (hot reload) |
| `npm run start` | Run indexer in production mode |
| `npm run codegen` | Generate TypeScript types from schema |
| `npm run db` | Database management commands |
| `npm run serve` | Run API server only |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check TypeScript types |

---

## Local Development

```bash
npm run dev
```

The indexer will start processing blocks from the configured start block and expose the API at `http://localhost:42069`.

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Ponder as Ponder (dev)
    participant Chain as Base Sepolia
    participant DB as SQLite

    Dev->>Ponder: npm run dev
    Ponder->>Chain: Fetch events from block 40726553
    Chain-->>Ponder: ScamVoteSubmitted / ScamReportSubmitted
    Ponder->>DB: Insert indexed data
    Ponder->>Ponder: Hot reload on file change
    Note over Ponder: API live at localhost:42069
```

---

## Deployment (Railway)

The project is configured for **Railway** deployment using Nixpacks. The start command automatically uses `npx ponder start`.

### Deploy Steps

1. Connect the repository to Railway
2. Set environment variable `PONDER_RPC_URL_84532` with your RPC URL
3. (Optional) Set `DATABASE_URL` to use PostgreSQL instead of SQLite
4. Deployment runs automatically

```mermaid
graph LR
    Repo["GitHub Repo"] -->|push| Railway["Railway"]
    Railway --> Nixpacks["Nixpacks Build"]
    Nixpacks --> Ponder["npx ponder start"]
    Ponder --> DB["PostgreSQL<br/>(Railway add-on)"]
    Ponder --> API["API :42069"]
```

### Recommended Railway Add-ons

- **PostgreSQL** — For persistent, production-grade storage (recommended over SQLite)
- **Environment Variables** — Set `PONDER_RPC_URL_84532` and optionally `DATABASE_URL`
