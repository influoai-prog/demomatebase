# Mate Shop

Mate Shop is a glassmorphism-inspired Base commerce demo built with the Next.js App Router, Tailwind CSS, and the Base Account SDK. The catalog highlights a dozen luminous curios with inline wallet-aware cart controls, while checkout provisions Base Sub Accounts, enables auto-spend, and routes payments through Base Perfect Checkout.

## Features

- ✨ Frosted glass aesthetic with a responsive card grid for twelve curated products
- 👜 Inline cart controls with add-to-cart and Base-powered checkout from every product
- 🧊 Real Base Account SDK integration that provisions Sub Accounts on connect, enables auto spend permissions, and supports skipping repetitive approvals
- 💳 Embedded Base Perfect Checkout flow that routes cart totals through Base Pay using Sub Accounts
- 📦 Configurable metadata, paymaster routing, and Base network selection via environment variables
- 💼 Wallet tray surfaces the signing (owner) wallet alongside the sub account, live balances, and faucet/manual funding shortcuts

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file with the Base configuration that fits your deployment. Every key below is optional but unlocks additional branding, RPC routing, or payment flexibility when supplied.

```env
NEXT_PUBLIC_NETWORK=base-sepolia
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASE_APP_NAME=Mate Shop
NEXT_PUBLIC_BASE_APP_LOGO=https://mate-shop.vercel.app/icon.png
NEXT_PUBLIC_BASE_PAYMASTER_URL=https://your-paymaster.example
NEXT_PUBLIC_BASE_INVOICE_RECIPIENT=0xYourMerchantAddress
NEXT_PUBLIC_BASE_INVOICE_AMOUNT=100000
NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN=0xYourPreferredToken
NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN_DECIMALS=6
NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN_SYMBOL=USDC
NEXT_PUBLIC_BASE_AUTO_SPEND_LIMIT=1000000000000000
NEXT_PUBLIC_BASE_CHECKOUT_RECIPIENT=0xYourMerchantAddress
NEXT_PUBLIC_BASE_WALLET_URL=https://wallet.base.org
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

### Perfect Checkout

Mate Shop wires the cart experience into Base Perfect Checkout. After provisioning a Sub Account and settling the $0.10 invoice, the “Complete Checkout” button triggers the `pay` helper from the Base Account SDK. This launches the Base Perfect Checkout overlay, requests an Auto Spend permission if needed, and settles the cart total with USDC to the configured merchant address. Transaction hashes are surfaced back in the UI so shoppers can verify the payment.

## Perfect Checkout

After connecting a Base wallet, Mate Shop provisions a Sub Account, refreshes balances for the signing and checkout wallets, and prompts for auto-spend if needed. When the shopper clicks **Complete Checkout**, the app settles the authorization invoice (using the configured spend token) and launches Base Perfect Checkout with the cart total routed to the configured recipient.

## Running Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to browse the shelf, add items, and test the wallet integration. `npm run lint` and `CI=1 npm run build` exercise static analysis and production builds.

## Reference

- The [Sub Accounts FC Demo](https://github.com/stephancill/sub-accounts-fc-demo) provides an end-to-end example that inspired the funding workflow used here.
- Base Account SDK docs: https://docs.base.org/base-account/improve-ux/sub-accounts

## Deployment

Deploy to Vercel or any Next.js-friendly host. Copy the same environment variables to production and ensure the Base RPC and paymaster endpoints are accessible from your deployment environment.
