# Glass Gift Shop

A glassmorphism-inspired gift shop built with Next.js App Router, Tailwind CSS, and a lightweight mock of the Base Account SDK. The catalog spans clothing, food, luminous gifts, and an age-gated erotic collection. Checkout provisions simulated Base Sub Accounts, configures Auto Spend permissions, and mocks an on-chain payment on Base Sepolia.

## Features

- ✨ Frosted glass UI with white line art illustrations and shadcn-inspired components
- 🛍️ Filterable, searchable product catalog with 24 seeded items across four categories
- 🛒 Persistent cart using Zustand with quantity management and inline cart math
- 🔐 Erotic collection protected by an 18+ confirmation gate stored in cookies
- 🔗 Mocked Base Account SDK integration with Sub Account creation and auto spend configuration
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

### Running Online (Codespaces/Gitpod)

You can run the project entirely in the cloud without any local setup:

1. Fork this repository.
2. Launch a new [GitHub Codespace](https://docs.github.com/en/codespaces/getting-started/quickstart) or open the repo in [Gitpod](https://gitpod.io/).
3. In the online terminal, run `npm install` followed by `npm run dev -- --hostname 0.0.0.0`.
4. Use the forwarded port (typically `3000`) in the web IDE preview to access the storefront.

Because the Base SDK is mocked, no external blockchain services are required for the demo checkout flow in these online environments.

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
2. Click **Connect Wallet** to generate a mock universal account in memory.
3. Click **Configure Auto Spend** to trigger Sub Account creation and spend permission configuration. The server responds with a mocked payload representing the authorization window and buffer.
4. Click **Pay with Base** to send a simulated transaction using the Sub Account address. The UI displays the generated order ID and transaction hash placeholder.

### Mock Base Account SDK

The real `@base-org/account` package requires authenticated access, which blocks automated installs. To keep the project runnable everywhere, including online sandboxes, the app ships with `src/lib/mock-base-account-sdk.ts`. This mock implements the limited subset of SDK features used in the UI:

- `eth_requestAccounts` / `eth_accounts` return deterministic in-memory wallet addresses.
- `wallet_getSubAccounts` and `wallet_addSubAccount` provision a single mock Sub Account scoped to the current browser session.
- `eth_sendTransaction` returns a pseudo transaction hash for display purposes.

When you're ready to wire up the real SDK, swap the import in `src/lib/base-account.ts` back to `@base-org/account` and reinstall dependencies.

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

Deploy the app to Vercel or any Next.js-compatible platform:

1. Push this repository (or your fork) to GitHub.
2. Import the project in [Vercel](https://vercel.com/new) and pick the repository.
3. Set the build command to `npm run build` and the output directory to `.next` (the defaults).
4. Add the required environment variables on the **Environment Variables** tab:
   - `NEXT_PUBLIC_NETWORK`
   - `NEXT_PUBLIC_BASE_RPC_URL`
   - `NEXT_PUBLIC_BASE_PAYMASTER_URL` (optional)
   - `NEXT_PUBLIC_PAYMENT_RECIPIENT`
   - `NEXT_PUBLIC_PAYMENT_TOKEN`
   - `BASE_API_KEY`
   - `BASE_APP_ID`
5. Deploy. The mock Base Account SDK ships with the repository, so no extra private packages are needed. If you later swap in the real SDK, provide the additional credentials required by Coinbase.

Because the project builds without native dependencies and the Next.js production build passes locally (`npm run build`), the same configuration succeeds on Vercel. Preview deployments inherit the mock checkout flow, so you can demo the storefront without a connected wallet.
