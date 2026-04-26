---
title: "dApp Security"
description: "Hybrid safety check — GoPlus API, local blacklist, caching"
---

## 1. dApp Security System

### 1.1 Hybrid Safety Check

The system uses a 3-tier approach:

```mermaid
flowchart TD
    A["Incoming URL check"] --> B["Tier 1: GoPlus Security API (online)<br/>GET /api/v1/phishing_site?url={url}<br/>Primary check — real-time phishing data"]
    B --> C{API success?}
    C -->|Yes| D["Return result"]
    C -->|API error| E["Tier 2: Local Blacklist (offline fallback)<br/>KNOWN_SCAM_DOMAINS — 30+ known scam sites<br/>KNOWN_SAFE_DOMAINS — 25+ verified dApps"]
    E --> F{Match found?}
    F -->|Yes in scam list| G["Return danger"]
    F -->|Yes in safe list| H["Return safe"]
    F -->|No match| I["Tier 3: Unknown (warning level)<br/>If no match in either list -> warning"]
```

### 1.2 Safety Level Semantics

| Level | Color | Meaning | Badge | Banner |
|-------|-------|---------|-------|--------|
| `safe` | Green | Domain verified, not phishing | `ON` | Not displayed |
| `warning` | Yellow/Amber | Not detected as phishing, but not in verified list | `WARN` | Displayed (dismissible) |
| `danger` | Red | Detected as phishing/scam site | `RISK` | Displayed (dismissible) |
| `unknown` | Gray | Not a dApp or cannot be checked | — | Not displayed |

### 1.3 Caching

- Cache key: normalized hostname (without `www.`)
- TTL: 10 minutes
- Stored in memory (`Map`) in the service worker
- Can be cleared via `CLEAR_CACHE` message
