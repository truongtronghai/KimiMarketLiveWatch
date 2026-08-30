# Research: Market Tape Dashboard

**Phase 0 output** — resolves technical unknowns and reconciles the user-specified
stack with the tabulated project constitution.

## Decisions

### D1 - Framework and build tooling: React + Vite

- **Decision**: React 18+ with Vite as the build tool and dev server.
- **Rationale**: User-specified. Vite gives fast HMR for a single-page dashboard
  and is the standard companion to React SPA development with Tailwind.
- **Alternatives considered**: Next.js (heavier, SSR unnecessary for a local
  simulated SPA); plain Vite without React (excluded by requirement for a React
  app).

### D2 - Styling: Tailwind CSS

- **Decision**: Tailwind CSS for all component styling.
- **Rationale**: User-specified; matches a utility-first styling approach suited to
  quickly reproducing the original app's dense quote/tape panels.
- **Alternatives considered**: Plain CSS / CSS Modules (slower to replicate the
  dense, consistent tape styling); styled-components (runtime cost not needed).

### D3 - Charts: eCharts

- **Decision**: eCharts for the intraday price chart and any charted visualization
  (e.g., sector flow bars).
- **Rationale**: User-specified and enforced by constitution principle **G4 (Charts
  via eCharts)**. eCharts is the sole permitted charting library.
- **Alternatives considered**: Chart.js, Recharts, D3 — all excluded by the
  constitution.

### D4 - Simulated data source: dedicated data files served through MSW

- **Decision**: Simulated data lives in dedicated files under `src/data/` (one
  module per entity type) and is delivered to the UI through MSW request handlers
  (registered under `src/mocks/`). Components consume the data exclusively via
  Tanstack Query.
- **Rationale**: Satisfies the user's explicit constraint that data is simulated,
  isolated to separate files, and never hard-coded inside component JSX. It also
  satisfies constitution principle **G2 (Live Data Integrity)**, which requires
  Tanstack Query for data fetching and MSW for mock data rather than inline
  fixtures in components.
- **Alternative**: Inlining mock arrays directly in components — rejected (violates
  user constraint and G2).

### D5 - Data-fetching state: Tanstack Query

- **Decision**: Tanstack Query manages all data fetching and cache/refresh of the
  simulated feed, enabling automatic quote-tape updates (SC-002) without full-page
  reloads.
- **Rationale**: Constitution principle **G2** mandates Tanstack Query for data
  fetching from backend services; MSW satisfies the "backend" role here.
- **Alternatives considered**: React context + setTimeout polling (manual,
  no caching/refetch ergonomics); plain fetch in effects (no query-state handling
  such as loading/error).

### D6 - Testing strategy: Vitest + React Testing Library

- **Decision**: Vitest + React Testing Library for unit and component tests.
- **Rationale**: Standard for Vite+React; fast, colocated unit/component tests
  satisfy the constitution's test-first workflow gate.
- **Alternatives considered**: Jest (heavier config with Vite); Playwright e2e
  (retained for full-page module validation of the tape and tabs — leaned on in
  quickstart.md).

### D7 - Visual parity approach

- **Decision**: Recreate the original Kimi Market Watch layout: index strip at
  top, scrolling tape, chart, sector flows, news tabs, AI read. Where the exact
  original measure is not determinable from available assets, the implementation
  follows the source app's conventions and the uncertain detail is flagged for
  user guidance (constitution **G1**).
- **Rationale**: Constitution principle **G1 (UI/UX Parity)** is non-negotiable
  and forbids invented UI.
- **Alternatives considered**: Designing a "fresh" layout — rejected (violates G1).

### D8 - First column DOM: restore `#pview` (portfolio view structure)

- **Reference evidence**: the original app's left column (`aside.col l`) keeps
  both the watch list and portfolio view always mounted and toggles them with the
  `hidden` attribute (extracted from the served bundle at
  https://7shescfoerzyo.ok.kimi.link/):
  - `<div class="wtabs">…</div>`, `<div class="wsearch" id="wsearch" hidden>…</div>`,
    `<div class="wlist" id="wlist" hidden>…</div>`, and
  - `<div class="pview" id="pview" hidden>…</div>` — the portfolio view — containing
    `.psum` then `<div id="prows">`.
- **`#pview` inner structure (original)**:
  - `.psum` holds three `.t` rows, each a `<span>` label plus a `<b>` value with a
    fixed id: `#p-total` (market value), `#p-day` (day P&L, `up`/`dn` class,
    `<small>` = day P&L % of opening value), `#p-pnl` (total return, `<small>` =
    cost-basis return %). The sparkline svg (`#p-spark`) is the LAST child of
    `.psum`, not a sibling.
  - `#prows` lists `.prow` rows with `.nm`, `.sub` (`{sh} sh · avg {avg} · last
{price} · {d%}`) and `.pnl` (signed dollar P&L).
  - Dollar figures are thousand-separated rounded integers (`+$3,192`), not
    compact K/M notation.
- **Decision**: mirror that structure exactly in `WatchlistPanel.tsx` —
  `<div className="pview" id="pview" hidden={activeTab !== 'hold'}>` wrapping
  `.psum` (labels as `<span>`, `<b id="p-total|p-day|p-pnl">`, `#p-spark` inside)
  and `<div id="prows">`. Both tabs (search box, `.wlist`, `.pview`) stay mounted
  and are toggled via the `hidden` attribute. Formatting uses
  `formatCurrencyRounded` / `formatSignedCurrencyRounded` in `src/lib/format.ts`.
- **Out of scope (per user, 2026-08-30)**: the count pill position (`.cnt` footer
  vs `#w-count` tail in `.wtabs`), the add-symbol input style (`.go` label vs
  `ADD SYMBOL…` placeholder), and the watch-row child order (ours
  `nm.full.pv.pc` vs original `nm.pv.full.pc`) were left as-is.

## Open items for user guidance (G1)

The exact spacing/typography values of the original Kimi Market Watch app are not
available as local assets. During implementation, match the reference application
(https://7shescfoerzyo.ok.kimi.link/) for these details. If it cannot be reached
or observed, confirm the intended look with the user before finalising the layout.

## Summary of reconciliation

- User-specified stack (React, Vite, Tailwind, eCharts) is adopted verbatim.
- Constitution's G2 mandate (Tanstack Query + MSW for mocks) is compatible with the
  user's "separate data files" requirement by placing simulated data in
  `src/data/` and serving it through MSW handlers.
- Constitution's G3 (zod/RHR) is not applicable — the feature has no forms.
