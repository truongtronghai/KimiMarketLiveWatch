# Quickstart: Market Tape Dashboard

Validation and run guide for the market tape dashboard feature. Spec:
[spec.md](./spec.md). Data model: [data-model.md](./data-model.md). API
contracts: [contracts/api.md](./contracts/api.md).

## Prerequisites

- Node.js 18+ and npm.
- No backend or API keys required — all data is simulated (`src/data/`) and
  served locally via MSW.

## Setup

```bash
npm install
```

## Running the app

```bash
npm run dev
```

Open the local Vite URL (printed in the terminal) in a modern browser. MSW is
enabled at startup and serves the simulated feed; the dashboard is a single page.

## Validation scenarios

These scenarios prove the feature works end-to-end (map to success criteria in
`spec.md`):

### 1. Index strip and scrolling quotes visible quickly (SC-001, SC-002)

- **Do**: Load the dashboard.
- **Expect**: The index strip (name, level, change, percent) appears at the top
  within 3 seconds.
- **Do**: Wait 1 minute.
- **Expect**: The quote tape updates in place with no full-page reload.

### 2. Intraday chart and sector flows (FR-003, FR-004)

- **Do**: Select an instrument/index for the intraday chart.
- **Expect**: A price line over a time axis for the session renders.
- **Do**: Inspect the sector flow panel.
- **Expect**: Sectors are ordered by net flow and marked gaining/losing.

### 3. Four news tabs (FR-005, SC-003)

- **Do**: Switch across all four news tabs.
- **Expect**: Each tab shows its content in place and loads in under 1 second;
  an empty tab shows a friendly empty state.

### 4. Typewriter AI read (FR-006, SC-004)

- **Do**: Trigger/observe the AI session read.
- **Expect**: Text renders progressively in typewriter style and completes within
  5 seconds of becoming available; absent read shows a fallback.

### 5. Responsive behavior (FR-010, SC-005)

- **Do**: Resize to a tablet width.
- **Expect**: Layout remains readable/scrollable and all modules functional.

## Automated checks

```bash
npm run lint     # lint the codebase
npm run test     # unit + component tests
```

Expected: all pass with a clean result before completion is claimed.

## Notes

- UI/UX must mirror the original Kimi Market Watch application (constitution
  principle G1). If the reference app cannot be observed, confirm layout details
  with the user.
- Actual run commands may be refined during implementation (`/speckit.tasks`); the
  script names above follow Vite/React conventions.
