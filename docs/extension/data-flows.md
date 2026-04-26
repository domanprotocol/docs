---
title: "Data Flows & Messaging"
description: "Data flows and messaging between extension components"
---

## 1. Data Flows & Messaging

### 1.1 Wallet Connection

```mermaid
flowchart TD
    A["User clicks Connect Wallet"] --> B["popup.tsx: connectWallet()"]
    B --> C["chrome.runtime.sendMessage<br/>{ type: CONNECT_WALLET }"]
    C --> D["background.ts: handleConnectWallet()"]
    D --> E["getActiveTabId()"]
    E --> F["executeInMainWorld(tabId,<br/>() => !!window.ethereum)<br/>Check provider"]
    F --> G["executeInMainWorld(tabId,<br/>() => eth_requestAccounts)<br/>Request accounts"]
    G --> H["executeInMainWorld(tabId,<br/>() => window.ethereum.chainId)<br/>Get chain"]
    H --> I["updateWalletState(<br/>{ address, chainId, connected: true })"]
    I --> J["chrome.storage.local.set({ walletState })"]
    J --> K["Return WalletState"]
    K --> L["setWallet(response)"]
    L --> M["UI update"]
```

### 1.2 dApp Safety Check (Auto)

```mermaid
flowchart TD
    A["User visits webpage"] --> B["dapp-checker.tsx: detectDApp() === true"]
    B --> C["chrome.runtime.sendMessage<br/>{ type: CHECK_DAPP, url }"]
    C --> D["background.ts: handleCheckDapp(url)"]
    D --> E["Parse hostname, check cache"]
    E --> F["fetch GoPlus API:<br/>/api/v1/phishing_site?url=..."]
    F --> G{Is phishing?}
    G -->|Yes| H["Return { level: danger }"]
    G -->|No| I["Check local safe/scam lists"]
    I --> J["Cache result (10 min TTL)"]
    J --> K["Return { level, reason }"]
    K --> L{level is danger/warning?}
    L -->|Yes| M["Show banner overlay"]
    A --> N["contents/index.tsx: also runs CHECK_DAPP"]
    N --> O["chrome.runtime.sendMessage<br/>{ type: DAPP_RESULT, level, hostname }"]
    O --> P["background.ts: setDappActionBadge(tabId, level)"]
    P --> Q["chrome.action.setBadgeText({ text, tabId })"]
    Q --> R["chrome.action.setBadgeBackgroundColor({ color, tabId })"]
```

### 1.3 Address Check

```mermaid
flowchart TD
    A["User inputs address/ENS/domain<br/>and clicks Check"] --> B["popup.tsx: checkAddress()"]
    B --> C["chrome.runtime.sendMessage<br/>{ type: CHECK_ADDRESS, address }"]
    C --> D["background.ts: handleCheckAddress(input)"]
    D --> E["scanInputApi(input)<br/>Universal scan"]
    E --> F["checkAddressApi(address)<br/>Detailed check (if valid address)"]
    F --> G["Return { success, data: { inputType,<br/>address, riskScore, ... } }"]
    G --> H["setAddressResult(data)"]
    H --> I["loadAddressTags(address)"]
    I --> J["chrome.runtime.sendMessage<br/>{ type: GET_ADDRESS_TAGS, address }"]
    J --> K["background.ts: handleGetAddressTags()"]
    K --> L["getAddressTagsApi(address)"]
    L --> M["Return { success, data: { tags: [...] } }"]
    M --> N["setAddressTags(tags)"]
```

### 1.4 Wallet Events (Real-time)

```mermaid
flowchart TD
    A["MetaMask: accountsChanged / chainChanged"] --> B["MAIN world listener<br/>(injected by background)"]
    B --> C["window.dispatchEvent<br/>('doman-wallet-event', { event, data })"]
    C --> D["wallet-bridge.ts<br/>(ISOLATED world listener)"]
    D --> E["chrome.runtime.sendMessage<br/>{ type: INPAGE_EVENT, event, data }"]
    E --> F["background.ts: handleWalletEvent()"]
    F --> G["updateWalletState({ address / chainId })"]
    G --> H["chrome.storage.local.set({ walletState })"]
    H --> I["chrome.storage.onChanged fires"]
    I --> J["popup.tsx: handleStorageChange()"]
    J --> K["setWallet(newValue)"]
```

### 1.5 Page Status (On Popup Open)

```mermaid
flowchart TD
    A["Popup opens"] --> B["popup.tsx: useEffect -> loadPageStatus()"]
    B --> C["chrome.tabs.query({ active: true })"]
    C --> D["chrome.runtime.sendMessage<br/>{ type: GET_PAGE_STATUS, url }"]
    D --> E["background.ts: handleGetPageStatus(url)"]
    E --> F["handleCheckDapp(url)<br/>Safety check"]
    E --> G["checkDomainApi(domain)<br/>API check"]
    F --> H["Return { safetyLevel, reason,<br/>isScam, riskScore, category }"]
    G --> H
    H --> I["setPageSafety(level)"]
    I --> J["setPageReason(reason)"]
```
