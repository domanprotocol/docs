---
title: "dApp Security"
description: "Hybrid safety check — local lists, DOMAN API, GoPlus, caching"
---

## 1. dApp Security System

### 1.1 Hybrid Safety Check

The system uses a 3-tier approach:

```mermaid
flowchart TD
    A["Incoming URL check"] --> B["Tier 1: Local lists (offline)<br/>KNOWN_SCAM_DOMAINS / KNOWN_SAFE_DOMAINS"]
    B --> C{Match found?}
    C -->|Scam| D["Return danger"]
    C -->|Safe| E["Return safe"]
    C -->|No match| F["Tier 2: DOMAN API<br/>GET /api/v1/check-domain?domain=..."]
    F --> G{DOMAN response}
    G -->|isScam = true| D
    G -->|riskScore < 40| E
    G -->|riskScore >= 60| H["Return warning"]
    G -->|No data / error| I["Tier 3: GoPlus API<br/>/api/v1/phishing_site?url=..."]
    I --> J{Phishing?}
    J -->|Yes| D
    J -->|No| H
```

### 1.2 Safety Level Semantics

| Level     | Color        | Meaning                                            | Badge  | Banner                  |
| --------- | ------------ | -------------------------------------------------- | ------ | ----------------------- |
| `safe`    | Green        | Domain verified, not phishing                      | `ON`   | Not displayed           |
| `warning` | Yellow/Amber | Not detected as phishing, but not in verified list | `WARN` | Displayed (dismissible) |
| `danger`  | Red          | Detected as phishing/scam site                     | `RISK` | Displayed (dismissible) |
| `unknown` | Gray         | Not a dApp or cannot be checked                    | —      | Not displayed           |

### 1.3 Caching

- Cache key: normalized hostname (without `www.`)
- TTL: 10 minutes
- Stored in memory (`Map`) in the service worker
- Can be cleared via `CLEAR_CACHE` message
