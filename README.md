# Mate Shop

A single-page micro shop built with the Next.js App Router and Tailwind CSS. Mate Shop presents twelve luminous curios, each marked with a frosted pixel-glass icon, priced between one and five dollars, and backed by real Base Account SDK connectivity with Sub Accounts and auto spend permissions.

## Features

- ✨ Frosted glass aesthetic with a responsive card grid for twelve curated products
- 👜 Inline cart controls with add-to-cart and Base-powered checkout from every product
- 🧊 Real Base Account SDK integration that provisions Sub Accounts on connect, enables auto spend permissions, and supports skipping repetitive approvals
- 💳 Embedded Base Perfect Checkout flow that routes cart totals through Base Pay using Sub Accounts
- 📦 Configurable metadata, paymaster routing, and Base network selection via environment variables
- 💼 Wallet tray surfaces the connected account, signing/funder wallet, and auto-spend sub account with live balances, one-click top-ups, built-in faucet requests, and manual funding shortcuts

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root with the Base environment details you want to use. The keys below are optional but unlock richer branding and RPC routing when supplied.

```env
NEXT_PUBLIC_NETWORK=base-sepolia
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASE_APP_NAME=Mate Shop
NEXT_PUBLIC_BASE_APP_LOGO=https://mate-shop.vercel.app/icon.png
NEXT_PUBLIC_BASE_PAYMASTER_URL=https://your-paymaster.example
NEXT_PUBLIC_BASE_INVOICE_RECIPIENT=0xYourMerchantAddress
NEXT_PUBLIC_BASE_INVOICE_WEI=50000000000000
NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN=0xYourPreferredToken
NEXT_PUBLIC_BASE_AUTO_SPEND_LIMIT=1000000000000000
NEXT_PUBLIC_BASE_CHECKOUT_RECIPIENT=0xYourMerchantAddress
NEXT_PUBLIC_BASE_WALLET_URL=https://wallet.base.org
NEXT_PUBLIC_BASE_SUBACCOUNT_FUND_WEI=500000000000000
CDP_API_KEY_ID=your-cdp-api-key-id
CDP_API_KEY_SECRET=your-cdp-api-key-secret
CDP_WALLET_SECRET=your-cdp-wallet-secret
```

- `NEXT_PUBLIC_NETWORK` may be set to `base` for mainnet or `base-sepolia` for testnet.
- `NEXT_PUBLIC_BASE_RPC_URL` overrides the default RPC URL for the chosen network.
- `NEXT_PUBLIC_BASE_APP_NAME` and `NEXT_PUBLIC_BASE_APP_LOGO` customize the metadata surfaced in the Base Account connect dialog.
- `NEXT_PUBLIC_BASE_PAYMASTER_URL` configures an optional paymaster endpoint for the Base Account SDK.
- `NEXT_PUBLIC_BASE_INVOICE_RECIPIENT` should point to the account that receives the $0.10 authorization transaction.
- `NEXT_PUBLIC_BASE_INVOICE_WEI` controls the value (in wei) of the authorization invoice (defaults to roughly $0.10 of ETH).
- `NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN` (optional) narrows spend permissions to a specific ERC-20 address; omit to accept the Base native asset.
- `NEXT_PUBLIC_BASE_AUTO_SPEND_LIMIT` tunes the auto-spend ceiling in wei (defaults to 0.001 ETH when unset).
- `NEXT_PUBLIC_BASE_CHECKOUT_RECIPIENT` designates the address that receives the Base Perfect Checkout payment (defaults to the invoice recipient when omitted).
- `NEXT_PUBLIC_BASE_WALLET_URL` optionally points the Base Account SDK to a custom wallet URL (defaults to the standard Base wallet when omitted).
- `NEXT_PUBLIC_BASE_SUBACCOUNT_FUND_WEI` controls the default amount (in wei) transferred from the signing wallet to the sub account when using the “Fund Sub Account” shortcut.
- `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`, and `CDP_WALLET_SECRET` enable the built-in Base Sepolia faucet endpoint exposed at `POST /api/faucet`.

### Perfect Checkout

Mate Shop wires the cart experience into Base Perfect Checkout. After provisioning a Sub Account and settling the $0.10 invoice, the “Complete Checkout” button triggers the `pay` helper from the Base Account SDK. This launches the Base Perfect Checkout overlay, requests an Auto Spend permission if needed, and settles the cart total with USDC to the configured merchant address. Transaction hashes are surfaced back in the UI so shoppers can verify the payment.

### Testnet faucet support

When `NEXT_PUBLIC_NETWORK` is set to `base-sepolia`, the wallet tray links directly to the official Base faucet. Projects may also call the in-app `POST /api/faucet` proxy, which wraps the [Coinbase Developer Platform faucet API](https://portal.cdp.coinbase.com/). Provide your CDP API key and wallet secret via `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`, and `CDP_WALLET_SECRET` to enable the proxy endpoint.

### Running Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to browse the shelf, add items to your cart, and connect a Base account.

## Reference Material

- The [Sub Accounts FC Demo](https://github.com/stephancill/sub-accounts-fc-demo) showcases an end-to-end example of Base sub accounts powering a feed-style application and inspired the wallet funding experience used here.

## Project Structure Highlights

- `src/app` — Next.js routes, layout, and provider configuration
- `src/data/products.ts` — Twelve seeded items with pricing metadata
- `src/components` — UI building blocks including the product card, cart overlay, and Base Account utilities
- `src/lib` — Utility helpers for currency formatting and wallet-friendly strings

## Deployment

Deploy the project to Vercel or any Next.js compatible hosting provider. Remember to configure the same environment variables for your production Base network, RPC endpoint, and Base Account SDK metadata.
