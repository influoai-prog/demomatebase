# Glass Gift Shop

A glassmorphism-inspired gift shop built with Next.js App Router, Tailwind CSS, and Base Account SDK. The catalog spans clothing, food, luminous gifts, and an age-gated erotic collection. Checkout provisions Base Sub Accounts, configures Auto Spend permissions, and simulates on-chain payment on Base Sepolia.

## Features

- ✨ Frosted glass UI with white line art illustrations and shadcn-inspired components
- 🛍️ Filterable, searchable product catalog with 24 seeded items across four categories
- 🛒 Persistent cart using Zustand with quantity management and inline cart math
- 🔐 Erotic collection protected by an 18+ confirmation gate stored in cookies
- 🔗 Base Account SDK integration with Sub Account creation and auto spend configuration
- 💸 Demo checkout flow that simulates Base Sepolia payment payloads
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
BASE_API_KEY=YOUR_KEY
BASE_APP_ID=your_app_id
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASE_PAYMASTER_URL=https://your-paymaster.example
NEXT_PUBLIC_PAYMENT_RECIPIENT=0x5d5b47Fb9137E8ffFD9472A5480C219c2B33Ff22
NEXT_PUBLIC_PAYMENT_TOKEN=0x0000000000000000000000000000000000000000
```

- `NEXT_PUBLIC_NETWORK` toggles Base Sepolia (`base-sepolia`) or Base mainnet (`base`).
- `NEXT_PUBLIC_BASE_RPC_URL` should target the appropriate Base RPC endpoint.
- `NEXT_PUBLIC_BASE_PAYMASTER_URL` is optional if sponsoring gas.
- `NEXT_PUBLIC_PAYMENT_RECIPIENT` and `NEXT_PUBLIC_PAYMENT_TOKEN` define the store contract/address and settlement token.

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to explore the storefront.

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

1. Add items to the cart and proceed to `/checkout`.
2. Click **Configure Auto Spend** to trigger Sub Account creation and spend permission configuration. The server responds with a mocked payload representing the authorization window and buffer.
3. Click **Pay with Base** to send a simulated transaction using the Sub Account address. The UI displays the generated order ID and transaction hash placeholder.

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
