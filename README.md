# Glass Gift Shop

A glassmorphism-inspired gift shop built with the Next.js App Router and Tailwind CSS that now talks directly to the real `@base-org/account` SDK. Shoppers browse luminous clothing, food, gifts, and an age-gated erotic collection, then settle a live Base invoice that keeps their sub account active before completing checkout.

## Features

- ✨ Frosted glass UI with white line art illustrations and shadcn-inspired components
- 🛍️ Filterable, searchable product catalog with 24 seeded items across four categories
- 🛒 Persistent cart using Zustand with quantity management and inline cart math
- 🔐 Erotic collection protected by an 18+ confirmation gate stored in cookies
- 🔗 Real Base Account SDK integration with sub account creation, auto spend permissions, and invoice settlement
- 💸 Drawer-based checkout that requires a live $0.10 Base invoice before confirming the order
- 🧪 Vitest unit tests and Playwright smoke test

## Getting Started

### Prerequisites

- Node.js 18+
- npm (project configured for npm scripts)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_NETWORK=base-sepolia
NEXT_PUBLIC_BASE_APP_NAME=Mate Shop
NEXT_PUBLIC_BASE_APP_LOGO=https://mate-shop.vercel.app/icon.png
NEXT_PUBLIC_BASE_AUTO_SPEND_LIMIT=1000000000000000
NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN=0x5425890298aed601595a70ab815c96711a31bc65
NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN_DECIMALS=6
NEXT_PUBLIC_BASE_INVOICE_RECIPIENT=0x5d5b47Fb9137E8ffFD9472A5480C219c2B33Ff22
NEXT_PUBLIC_BASE_INVOICE_WEI=50000000000000
NEXT_PUBLIC_BASE_PAYMASTER_URL=https://your-paymaster.example
```

- `NEXT_PUBLIC_NETWORK` toggles Base Sepolia (`base-sepolia`) or Base mainnet (`base`).
- `NEXT_PUBLIC_BASE_APP_NAME` and `NEXT_PUBLIC_BASE_APP_LOGO` control the wallet modal branding.
- `NEXT_PUBLIC_BASE_AUTO_SPEND_*` configure the spend permission token, decimals, and maximum allowance.
- `NEXT_PUBLIC_BASE_INVOICE_*` configure the invoice destination and minimum amount (in wei) that must be paid before checkout.
- `NEXT_PUBLIC_BASE_PAYMASTER_URL` is optional if you are sponsoring gas via a paymaster.

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to explore the storefront.

### Running Online (Codespaces/Gitpod)

You can run the project entirely in the cloud without any local setup:

1. Fork this repository.
2. Launch a new [GitHub Codespace](https://docs.github.com/en/codespaces/getting-started/quickstart) or open the repo in [Gitpod](https://gitpod.io/).
3. In the online terminal, run `npm install` followed by `npm run dev -- --hostname 0.0.0.0`.
4. Use the forwarded port (typically `3000`) in the web IDE preview to access the storefront.

> ℹ️ Install the Base Smart Wallet browser extension in your Codespace or Gitpod session so you can approve invoice and checkout requests.

### Switching Networks

- For Base Sepolia: set `NEXT_PUBLIC_NETWORK=base-sepolia` and use the Sepolia RPC/paymaster URLs.
- For Base mainnet: set `NEXT_PUBLIC_NETWORK=base` and point `BASE_RPC_URL` to the Base mainnet RPC. Ensure wallet accounts hold sufficient mainnet funds before testing.

### Seeding Products

Products are stored in `src/data/products.ts`. Adjust or expand the array to seed new items. Each product exposes `category`, `tags`, pricing, and inline SVG line art.

### Funding Test Wallets

1. Install Coinbase Smart Wallet or connect a wallet that supports Base.
2. Fund the universal account with Base Sepolia ETH using the [Base Sepolia faucet](https://docs.base.org/tools/network-faucets).
3. Connect in the checkout flow; the app provisions a Sub Account and requests auto spend permissions for the buffered order total.

### Simulating Purchases

1. Add items to the cart and open the drawer from the navbar.
2. Click **Base Wallet** to connect your universal account.
3. Click **Configure Auto Spend** to provision a sub account and approve the buffered spend limit.
4. Approve the $0.10 Base invoice, then select **Complete Checkout** to send the order confirmation call.

### Running Tests

```bash
npm run lint
npm run test
npm run playwright
```

> The Playwright smoke test expects `npm run dev` to be running in another terminal.

## Project Structure Highlights

- `src/app` — Next.js App Router routes and layouts
- `src/data/products.ts` — Seed data with inline SVG illustrations
- `src/lib` — Cart store, utils, Base SDK provider, and payment helpers
- `src/components` — shadcn-inspired glass UI building blocks and feature components
- `tests/` — Playwright smoke test

## Deploying

Deploy the app to Vercel or any Next.js-compatible platform. Provide the same environment variables for network selection and Base credentials. Ensure RPC and paymaster URLs are accessible from the deployment environment.
