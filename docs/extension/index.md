---
title: "Extension Overview"
description: "DOMAN Browser Extension — Overview, architecture, and setup"
---

# DOMAN — End-to-End Documentation

> **Browser Extension: Community-Powered Security Layer for Base Chain**
> Version 0.0.1 | Last Updated: 26 April 2026

---

## 1. Introduction

### 1.1 What is DOMAN?

DOMAN (formerly DOMAN) is a browser extension that provides a **community-powered security layer** for the Base chain ecosystem. The extension protects users from:

- **Phishing sites** — automatic detection when users visit dangerous sites
- **Scam addresses** — community database that flags suspicious wallets
- **Risky contracts** — scanner that analyzes smart contracts before interaction

### 1.2 Problem Solved

User wallets on Base chain can be **auto-drained by bots** — malicious bots that auto-approve transactions. Whenever funds exceeding $1 enter, they are immediately transferred to the attacker's wallet. There is no security layer that warns users before dangerous transactions are executed.

### 1.3 Target Users

- Base chain users (DeFi users, traders, airdrop hunters)
- Web3 communities active on Base
- dApp developers on Base

---

## 2. System Architecture

```mermaid
graph TD
    subgraph BrowserExtension["BROWSER EXTENSION (MV3)"]
        Popup["Popup UI<br/>(popup.tsx)"]
        Options["Options UI<br/>(options.tsx)"]
        Background["Background<br/>Service Worker<br/>(background.ts)"]
        subgraph ContentScripts["CONTENT SCRIPTS (per tab)"]
            WalletBridge["wallet-bridge.ts<br/>(ISOLATED world, document_start)<br/>Listens wallet events (accountsChanged,<br/>chainChanged), forwards to background<br/>via CustomEvent + sendMessage"]
            DappChecker["dapp-checker.tsx<br/>(ISOLATED world, document_idle)<br/>Auto-checks URL against GoPlus API +<br/>local blacklist, shows warning banners"]
            IndexOverlay["index.tsx<br/>(ISOLATED world, document_idle)<br/>Shows DOMAN Active badge + address<br/>tagging overlay with hover detail cards"]
        end
    end

    subgraph ExternalServices["EXTERNAL SERVICES"]
        GoPlus["GoPlus Security API<br/>(phishing detection)"]
        DomanBackend["DOMAN Backend API<br/>(address check, tagging,<br/>contract scan, stats)"]
    end

    Popup -->|"chrome.runtime.sendMessage"| Background
    Background -->|"chrome.storage.onChanged"| Popup
    Options -->|"chrome.runtime.sendMessage"| Background
    Background -->|"chrome.tabs.sendMessage<br/>chrome.scripting.executeScript(MAIN)"| ContentScripts
    ContentScripts -->|"HTTP fetch"| ExternalServices
    Background -->|"HTTP fetch"| ExternalServices
```

### Execution Worlds

The extension uses two execution worlds in content scripts:

| World | Access | Used by |
|-------|--------|---------|
| `ISOLATED` | Chrome API, DOM, `chrome.runtime` | All content scripts |
| `MAIN` | `window.ethereum`, page JS context | Wallet connect/switch via `chrome.scripting.executeScript` |

**Important:** Plasmo v0.90.5 does not reliably register `.ts` MAIN world content scripts in the manifest. Therefore, MAIN world code is injected via `chrome.scripting.executeScript({ world: "MAIN" })` from the background script. This is the same pattern used by MetaMask.

---

## 3. Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Plasmo | 0.90.5 |
| UI Library | React | 18.2.0 |
| Language | TypeScript | 5.3.3 |
| Styling | Tailwind CSS | 3.4.19 |
| Chain | Base (Chain ID: 8453) | - |
| Ethereum SDK | ethers.js | 6.16.0 |
| Wallet Support | MetaMask, Coinbase Wallet | - |
| Security API | GoPlus Security | v1 |
| Backend API | REST (custom) | v1 |
| Build Tool | Plasmo (webpack-based) | - |
| CSS Utilities | clsx, tailwind-merge | 2.1.1, 3.5.0 |

---

## 4. Project Structure

```
doman-extension/
├── package.json                          # Dependencies, scripts, manifest config
├── tailwind.config.js                    # Tailwind theme, colors, animations
├── tsconfig.json                         # TypeScript configuration
├── postcss.config.js                     # PostCSS + Tailwind + Autoprefixer
├── README.md                             # Quick start guide
│
├── docs/
│   ├── PRD.md                            # Product Requirements Document
│   └── DOCUMENTATION.md                  # This file
│
├── walkthrough.md                        # Implementation walkthrough
│
├── src/
│   ├── constants/
│   │   └── index.ts                      # Message types, chain config, safety lists, types
│   │
│   ├── background/
│   │   └── index.ts                      # Background service entry point
│   ├── background.ts                     # Background service worker logic
│   │
│   ├── popup/
│   │   └── index.tsx                     # Popup entry point
│   ├── popup.tsx                         # Popup UI component (main UI)
│   │
│   ├── options.tsx                       # Options/Settings page (full tab)
│   │
│   ├── content/
│   │   └── index.tsx                     # Content script badge entry
│   │
│   ├── contents/
│   │   ├── index.tsx                     # Address overlay + badge content script
│   │   ├── wallet-bridge.ts             # Wallet event bridge content script
│   │   └── dapp-checker.tsx             # Auto safety checker content script
│   │
│   ├── utils/
│   │   ├── api.ts                        # Backend API client
│   │   ├── detect-dapp.ts               # dApp detection heuristics
│   │   └── cn.ts                         # clsx + tailwind-merge utility
│   │
│   ├── types/
│   │   ├── ethereum.d.ts                # Window.ethereum type definitions
│   │   └── style.d.ts                   # CSS module type declarations
│   │
│   ├── styles/
│   │   └── globals.css                  # CSS custom properties
│   │
│   ├── style.css                         # Main styles (Tailwind + custom utilities)
│   │
│   └── assets/
│       ├── icon.png                      # Extension icon
│       ├── logo1.png                     # Brand logo variant
│       └── logo2.png                     # Brand logo variant
│
└── build/                                # Build output (generated)
    └── chrome-mv3-prod/                  # Production build
```

---

## 5. Installation & Build

### 5.1 Prerequisites

- Node.js >= 18
- npm >= 9
- Chrome / Chromium browser

### 5.2 Install Dependencies

```bash
npm install
```

### 5.3 Development Mode

```bash
npm run dev
```

Starts the Plasmo dev server with hot-reload. The extension can be loaded from `build/chrome-mv3-dev/`.

### 5.4 Production Build

```bash
npm run build
```

Output to `build/chrome-mv3-prod/`.

### 5.5 Package for Distribution

```bash
npm run package
```

Creates a `.zip` ready for upload to the Chrome Web Store.

### 5.6 Load Extension in Chrome

1. Run `npm run build`
2. Open Chrome -> `chrome://extensions`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `build/chrome-mv3-prod/` folder
6. The extension icon appears in the toolbar

### 5.7 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PLASMO_PUBLIC_DOMAN_API_BASE` | `http://localhost:3000` | Base URL for DOMAN backend API |
| `PLASMO_PUBLIC_DASHBOARD_URL` | `http://localhost:3000` | Dashboard URL for deep analytics |

---

## 6. Manifest & Permissions

The extension uses **Manifest V3** generated by Plasmo.

### Permissions

| Permission | Reason |
|-----------|--------|
| `storage` | Persist wallet state, user settings, cache |
| `activeTab` | Access active tab for wallet operations |
| `tabs` | Query tab info for page status check |
| `scripting` | Inject MAIN world script for wallet connect |

### Host Permissions

| Pattern | Reason |
|---------|--------|
| `<all_urls>` | Content scripts run on all pages |
| `http://localhost/*` | Backend API local development |
| `https://api.gopluslabs.io/*` | GoPlus phishing detection API |

### Content Scripts Registration (by Plasmo)

| Script | `run_at` | World | Matches |
|--------|----------|-------|---------|
| `wallet-bridge.ts` | `document_start` | ISOLATED | `<all_urls>` |
| `dapp-checker.tsx` | `document_idle` | ISOLATED | `<all_urls>` |
| `index.tsx` (contents/) | `document_idle` | ISOLATED | `<all_urls>` |
