---
title: "Indexer"
description: "Blockchain indexer service for ScamReporter events on Base Sepolia using Ponder"
---

# DOMAN Indexer

Blockchain indexer service for the **ScamReporter** smart contract on Base Sepolia testnet. Indexes on-chain scam report and vote events, then exposes the data through GraphQL and SQL APIs.

Built with [Ponder](https://ponder.sh/) — a TypeScript-based blockchain indexing framework.

**Live API:** [https://doman-indexer.up.railway.app](https://doman-indexer.up.railway.app)

> The indexer is the bridge between on-chain events and off-chain queries. It ensures every `ScamVoteSubmitted` and `ScamReportSubmitted` event is captured, stored, and queryable in real time.

---

## Architecture

```mermaid
graph TD
    SC["ScamReporter.sol<br/>(Base Sepolia)"]
    P["Ponder Indexer"]
    EH["Event Handlers"]
    DB["Database<br/>(SQLite / PostgreSQL)"]
    API["Hono API Server"]
    GQL["/graphql"]
    SQL["/sql/*"]
    ROOT["/"]

    SC -->|"ScamVoteSubmitted<br/>ScamReportSubmitted"| P
    P --> EH
    EH -->|"user<br/>scam_vote<br/>scam_report"| DB
    DB --> API
    API --> GQL
    API --> SQL
    API --> ROOT
```

### Event Flow

```mermaid
sequenceDiagram
    participant User as User / Extension
    participant Contract as ScamReporter.sol
    participant Indexer as Ponder Indexer
    participant DB as Database
    participant API as Hono API

    User->>Contract: submitVote()
    Contract->>Contract: Emit ScamVoteSubmitted
    Indexer->>Contract: Poll new events
    Indexer->>DB: Insert scam_vote + update user
    User->>API: GET /sql/scam_vote
    API->>DB: Query data
    DB-->>API: Result rows
    API-->>User: JSON response
```

---

## Indexed Data

### Tables

| Table         | Description                                             |
| ------------- | ------------------------------------------------------- |
| `user`        | Wallet addresses with aggregated vote and report counts |
| `scam_vote`   | Individual scam votes on specific targets               |
| `scam_report` | Scam reports submitted by users                         |

### Monitored Events

| Event                 | Trigger                          | Indexed Fields                                               |
| --------------------- | -------------------------------- | ------------------------------------------------------------ |
| `ScamVoteSubmitted`   | `submitVote()` called            | `reporter`, `targetId`, `targetType`, `reasonHash`, `isScam` |
| `ScamReportSubmitted` | `submitReport()` called (legacy) | `reporter`, `reasonHash`, `isScam`                           |

---

## Smart Contract

| Property           | Value                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Name               | ScamReporter                                                                                                                    |
| Network            | Base Sepolia (Chain ID: 84532)                                                                                                  |
| Address (Current)  | [`0x574F67B22B49eFd39D03F51627fA79CEB4a2449C`](https://sepolia.basescan.org/address/0x574F67B22B49eFd39D03F51627fA79CEB4a2449C) |
| Address (Previous) | [`0x65534f1A1BbCa98AD756c7CE38D7097fBA7C237a`](https://sepolia.basescan.org/address/0x65534f1A1BbCa98AD756c7CE38D7097fBA7C237a) |
| Start Block        | 40726553                                                                                                                        |

---

## Tech Stack

| Component           | Technology | Version |
| ------------------- | ---------- | ------- |
| Indexing Framework  | Ponder     | 0.16.6  |
| Web Framework       | Hono       | -       |
| Ethereum Library    | Viem       | -       |
| Language            | TypeScript | -       |
| Database (default)  | SQLite     | -       |
| Database (optional) | PostgreSQL | -       |

---

## Project Structure

```
doman-indexer/
├── abis/
│   └── ScamReportAbi.ts        # Smart contract ABI
├── src/
│   ├── api/
│   │   └── index.ts            # GraphQL & SQL API endpoints
│   └── ScamReporter.ts         # Event handler indexing logic
├── generated/
│   └── schema.graphql          # Auto-generated GraphQL schema
├── ponder.config.ts            # Ponder configuration (chain & contract)
├── ponder.schema.ts            # Database schema definition
├── package.json
├── tsconfig.json
├── nixpacks.toml               # Railway deployment config
└── .node-version               # Node.js version (20)
```

---

## Pages

| Page                                 | Description                                                  |
| ------------------------------------ | ------------------------------------------------------------ |
| [Setup & Deployment](/indexer/setup) | Installation, configuration, scripts, and Railway deployment |
| [API Reference](/indexer/api)        | GraphQL and SQL endpoint usage examples                      |
