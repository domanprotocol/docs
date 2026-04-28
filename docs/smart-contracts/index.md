---
title: "Smart Contracts"
description: "On-chain scam reporting and community voting contracts for Base chain"
---

# DOMAN Smart Contracts

On-chain scam reporting and community voting contracts for the **DOMAN** platform — a community-powered security engine for Base chain.

> DOMAN protects users from phishing sites, scam addresses, and risky smart contracts through community-driven reporting and automated detection.

---

## Contracts

| Contract                                       | Description                                                                 |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| [ScamReporter](/smart-contracts/scam-reporter) | Decentralized scam-report vote submission with anti-double-vote enforcement |

---

## On-chain / Off-chain Architecture

All report data lives off-chain (Supabase). The smart contract acts as an **integrity anchor** — it proves that a given `(reporter, reasonHash, isScam)` triple was witnessed by the chain at a specific block.

```mermaid
graph TD
    subgraph Client["Client Layer"]
        Dashboard["DOMAN Dashboard"]
        Extension["Browser Extension"]
    end

    subgraph Chain["On-chain (Base Sepolia)"]
        Contract["ScamReporter.sol"]
    end

    subgraph Offchain["Off-chain"]
        Supabase["Supabase<br/>(PostgreSQL)"]
        Indexer["Ponder Indexer"]
    end

    Dashboard -->|"submitVote()"| Contract
    Extension -->|"submitVote()"| Contract
    Dashboard -->|"Store full payload"| Supabase
    Contract -->|"ScamVoteSubmitted event"| Indexer
    Indexer -->|"Sync on-chain data"| Supabase
    Supabase -.->|"Verify keccak256<br/>matches reasonHash"| Contract
```

### Report Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant Frontend as DOMAN Frontend
    participant Contract as ScamReporter.sol
    participant Indexer as Ponder Indexer
    participant DB as Supabase

    User->>Frontend: Submit scam report
    Frontend->>Contract: submitVote(targetType, targetId, reasonHash, isScam)
    Contract->>Contract: Validate (no double vote, valid target)
    Contract-->>Frontend: Emit ScamVoteSubmitted
    Frontend->>DB: Store full reason payload
    Indexer->>Contract: Detect ScamVoteSubmitted event
    Indexer->>DB: Insert indexed vote + update user stats
    Note over DB: On-chain hash matches off-chain payload ✓
```

1. **User** submits a report via DOMAN Dashboard or Extension.
2. **Frontend** calls `submitVote()` on-chain and stores the full payload in Supabase.
3. **Indexer** (Ponder) listens for `ScamVoteSubmitted` events and syncs on-chain data with the database.
4. **Verification** — anyone can recompute `keccak256(offchainPayload)` and verify it matches `reasonHash` in the event log.

---

## Deployed Contracts

| Network      | Chain ID | Contract Address                                                                                                                | Status   |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Base Sepolia | 84532    | [`0x574F67B22B49eFd39D03F51627fA79CEB4a2449C`](https://sepolia.basescan.org/address/0x574F67B22B49eFd39D03F51627fA79CEB4a2449C) | Current  |
| Base Sepolia | 84532    | [`0x65534f1a1bbca98ad756c7ce38d7097fba7c237a`](https://sepolia.basescan.org/address/0x65534f1a1bbca98ad756c7ce38d7097fba7c237a) | Previous |

---

## Project Structure

```
doman-contracts/
├── src/
│   └── ScamReporter.sol       # Main contract
├── test/
│   └── ScamReporter.t.sol     # Unit & fuzz tests
├── script/
│   └── ScamReporter.s.sol     # Deploy script
├── broadcast/                  # Deployment artifacts
├── lib/                        # Foundry dependencies
└── foundry.toml               # Foundry configuration
```

---

## Pages

| Page                                                    | Description                                    |
| ------------------------------------------------------- | ---------------------------------------------- |
| [ScamReporter Contract](/smart-contracts/scam-reporter) | Functions, events, errors, and hash generation |
| [Development](/smart-contracts/development)             | Setup, build, test, deploy with Foundry        |
