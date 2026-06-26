# Signal Intel — Crypto RevOps Dashboard

Live crypto market intelligence dashboard built for CoinGecko RevOps role.

**Stack:** Next.js 14 · Tailwind CSS · Recharts · IBM Plex Mono + Space Grotesk

**Live APIs (no key needed):**
- CoinGecko Keyless Public API → `/api/cg` proxy
- DefiLlama API (free, open) → `/api/dl` proxy

**Views:** RevOps Signal Panel · Market Overview · Token Detail (live charts + RSI/MACD) · Trend Radar · Sector Heatmap · DeFi & On-Chain

**Env vars (optional — boosts rate limits):**
- `COINGECKO_DEMO_KEY` — free demo key from coingecko.com/api
- `COINGECKO_API_KEY` — pro key (switches to pro-api.coingecko.com)
