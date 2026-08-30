# Data Model: Market Tape Dashboard

Entities derived from `spec.md` Key Entities. Simulated data lives in separate
files under `src/data/` and is served via MSW handlers. Contracts describe the
exposed resource shapes in `contracts/`.

## Entities

### Index

A headline market index displayed in the top index strip.

| Field           | Type   | Description             | Example     |
| --------------- | ------ | ----------------------- | ----------- |
| `id`            | string | Unique identifier       | `"idx-spx"` |
| `name`          | string | Display name            | `"S&P 500"` |
| `symbol`        | string | Ticker symbol           | `"SPX"`     |
| `level`         | number | Current index level     | `5624.5`    |
| `change`        | number | Absolute session change | `18.2`      |
| `changePercent` | number | Percent session change  | `0.32`      |

**Relationships**: standalone collection displayed in the index strip.

### Quote

A single instrument's simulated price entry in the scrolling tape.

| Field           | Type   | Description              | Example        |
| --------------- | ------ | ------------------------ | -------------- |
| `symbol`        | string | Ticker symbol            | `"AAPL"`       |
| `name`          | string | Company name             | `"Apple Inc."` |
| `price`         | number | Current simulated price  | `189.42`       |
| `change`        | number | Absolute session change  | `1.23`         |
| `changePercent` | number | Percent session change   | `0.65`         |
| `sectorId`      | string | Linked sector identifier | `"sec-tech"`   |

**Relationships**: many quotes → one sector (`sectorId`).

### IntradayPricePoint

A timestamped price composing the intraday chart series for a selected
instrument/index.

| Field       | Type              | Description             | Example                  |
| ----------- | ----------------- | ----------------------- | ------------------------ |
| `timestamp` | string (ISO 8601) | Point time              | `"2026-08-30T09:31:00Z"` |
| `price`     | number            | Price at that timestamp | `5602.1`                 |

**Relationships**: a series of points belongs to one instrument/index (`symbol`).

### Sector

A market sector with net flow shown in the sector flow panel.

| Field       | Type   | Description                         | Example        |
| ----------- | ------ | ----------------------------------- | -------------- |
| `id`        | string | Unique identifier                   | `"sec-tech"`   |
| `name`      | string | Sector name                         | `"Technology"` |
| `netFlow`   | number | Net flow magnitude (currency units) | `1250000`      |
| `direction` | enum   | `"gaining"` \| `"losing"`           | `"gaining"`    |

**Relationships**: one sector → many quotes.

### News Item

A headline grouped under one of the four news tabs.

| Field         | Type              | Description                    | Example                  |
| ------------- | ----------------- | ------------------------------ | ------------------------ |
| `id`          | string            | Unique identifier              | `"news-1"`               |
| `tabId`       | string            | One of the four tab categories | `"top"`                  |
| `title`       | string            | Headline text                  | `"Tech leads rally"`     |
| `source`      | string            | Publisher/source label         | `"MarketWire"`           |
| `publishedAt` | string (ISO 8601) | Publication time               | `"2026-08-30T10:15:00Z"` |

**Relationships**: many news items → one tab category (`tabId`).

### Session Read

A generated narrative summary of the session rendered in typewriter style.

| Field         | Type              | Description                                   | Example                           |
| ------------- | ----------------- | --------------------------------------------- | --------------------------------- |
| `id`          | string            | Unique identifier                             | `"read-1"`                        |
| `title`       | string            | Read heading                                  | `"Session Summary"`               |
| `sections`    | array of strings  | Progressive paragraphs rendered in typewriter | `["Markets opened higher…", ...]` |
| `generatedAt` | string (ISO 8601) | When generated                                | `"2026-08-30T16:00:00Z"`          |

**Relationships**: standalone content block for the current session.

## Validation Rules

Feature has no user-supplied forms, so zod/RHF (G3) is not applicable. Data-shape
validation (types/enums) is enforced by TypeScript types derived as the single
source of truth for the simulated data modules; consumers rely on these shapes
rather than re-validating.

## State Transitions

- **Quote tape**: simulated quote values refresh on a polling cadence via Tanstack
  Query; component reflects new values in place with no page reload (SC-002).
- **News tabs**: switching tabs changes the active `tabId`; content for the active
  tab is fetched/displayed in place (FR-005, SC-003).
- **AI read**: on availability, `sections` render progressively (typewriter) until
  all sections are shown; empty read → friendly fallback state (FR-009).
- **Intraday chart**: selected instrument determines which point series is plotted;
  single-point/gap series renders without error (edge case).

## Data File Layout (simulated sources)

```text
src/data/
├── indexes.ts         # Index[] collection for the strip
├── quotes.ts          # Quote[] collection for the tape
├── intradaySeries.ts  # IntradayPricePoint[] per symbol
├── sectors.ts         # Sector[] for sector flows
├── newsItems.ts       # NewsItem[] across four tabs
└── sessionRead.ts     # Session Read narrative
```

These files are the single source of simulated data; they are imported by MSW
handlers (`src/mocks/`), never by components directly.
