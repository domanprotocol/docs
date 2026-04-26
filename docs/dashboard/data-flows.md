---
title: "Data Flows & Testing"
description: "End-to-end data flows, testing checklist, extension integration, roadmap"
---

## 1. End-to-End Data Flows

### 1.1 Address Scan

```mermaid
flowchart TD
    A["User input '0x1234...' on Checker page"] --> B["Client: detectInputType('0x1234...') → 'address'"]
    B --> C["fetch('/api/v1/scan/0x1234...')"]
    C --> D["Route handler: GET /api/v1/scan/[address]"]
    D --> E["withErrorHandling wrapper"]
    E --> F["ScannerService.scanContract(address)"]
    F --> G["Viem: publicClient.getCode(address)"]
    G --> H{Bytecode exists?}
    H -->|Yes| I["Analyze bytecode"]
    I --> I1["Extract opcodes (SELFDESTRUCT, DELEGATECALL, etc)"]
    I1 --> I2["Extract function selectors"]
    I2 --> I3["Match against scamPatterns"]
    I3 --> I4["calculateRiskScore(matchedPatterns)"]
    I4 --> I5["getBytecodeHash() for similarity"]
    I5 --> I6["Query similar contracts from DB"]
    I6 --> I7["Query reports from DB"]
    I7 --> J["Prisma: upsert ContractScan record"]
    H -->|No| J
    J --> K["Return ScanResult { riskScore, riskLevel, patterns, similarScams, ... }"]
    K --> L["Client: render results"]
    L --> L1["TrustScoreBadge (visual gauge)"]
    L1 --> L2["Patterns list (with severity colors)"]
    L2 --> L3["Similar scams table"]
    L3 --> L4["Community reports section"]
```

### 1.2 ENS Resolution + Scan

```mermaid
flowchart TD
    A["User input 'vitalik.eth' on Checker page"] --> B["Client: detectInputType('vitalik.eth') → 'ens'"]
    B --> C["fetch('/api/v1/scan/vitalik.eth')"]
    C --> D["ScannerService.scanContract('vitalik.eth')"]
    D --> E["detectInputType → 'ens'"]
    E --> F["Viem: mainnetClient.getEnsAddress({ name: 'vitalik.eth' })"]
    F --> G["Resolved: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'"]
    G --> H["EnsService: save to EnsRecord table"]
    H --> I["Continue scan of resolved address (same as 1.1)"]
```

### 1.3 Domain Check

```mermaid
flowchart TD
    A["User input 'app.uniswap.org' on Checker page"] --> B["Client: detectInputType('app.uniswap.org') → 'domain'"]
    B --> C["fetch('/api/v1/scan/app.uniswap.org')"]
    C --> D["ScannerService → scanDomain('app.uniswap.org')"]
    D --> E["DomainService.checkDomain('app.uniswap.org')"]
    E --> F["Prisma: query ScamDomain table"]
    F --> G{Found in ScamDomain?}
    G -->|Yes| H["Return scam info"]
    G -->|No| I["Check Address table (url field)"]
    I --> J["Return DomainCheckResult"]
    H --> J
```

### 1.4 Report Submission (Off-chain + On-chain)

```mermaid
flowchart TD
    A["User fills Report Scam Modal"] --> A1["Step 1: Input address, select reasons, add evidence URL"]
    A1 --> A2["Step 2: Preview report details"]
    A2 --> A3["Step 3: Confirm submission"]
    A3 --> B["useReportScam.submit()"]
    B --> C["Off-chain: POST /api/v1/reports"]
    C --> D["ReportService.createReport(data)"]
    D --> D1["Prisma: upsert Address (if not exists)"]
    D1 --> D2["hashReasonData(reason) → keccak256 hash"]
    D2 --> D3["Prisma: create Report record"]
    D3 --> D4["LeaderboardService.awardReputation(reporter, +1)"]
    D4 --> E["Return CreateReportResponse"]
    E --> F{Contract deployed?}
    F -->|Yes| G["wagmi useWriteContract: submitReport(targetType, targetId, reasonHash)"]
    G --> H["MetaMask confirmation"]
    H --> I["Wait for tx receipt"]
    I --> J["Save contract address to localStorage cache"]
    F -->|No| K["Skip on-chain step"]
    J --> L["Client: show success toast"]
    K --> L
```

### 1.5 Voting on Report

```mermaid
flowchart TD
    A["User clicks 'Support' or 'Flag as Incorrect' on report"] --> B["fetch('/api/v1/reports/{id}/vote', POST)"]
    B --> C["ReportService.voteOnReport(reportId, voteData)"]
    C --> D["Check reputation threshold (min 10 points)"]
    D --> E["Check not already voted"]
    E --> F["Prisma: create Vote record"]
    F --> G["Update report vote counts"]
    G --> H["Check if threshold reached → auto-resolve"]
    H --> I["Award reputation to voter"]
    I --> J["Return VoteResponse"]
```

### 1.6 External Data Sync

```mermaid
flowchart TD
    A["Admin / Cron trigger: POST /api/v1/sync { source: 'scamsniffer' }"] --> B["SyncService.syncScamSniffer()"]
    B --> C["fetch GitHub blacklist (address.json)"]
    C --> D["Parse: { address: string[], domain: string[] }"]
    D --> E["Process each address (limit 100/sync)"]
    E --> E1["Normalize to lowercase"]
    E1 --> E2["Prisma: Address.upsert({ status: SCAM, riskScore: 80 })"]
    E2 --> E3["Prisma: ExternalSource.upsert({ source: 'scamsniffer', rawData })"]
    E3 --> F["Process each domain (limit 100/sync)"]
    F --> F1["Prisma: ScamDomain.upsert({ category: PHISHING, source: scamsniffer })"]
    F1 --> G["Prisma: SyncLog.create({ source, recordsAdded, recordsUpdated })"]
    G --> H["Return SyncResponse"]
```

### 1.7 Wallet Connection

```mermaid
flowchart TD
    A["User clicks 'Connect Wallet' in dashboard header"] --> B["Wagmi: useConnect().connect()"]
    B --> C["MetaMask popup appears"]
    C --> D["User approves connection"]
    D --> E["useAccount() update: { address, isConnected, chainId }"]
    E --> F["UI update: show address + disconnect button"]
    F --> G{Wrong chain?}
    G -->|Yes| H["Prompt switch to Base"]
    G -->|No| I["Connected"]
```

---

## 2. Testing & Debug

### 2.1 Manual Testing Checklist

#### Landing Page
- [ ] Hero section loads with gradient text
- [ ] CTA buttons navigate to /dashboard
- [ ] Use case cards visible
- [ ] Footer links work

#### Dashboard
- [ ] Stats cards load data from database
- [ ] Recent activity table populated
- [ ] Sidebar navigation works (all links)
- [ ] Search bar functional

#### Checker
- [ ] Input valid 0x address → scan results displayed
- [ ] Input ENS name → resolved + scanned
- [ ] Input domain → domain check result
- [ ] Invalid input → error message
- [ ] Detected patterns shown with severity
- [ ] Similar scams displayed
- [ ] Report submission works (off-chain + on-chain)
- [ ] Voting on reports works (FOR/AGAINST)
- [ ] Vote status check (already voted indicator)
- [ ] URL query parameter pre-fill (?address=0x...)

#### Deploy
- [ ] Connect wallet → shows address + network
- [ ] Auto-switch to Base Sepolia
- [ ] Deploy button → MetaMask confirmation
- [ ] Success state → tx hash + BaseScan link
- [ ] Contract address cached in localStorage

#### Watchlist
- [ ] Add address to watchlist via API
- [ ] Remove address from watchlist (DELETE)
- [ ] Score tracking updates
- [ ] Trend indicators accurate
- [ ] Last checked timestamp shown

#### Tags
- [ ] Search by address or tag name
- [ ] Add tag to address inline
- [ ] Tag badges show correct status colors
- [ ] Tag attribution (taggedBy) displayed

#### Settings
- [ ] Profile info displayed correctly
- [ ] Settings persist after page reload

#### API Endpoints
- [ ] `GET /api/health` returns healthy
- [ ] `GET /api/v1/scan/{address}` returns valid ScanResult
- [ ] `GET /api/v1/address/{address}` returns valid AddressDTO
- [ ] `GET /api/v1/address/{address}/tags` returns tags
- [ ] `DELETE /api/v1/address/{address}/tags?tag=X` removes tag
- [ ] `GET /api/v1/address/{address}/ens` returns ENS records
- [ ] `GET /api/v1/address-tags` returns paginated tags
- [ ] `POST /api/v1/address-tags` creates tag + awards reputation
- [ ] `GET /api/v1/check-domain?domain=X` checks domain
- [ ] `GET /api/v1/history` returns scan history
- [ ] `GET /api/v1/resolve/{ens}` resolves ENS name
- [ ] `GET /api/v1/scam-domains` lists scam domains
- [ ] `POST /api/v1/tags` creates tag (simplified)
- [ ] `POST /api/v1/reports` creates report
- [ ] `GET /api/v1/reports/vote-status` checks vote status
- [ ] `POST /api/v1/reports/{id}/vote` casts vote
- [ ] `GET /api/v1/watchlist` lists watchlist
- [ ] `POST /api/v1/watchlist` adds to watchlist
- [ ] `DELETE /api/v1/watchlist/{address}` removes from watchlist
- [ ] `GET /api/v1/dapps` returns paginated list
- [ ] `POST /api/v1/sync` runs sync
- [ ] `GET /api/v1/stats` returns platform stats

### 2.2 Development Tools

**Prisma Studio:**
```bash
npm run db:studio
```
Visual database browser at `http://localhost:5555`.

**Next.js DevTools:**
- Terminal shows route compilation times
- Browser console shows React errors
- Network tab shows API calls

**Database Debugging:**
```bash
# Direct SQL query
npx prisma db execute --stdin <<EOF
SELECT address, status, "riskScore" FROM addresses WHERE status = 'SCAM' LIMIT 10;
EOF
```

### 2.3 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `DATABASE_URL` not defined | Missing env variable | Set in `.env.local` |
| `Prisma Client not generated` | Missing prisma generate | Run `npm run db:generate` |
| `NEXT_PUBLIC_BASE_RPC_URL` error | Missing RPC URL | Set in `.env.local` |
| Wallet not connecting | MetaMask not installed | Install MetaMask extension |
| ENS resolution fails | Mainnet RPC unreachable | Check network / use different RPC |
| Scan timeout | Large contract bytecode | Increase `SCAN_TIMEOUT` in constants |
| Sync fails | External API down | Check API health, retry later |
| `P2002` Prisma error | Unique constraint violation | Record already exists |
| `P2025` Prisma error | Record not found | Check if data exists |

---

## 3. Extension Integration

The frontend API serves a browser extension running in Chrome. The extension consumes the same API:

### 3.1 API Consumption

| Extension Feature | API Endpoint | Method |
|-------------------|-------------|--------|
| Universal scan | `/api/v1/scan/{input}` | GET |
| Address check | `/api/v1/address/{address}` | GET |
| Domain check | `/api/v1/check-domain` | GET |
| Address tags | `/api/v1/address/{address}/tags` | GET/POST |
| Contract scan | `/api/v1/contracts/{address}/scan` | GET |
| Platform stats | `/api/v1/stats` | GET |
| Vote on tag | `/api/v1/address-tags/vote` | POST |

### 3.2 Shared Types

The extension and frontend use compatible type definitions:
- `ScanInputType`: `'address' | 'ens' | 'domain'`
- `SafetyLevel`: `'safe' | 'warning' | 'danger' | 'unknown'`
- `RiskLevel`: `'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`
- API envelope: `{ success: boolean, data: T, error?: { code, message } }`

### 3.3 CORS

API routes need to be configured to accept requests from the extension (`chrome-extension://` origin).

---

## 4. Roadmap

### Current Status (v1.0.0)

| Feature | Status |
|---------|--------|
| Next.js App Router setup | Done |
| Dashboard UI (overview, checker, history, watchlist, tags, settings, deploy) | Done |
| API Routes (22+ endpoints: scan, address, reports, watchlist, tags, etc) | Done |
| Service layer (scanner, report, sync, address, domain, ENS, stats, leaderboard) | Done |
| Prisma schema (12 models) with migrations | Done |
| Blockchain integration (Viem + Wagmi) | Done |
| ScamReporter smart contract (ABI + deploy page) | Done |
| Scam pattern detection engine (opcodes + selectors + bytecode) | Done |
| External data sync (DeFiLlama, ScamSniffer, CryptoScamDB) | Done |
| ENS resolution with caching | Done |
| Domain checking + scam domain database | Done |
| Community reporting + on-chain verification | Done |
| Community voting with wallet validation | Done |
| Vote status checking (anti-double-vote) | Done |
| Reputation / leaderboard system | Done |
| Watchlist API + UI (add/remove/score tracking) | Done |
| Tag management with search + inline add | Done |
| Report Scam modal (multi-step wizard) | Done |
| Landing page | Done |
| Tailwind v4 design system | Done |

### Next Phase

| Feature | Priority | Est. |
|---------|----------|------|
| Authentication (wallet-based login) | HIGH | 2 days |
| Deploy ScamReporter to Base Sepolia (testnet) | HIGH | 1 day |
| Real-time updates (WebSocket/SSE) | HIGH | 3 days |
| Rate limiting middleware | HIGH | 1 day |
| Comprehensive test suite | MEDIUM | 3 days |
| Deployment pipeline (Vercel) | MEDIUM | 1 day |
| Advanced charting (risk trends) | LOW | 2 days |
| Email/notification alerts | LOW | 2 days |
| Multi-chain support | LOW | 5 days |
| API documentation (OpenAPI/Swagger) | LOW | 1 day |

### Out of Scope

- Token price tracking
- Portfolio management
- Mobile app
- AI-based scam detection (ML model)
- Fiat on-ramp

---

*This documentation is a living document. Updates follow project development.*
