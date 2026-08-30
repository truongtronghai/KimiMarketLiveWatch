# API Contracts: Market Tape Dashboard

This SPA has no real backend. To satisfy the constitution's requirement that mock
data be delivered through MSW (and fetched via Tanstack Query), MSW exposes the
resource endpoints below. Each handler returns the simulated data held in
`src/data/`. These contracts are what consuming components rely on.

All responses are JSON. Timestamps are ISO 8601. Money/levels are plain numbers.
`src/types.ts` mirrors every payload shape below.

## Resources

### `GET /api/indexes`

Returns the index strip data.

**200 OK**

```json
{
  "indexes": [
    {
      "id": "idx-spx",
      "name": "S&P 500",
      "symbol": "SPX",
      "level": 5634.2,
      "change": 18.9,
      "changePercent": 0.34
    }
  ]
}
```

### `GET /api/quotes`

Returns the scrolling quote tape. Prices mutate slightly on each fetch so the
tape and watchlist can demonstrate live updating.

**200 OK**

```json
{
  "quotes": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 227.4,
      "previousClose": 226.9,
      "change": 0.5,
      "changePercent": 0.22,
      "volume": 52000000,
      "sectorId": "sec-tech",
      "isWatched": true
    }
  ]
}
```

### `GET /api/quote/:symbol`

Returns a single pooled quote.

- **200 OK** → `{ "quote": { …same shape as a quote above… } }`
- **404 Not Found** → `{ "detail": "not-found" }` when the symbol is not in the pool.

### `POST /api/watchlist/:symbol`

Toggles a pooled symbol into the watch list (idempotent).

- **200 OK** → `{ "symbol": "COIN", "added": true }` for any pooled symbol (already
  tracked or newly added).
- **404 Not Found** → `{ "symbol": "COIN", "added": false }` for symbols outside the pool.

### `GET /api/intraday?symbol={symbol}`

Returns the intraday price series for an instrument. The series is built from a
seeded walk anchored at `previousClose` and is cut to the current time of day
(so pre-open there are very few points).

**200 OK**

```json
{
  "symbol": "NVDA",
  "previousClose": 130.6,
  "points": [
    {
      "timestamp": "2026-08-30T13:30:00.000Z",
      "price": 131.6,
      "volume": 3100000,
      "vwap": 131.2
    }
  ]
}
```

Consumers MUST render a single-point or empty series without error.

### `GET /api/sectors`

Returns the GICS sector heat data, pre-sorted by absolute `changePercent`
descending so the heat grid renders most-→least-changed left to right.

**200 OK**

```json
{
  "sectors": [
    {
      "id": "id-soxx",
      "name": "Semiconductors",
      "symbol": "SOXX",
      "changePercent": 3.08,
      "direction": "gaining",
      "netFlow": 1240000000
    }
  ]
}
```

`direction` is `"gaining" | "losing"`.

### `GET /api/news?tab={tabId}`

Returns ranking/feed entries for one of the four tabs:
`gainers | active | earnings | news`.

Each item is a `RankingEntry`. Quote tabs (`gainers`, `active`) fill
`symbol`/`price`/`changePercent`/`reason`; the earnings tab uses `dateLabel`;
the news tab uses `source`/`time`/`title`. Fields not used by a tab are omitted.

**200 OK**

```json
{
  "tab": "gainers",
  "items": [
    {
      "id": "gainers-NVDA",
      "tabId": "gainers",
      "symbol": "NVDA",
      "title": "NVIDIA Corp.",
      "price": 131.8,
      "changePercent": 3.08,
      "reason": "Trend continuation, volume in line"
    }
  ]
}
```

**200 OK** news tab item:

```json
{
  "id": "news-1",
  "tabId": "news",
  "title": "NVDA pares gains as options traders take profit",
  "source": "Reuters",
  "time": "10:14",
  "publishedAt": "2026-08-30T14:14:00Z"
}
```

**200 OK (empty tab)** → `{ "tab": "earnings", "items": [] }`

### `GET /api/session-read`

Returns the AI session read as a set of typewriter chips with 1–2 variants each.

**200 OK**

```json
{
  "id": "read-1",
  "title": "AI Analysis",
  "generatedAt": "2026-08-30T16:00:00Z",
  "chips": [
    {
      "id": "brief",
      "label": "Market Brief",
      "variants": ["MARKET BRIEF — …", "MARKET BRIEF — …"]
    },
    { "id": "move", "label": "Sector Read", "variants": ["SECTOR READ — …"] },
    { "id": "risk", "label": "Risk Notes", "variants": ["RISK NOTES — …"] }
  ]
}
```

### `GET /api/holdings`

Returns the demo portfolio positions, enriched with the live quote so the
portfolio summary can compute market value and day/position P&L.

**200 OK**

```json
{
  "holdings": [
    {
      "symbol": "NVDA",
      "name": "NVIDIA Corp.",
      "shares": 120,
      "costPerShare": 105.2,
      "price": 131.8,
      "previousClose": 130.6,
      "changePercent": 0.92
    }
  ]
}
```

## Contract Notes

- These endpoints are implemented by MSW handlers in `src/mocks/` and backed by
  the data modules in `src/data/`. They represent the interface the UI consumes;
  swapping them for a real backend later only requires replacing MSW, not the
  components.
- Components fetch via Tanstack Query and must handle loading, error, and empty
  states per constitution "UI/UX & Data Requirements".
- The reference `NewsItem`/`EarningsAnnouncement` types in `src/data/types.ts`
  remain the seed types; the endpoints emit the enriched `RankingEntry` wire
  shape documented above (a deliberate superset, per the decision recorded in
  `research.md` and `tasks.md`).
