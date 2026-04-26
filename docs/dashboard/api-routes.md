---
title: "API Routes"
description: "REST API endpoints — 22+ routes for scan, address, reports, etc"
---

## 1. API Routes

### 1.1 Response Format

All API responses use an envelope format:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 },
    "cached": false
  }
}
```

Error response:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "Invalid Ethereum address format",
    "details": { ... }
  }
}
```

### 1.2 Endpoints

#### Scan

```
GET /api/v1/scan/{input}

Input: 0x address, ENS name (.eth), or domain
Response: ScanResult

Flow:
  → detectInputType(input)
  → address: getBytecode → analyze patterns → calculate risk
  → ens: resolveEns → then scan resolved address
  → domain: checkDomain → DB lookup

Returns:
  - riskScore (0-100)
  - riskLevel (LOW/MEDIUM/HIGH/CRITICAL)
  - isVerified
  - patterns[] (detected scam patterns)
  - similarScams[] (by bytecode hash)
  - reportCount
  - scanDuration
```

#### Address Details

```
GET /api/v1/address/{address}

Response: AddressDTO
  - address, name, chain, status, riskScore
  - category, source, description
  - url, logoUrl, tvl
  - verifiedBy, verifiedAt
  - tags[] (address tags)
  - reportCount
  - lastScanned
```

#### Address Tags (nested)

```
GET /api/v1/address/{address}/tags
Response: { data: AddressTagDTO[], address, count }

DELETE /api/v1/address/{address}/tags?tag=scam
Response: { message, address, tag }
```

#### Address ENS (nested)

```
GET /api/v1/address/{address}/ens
Response: { address, primaryName, records[], count }
```

#### Address Tags (top-level, with reputation)

```
GET /api/v1/address-tags
Query: ?address=0x...&tag=scam&taggedBy=0x...&page=1&limit=20
Response: Paginated tags with address info

POST /api/v1/address-tags
Body: { address, tag, taggedBy? }
Logic:
  - Creates address record if not exists
  - Upserts tag (unique on address + tag)
  - Awards +5 reputation to tagger
  - Creates/updates UserProfile for tagger
Response: Tag record + user profile
```

#### Tags (simplified)

```
POST /api/v1/tags
Body: { address, tag, taggedBy? }
Logic: Simple tag creation with upsert (no reputation system)
Response: Created tag record
```

#### Check Domain

```
GET /api/v1/check-domain?domain=example.com
Response: { domain, isScam, riskScore, category, description, source, checkedAt }
Logic: Cleans domain (removes protocol, www, paths), checks ScamDomain table
```

#### History

```
GET /api/v1/history?checker=0x...&limit=50
Response: ContractScan[] with address details
Logic: Returns most recent scans, optionally filtered by checker address
```

#### ENS Resolution

```
GET /api/v1/resolve/{ens}
Response: { ens, address, resolvedAt }
Logic: Validates ENS name via Zod, resolves via EnsService
```

#### Scam Domains

```
GET /api/v1/scam-domains?page=1&limit=20&search=uniswap&status=ACTIVE
Response: Paginated list of scam domains
```

#### Reports

```
GET /api/v1/reports
Query: ?status=PENDING&category=PHISHING&page=1&limit=20
Response: ReportsResponse { data: ReportDTO[], pagination }

POST /api/v1/reports
Body: CreateReportRequest {
  address: string,
  reason: string,
  evidenceUrl?: string,
  category: AddressCategory,
  reporterAddress: string,
  reasonHash?: string,
  reasonData?: { selectedReasons: string[], customText: string }
}
Response: CreateReportResponse { id, status, txHash?, message }
```

#### Vote Status

```
GET /api/v1/reports/vote-status?address=0x...&voterAddress=0x...
Response: { hasVoted, voteType, reportId }
Logic: Checks if voter has already voted on any report for the address
```

#### Vote on Report

```
POST /api/v1/reports/{id}/vote
Body: { vote: "FOR"|"AGAINST", voterAddress, txHash? }
Response: VoteResponse { reportId, votesFor, votesAgainst, status }
```

#### Watchlist

```
GET /api/v1/watchlist?userAddress=0x...
Response: Watchlist entries with current/previous risk scores, last checked

POST /api/v1/watchlist
Body: { userAddress, watchedAddress }
Logic: Creates watched address if needed, creates UserProfile for FK constraint

DELETE /api/v1/watchlist/{address}?userAddress=0x...
Response: { deleted: boolean }
```

#### dApps Directory

```
GET /api/v1/dapps
Query: ?status=LEGIT&category=DEFI&search=uni&page=1&limit=20&sort=tvl&order=desc
Response: DappsResponse { data: AddressDTO[], pagination }
```

#### Sync

```
POST /api/v1/sync
Body: { source: "defillama"|"scamsniffer"|"cryptoscamdb"|"base"|"all" }
Response: SyncResponse { success, source, recordsAdded, recordsUpdated, syncLogId, duration }
```

#### Stats

```
GET /api/v1/stats
Response: PlatformStats {
  totalAddresses, legitCount, scamCount, suspiciousCount, unknownCount,
  totalReports, verifiedReports, pendingReports,
  topCategories[], recentScams[], scansToday, updatedAt
}
```

#### Health Check

```
GET /api/health
Response: { status: "healthy"|"degraded"|"unhealthy", database, blockchain, externalApis }
```

### 1.3 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INTERNAL_ERROR` | 500 | Server error |
| `INVALID_REQUEST` | 400 | Validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Auth required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `RATE_LIMITED` | 429 | Too many requests |
| `INVALID_ADDRESS` | 400 | Bad address format |
| `ADDRESS_NOT_FOUND` | 404 | Address not in database |
| `REPORT_NOT_FOUND` | 404 | Report ID not found |
| `REPORT_ALREADY_VOTED` | 400 | User already voted |
| `INSUFFICIENT_REPUTATION` | 403 | Need more reputation |
| `SCAN_TIMEOUT` | 408 | Scan took too long |
| `SCAN_FAILED` | 500 | Scanner error |
| `SYNC_FAILED` | 500 | Sync error |
| `SYNC_IN_PROGRESS` | 409 | Sync already running |
