# Mate Shop

A single-page micro shop built with the Next.js App Router and Tailwind CSS. Mate Shop presents twelve luminous curios, each marked with a frosted pixel-glass icon, priced between one and five dollars, and backed by real Base Account SDK connectivity with Sub Accounts and auto spend permissions.

## Features

- ✨ Frosted glass aesthetic with a responsive card grid for twelve curated products
- 👜 Inline cart controls with add-to-cart and Base-powered checkout from every product
- 🧊 Real Base Account SDK integration that provisions Sub Accounts on connect, enables auto spend permissions, and supports skipping repetitive approvals
- 📦 Configurable metadata, paymaster routing, and Base network selection via environment variables

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
```

- `NEXT_PUBLIC_NETWORK` may be set to `base` for mainnet or `base-sepolia` for testnet.
- `NEXT_PUBLIC_BASE_RPC_URL` overrides the default RPC URL for the chosen network.
- `NEXT_PUBLIC_BASE_APP_NAME` and `NEXT_PUBLIC_BASE_APP_LOGO` customize the metadata surfaced in the Base Account connect dialog.
- `NEXT_PUBLIC_BASE_PAYMASTER_URL` configures an optional paymaster endpoint for the Base Account SDK.
- `NEXT_PUBLIC_BASE_INVOICE_RECIPIENT` should point to the account that receives the $0.10 authorization transaction.
- `NEXT_PUBLIC_BASE_INVOICE_WEI` controls the value (in wei) of the authorization invoice (defaults to roughly $0.10 of ETH).
- `NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN` (optional) narrows spend permissions to a specific ERC-20 address; omit to accept the Base native asset.
- `NEXT_PUBLIC_BASE_AUTO_SPEND_LIMIT` tunes the auto-spend ceiling in wei (defaults to 0.001 ETH when unset).

### Running Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to browse the shelf, add items to your cart, and connect a Base account.

## Project Structure Highlights

- `src/app` — Next.js routes, layout, and provider configuration
- `src/data/products.ts` — Twelve seeded items with pricing metadata
- `src/components` — UI building blocks including the product card, cart overlay, and Base Account utilities
- `src/lib` — Utility helpers for currency formatting and wallet-friendly strings

## Deployment

Deploy the project to Vercel or any Next.js compatible hosting provider. Remember to configure the same environment variables for your production Base network, RPC endpoint, and Base Account SDK metadata.
