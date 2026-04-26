---
title: "Utilities & Types"
description: "API client, dApp detector, constants, and type definitions"
---

## 1. Utility Modules

### 1.1 API Client (`api.ts`)

**File:** [src/utils/api.ts](src/utils/api.ts) (~185 lines)

Base URL: `PLASMO_PUBLIC_DOMAN_API_BASE || "http://localhost:3000"`

All requests use:
- 8-second timeout via `AbortController`
- JSON content type
- Envelope format: `{ success: boolean, data: T, error?: { code, message } }`

**Available Functions:**

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `checkAddressApi` | GET | `/api/v1/address/{address}` | Check address risk & details |
| `scanInputApi` | GET | `/api/v1/scan/{input}` | Universal scan (address/ENS/domain) |
| `checkDomainApi` | GET | `/api/v1/check-domain?domain={d}` | Check domain safety |
| `getStatsApi` | GET | `/api/v1/stats` | Platform statistics |
| `getAddressTagsApi` | GET | `/api/v1/address/{address}` | Get tags for address |
| `submitAddressTagApi` | POST | `/api/v1/address-tags` | Submit new tag |
| `voteAddressTagApi` | POST | `/api/v1/address-tags/vote` | Vote on existing tag |
| `scanContractApi` | GET | `/api/v1/contracts/{addr}/scan` | Scan smart contract |

### 1.2 dApp Detector (`detect-dapp.ts`)

**File:** [src/utils/detect-dapp.ts](src/utils/detect-dapp.ts) (~112 lines)

Multi-layer heuristic to detect whether a page is a dApp:

| Layer | Method | Details |
|-------|--------|---------|
| 1 | Domain match | 27+ known dApp domains (Uniswap, Aave, OpenSea, etc.) |
| 2 | URL path keywords | `/swap`, `/bridge`, `/stake`, `/pool`, `/mint`, etc. |
| 3 | Script detection | Scan `<script src>` for web3 libraries (ethers, wagmi, viem, etc.) |
| 4 | DOM buttons | Search for "connect wallet", "launch app", "swap now", etc. |
| 5 | Address presence | Regex `0x[a-fA-F0-9]{40}` in body text (first 100KB) |
| 6 | Meta tags | Check meta content/name for web3, blockchain, defi, etc. |

Returns `true` if **any** layer matches.

### 1.3 Class Name Utility (`cn.ts`)

**File:** [src/utils/cn.ts](src/utils/cn.ts)

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Standard pattern for merging Tailwind classes with conditional support.

---

## 2. Constants & Types

**File:** [src/constants/index.ts](src/constants/index.ts)

### Chain Configuration

```typescript
BASE_CHAIN_ID = 8453           // Base mainnet
BASE_CHAIN_ID_HEX = "0x2105"
BASE_RPC_URL = "https://mainnet.base.org"
BASE_EXPLORER_URL = "https://basescan.org"
```

### Message Types

Prefix `DOMAN_` is used for all message types. See the table in Section 7.1 for full details.

### Safety Level

```typescript
type SafetyLevel = "safe" | "warning" | "danger" | "unknown"
```

### Wallet State

```typescript
interface WalletState {
  address: string | null
  chainId: number | null
  connected: boolean
}
```

### Domain Lists

- **`KNOWN_SCAM_DOMAINS`** — 30+ domains (fake Uniswap, MetaMask, Coinbase, Base, OpenSea, Aave, general crypto phishing)
- **`KNOWN_SAFE_DOMAINS`** — 25+ verified domains (Base, DEXs, lending, wallets, NFT, explorers, general)
