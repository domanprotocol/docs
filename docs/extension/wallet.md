---
title: "Wallet System"
description: "Wallet connection, network switch, state persistence"
---

## 1. Wallet System

### 1.1 Supported Wallets

- **MetaMask** — Primary, fully supported
- **Coinbase Wallet** — Supported via `window.ethereum` provider

### 1.2 Network: Base

```json
{
  "chainId": "0x2105",
  "chainName": "Base",
  "nativeCurrency": { "name": "Ethereum", "symbol": "ETH", "decimals": 18 },
  "rpcUrls": ["https://mainnet.base.org"],
  "blockExplorerUrls": ["https://basescan.org"]
}
```

### 1.3 Auto Network Switch

If the wallet is connected but not on the Base chain:
- Popup displays a "Wrong Network" badge (orange)
- "Switch to Base Network" button appears
- Click -> `wallet_switchEthereumChain({ chainId: "0x2105" })`
- If chain not yet added -> `wallet_addEthereumChain` + Base params

### 1.4 State Persistence

Wallet state is stored in `chrome.storage.local`:
```json
{
  "walletState": {
    "address": "0x1234...abcd",
    "chainId": 8453,
    "connected": true
  }
}
```

This ensures:
- Wallet remains connected when popup is closed/reopened
- Multiple popup instances see the same state
- Service worker restart does not lose state
