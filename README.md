# Mate Shop

Mate Shop is a glassmorphism-inspired Base commerce demo built with the Next.js App Router, Tailwind CSS, and the Base Account SDK. The catalog highlights a dozen luminous curios with inline wallet-aware cart controls, while checkout provisions Base Sub Accounts, enables auto-spend, and routes payments through Base Perfect Checkout.

## Features

- ✨ Frosted glass UI for a curated twelve-item shelf with responsive layout and inline cart actions
- 🧾 Cart math with subtotal, tax, and total calculations in USD cents plus Base Perfect Checkout launching directly from the cart
- 🔐 Base Account SDK integration that creates Sub Accounts on connect, requests auto-spend permissions, and manages spend tokens
- 💳 Base Perfect Checkout flow that settles invoices with USDC (or a configured token) to the merchant recipient
- 👛 Wallet tray showing the connected signing wallet with copy/refresh controls, token and native balances, and checkout wallet metadata

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
NEXT_PUBLIC_BASE_SUBACCOUNT_FUND_WEI=500000000000000
```

- `NEXT_PUBLIC_NETWORK` accepts `base` (mainnet) or `base-sepolia` (testnet) and controls default contract metadata.
- `NEXT_PUBLIC_BASE_RPC_URL` overrides the RPC used for balance lookups; when omitted the Base chain defaults are used.
- `NEXT_PUBLIC_BASE_APP_NAME` and `NEXT_PUBLIC_BASE_APP_LOGO` customize Base Account connect dialogs.
- `NEXT_PUBLIC_BASE_PAYMASTER_URL` injects an optional paymaster endpoint for sponsored transactions.
- `NEXT_PUBLIC_BASE_INVOICE_RECIPIENT` designates the account that receives the authorization invoice and checkout funds.
- `NEXT_PUBLIC_BASE_INVOICE_AMOUNT` sets the invoice amount in base units (defaults to 0.10 USDC when a spend token is configured).
- `NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN` narrows spend permissions to a specific ERC-20 token. When omitted Mate Shop defaults to network USDC (`0x833589fCd6eDb6E08f4f5F044bBd19c5436e3E6A` on Base, `0x036cbd53842c5426634e7929541ec2318f3dcf7e` on Base Sepolia).
- `NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN_DECIMALS` and `NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN_SYMBOL` override the token metadata used for balances and invoice math.
- `NEXT_PUBLIC_BASE_AUTO_SPEND_LIMIT` controls the auto-spend ceiling (defaults to 100 USDC when a token is configured or 0.001 ETH otherwise).
- `NEXT_PUBLIC_BASE_CHECKOUT_RECIPIENT` overrides the checkout destination (falls back to the invoice recipient when omitted).
- `NEXT_PUBLIC_BASE_WALLET_URL` points the Base Account SDK at a custom wallet URL.
- `NEXT_PUBLIC_BASE_SUBACCOUNT_FUND_WEI` sets the default amount transferred from the signing wallet when manually funding the sub account.

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
