---
title: "Scam Detection & Sync"
description: "Pattern detection engine, risk scoring, external data sync"
---

## 1. Scam Detection Engine

### 1.1 Three-Layer Analysis Overview

DOMAN detects scam patterns through three layers of analysis:

```mermaid
flowchart TB
    subgraph "Layer 1: Opcode Analysis"
        O1["SELFDESTRUCT (0xff)<br/>+40 risk"]
        O2["DELEGATECALL (0xf4)<br/>+15 risk"]
        O3["CALLCODE (0xf2)<br/>+5 risk"]
    end

    subgraph "Layer 2: Function Selectors"
        S1["Unlimited Approve<br/>+25 risk"]
        S2["Unsafe TransferFrom<br/>+30 risk"]
        S3["Unlimited Minting<br/>+20 risk"]
        S4["Ownership Transfer<br/>+10 risk"]
    end

    subgraph "Layer 3: Bytecode Patterns"
        B1["ERC1967 Proxy<br/>+15 risk"]
        B2["Honeypot Signature<br/>+50 risk"]
        B3["Beacon Proxy<br/>+15 risk"]
    end

    O1 & O2 & O3 & S1 & S2 & S3 & S4 & B1 & B2 & B3 --> R["Total Risk Score<br/>= Sum(riskAdd per pattern)<br/>Max: 100"]
```

**Implementation notes**

1. **Opcode parsing is hardened** — detection skips PUSH data to reduce false positives from embedded constants.
2. **Weighted scoring** — risk score uses `riskAdd` from `config/scam-patterns`.
3. **Governance/voting contracts** — ScamReporter selectors are classified as `GOVERNANCE`.
4. **Similar scams** — only returned when `bytecodeHash` matches existing scans.

### 1.2 Pattern System (`config/scam-patterns.ts`)

Four pattern categories:

#### Opcode Patterns

| Pattern                     | Severity | Risk Add |
| --------------------------- | -------- | -------- |
| Self-Destruct (`0xff`)      | CRITICAL | +40      |
| Delegate Call (`0xf4`)      | MEDIUM   | +15      |
| Obsolete CALLCODE (`0xf2`)  | LOW      | +5       |
| External Code Hash (`0x3f`) | LOW      | +5       |

#### Function Selector Patterns

| Pattern              | Selector     | Severity | Risk Add |
| -------------------- | ------------ | -------- | -------- |
| Unlimited Approve    | `0x095ea7b3` | HIGH     | +25      |
| Unsafe Transfer From | `0x23b872dd` | HIGH     | +30      |
| Ownership Transfer   | `0xf2fde38b` | LOW      | +10      |
| Renounce Ownership   | `0x715018a6` | LOW      | +5       |
| Contract Pause       | `0x8456cb59` | MEDIUM   | +10      |
| Unlimited Minting    | `0x40c10f19` | HIGH     | +20      |
| Burn From            | `0x79cc6790` | MEDIUM   | +15      |
| Multicall            | `0xac9650d8` | LOW      | +5       |

#### Bytecode Patterns

| Pattern                     | Severity | Risk Add |
| --------------------------- | -------- | -------- |
| Upgradeable Proxy (ERC1967) | MEDIUM   | +15      |
| Beacon Proxy                | MEDIUM   | +15      |
| Minimal Proxy (EIP-1167)    | LOW      | +10      |
| Honeypot Signature          | CRITICAL | +50      |

#### External Checks

| Pattern           | Severity | Risk Add |
| ----------------- | -------- | -------- |
| Unverified Source | LOW      | +10      |
| Recently Deployed | LOW      | +5       |

### 1.3 Risk Score Calculation

```
totalRiskScore = Σ(matchedPattern.riskAdd)
finalScore = Math.min(totalRiskScore, 100)
```

### 1.4 Risk Level Thresholds

| Level    | Score Range |
| -------- | ----------- |
| LOW      | 0 — 40      |
| MEDIUM   | 41 — 60     |
| HIGH     | 61 — 80     |
| CRITICAL | 81 — 100    |

### 1.5 Similarity Detection

Similar scams are returned only when `bytecodeHash` matches existing scans.

---

## 2. External Data Sync

### 2.1 Data Sources

| Source            | Type       | Data                                       | Frequency |
| ----------------- | ---------- | ------------------------------------------ | --------- |
| **DeFiLlama**     | REST API   | DeFi protocols, TVL, contract addresses    | On-demand |
| **ScamSniffer**   | GitHub Raw | Scam addresses, phishing domains, drainers | On-demand |
| **CryptoScamDB**  | REST API   | Scam entries, categories, descriptions     | On-demand |
| **Base Registry** | Web Scrape | Official dApps, bridges, ecosystem         | Manual    |

### 2.2 External API Config (`config/endpoints.ts`)

```typescript
defiLlamaConfig.baseUrl     → 'https://api.llama.fi'
scamSnifferConfig.rawUrl    → 'https://raw.githubusercontent.com/scamsniffer/...'
cryptoScamDbConfig.baseUrl  → 'https://cryptoscamdb.org/api'
baseRegistryConfig.baseUrl  → 'https://base.org'
baseScanConfig.baseUrl      → 'https://sepolia.basescan.org'
```

### 2.3 Sync Flow

```mermaid
flowchart TD
    A["POST /api/v1/sync { source: 'scamsniffer' }"] --> B["SyncService.syncScamSniffer()"]
    B --> C["Fetch scam addresses + domains from GitHub"]
    C --> D["Process addresses (limit 100/sync)"]
    D --> D1["Normalize to lowercase"]
    D1 --> D2["Upsert Address (description: 'Flagged by ScamSniffer')"]
    D2 --> D3["Upsert ExternalSource (source: scamsniffer, rawData)"]
    D3 --> E["Process domains (limit 100/sync)"]
    E --> E1["Normalize (trim, lowercase)"]
    E1 --> E2["Upsert ScamDomain (category: PHISHING, source: scamsniffer)"]
    E2 --> F["Create SyncLog entry"]
    F --> G["Return SyncResponse"]
```

### 2.4 Sync Log

Every sync operation is recorded in the `SyncLog` table:

- source, status (success/failed)
- recordsAdded, recordsUpdated
- startedAt, completedAt
- error (if failed)
