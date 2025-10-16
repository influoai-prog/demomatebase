# Glass Gift Shop

A single-page micro shop built with the Next.js App Router, Tailwind CSS, and Coinbase's OnchainKit. The shelf features twelve luminous curios, each marked with an emoji symbol and priced between one and five dollars. Wallet connectivity, Base chain configuration, and analytics are provided by the real Base account tooling exposed through OnchainKit.

## Features

- ✨ Frosted glass aesthetic with responsive card grid for twelve curated products
- 💵 Flat pricing between $1 and $5 with currency helpers and tag badges
- 🪙 Coinbase OnchainKit integration for Base connectivity, smart wallet support, and analytics
- 🌐 Configurable for Base mainnet or Base Sepolia via environment variables

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root with the Base environment details you want to use. The keys below are optional but unlock richer telemetry and RPC routing when supplied.

```env
NEXT_PUBLIC_NETWORK=base-sepolia
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CDP_API_KEY=your_cdp_api_key
NEXT_PUBLIC_CDP_PROJECT_ID=your_cdp_project_id
```

- `NEXT_PUBLIC_NETWORK` may be set to `base` for mainnet or `base-sepolia` for testnet.
- `NEXT_PUBLIC_BASE_RPC_URL` overrides the default RPC URL for the chosen network.
- `NEXT_PUBLIC_CDP_API_KEY` and `NEXT_PUBLIC_CDP_PROJECT_ID` enable authenticated CDP RPC requests and analytics inside OnchainKit.

### Running Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to browse the shelf and connect a Base-compatible wallet.

## Project Structure Highlights

- `src/app` — Next.js routes, layout, and provider configuration
- `src/data/products.ts` — Twelve seeded items with emoji symbols and pricing metadata
- `src/components` — UI building blocks including the product card and wallet connect button
- `src/lib` — Utility helpers for currency formatting and product filtering

## Deployment

Deploy the project to Vercel or any Next.js compatible hosting provider. Remember to configure the same environment variables for your production Base network, RPC endpoint, and Coinbase Developer Platform credentials.
