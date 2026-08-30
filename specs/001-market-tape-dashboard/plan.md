# Implementation Plan: Market Tape Dashboard

**Branch**: `001-market-tape-dashboard` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-market-tape-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Build a single-page market tape dashboard matching the original Kimi Market Watch
application. The page is led by an index strip at the top and a continuously
scrolling quote tape, with an intraday price chart, sector flows, four news tabs,
and a typewriter-style AI read of the session. All data is simulated and lives in
dedicated data files (never hard-coded inside component JSX). The app is a
frontend-only SPA built with React, Vite, Tailwind CSS, and eCharts, served
locally with no real market feed.

## Technical Context

**Language/Version**: JavaScript (ECMAScript 2022+, via Vite), React 18+

**Primary Dependencies**:

- React (UI) with React DOM
- Vite (build tool and dev server)
- Tailwind CSS (styling)
- eCharts (all charts)
- Tanstack Query (data fetching/state for the simulated feed)
- MSW (Mock Service Worker serving the simulated data)

**Storage**: N/A (in-memory browser state; simulated data loaded from local data
files via MSW)

**Testing**: Vitest + React Testing Library (unit/component); Playwright or
Vitest browser runner (end-to-end) — final framing chosen to keep the quickstart
runnable; see research.md

**Target Platform**: Modern evergreen desktop browsers (Chrome, Edge, Firefox,
Safari) and common tablet widths

**Project Type**: Frontend-only single-page web application (SPA)

**Performance Goals**: Index strip and scrolling quotes visible within 3 seconds
of load (SC-001); quote tape updates without full-page reload (SC-002); news tab
switches render content in under 1 second (SC-003); AI read completes typewriter
render within 5 seconds of availability (SC-004)

**Constraints**: Simulated data only (no live external feeds) (FR-008); data
stored in separate data files, never hard-coded in JSX; single-page, no full-page
reload (FR-007); responsive on desktop and tablet (FR-010)

**Scale/Scope**: One dashboard page with 6 modules (index strip, quote tape,
intraday chart, sector flows, news, AI read); simulated dataset of a handful of
indices, a few dozen quotes, multiple sectors, sample news items, and one session
read

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Gates derived from `.specify/memory/constitution.md` (v1.0.0):

- **G1 - UI/UX Parity (NON-NEGOTIABLE)**: Every screen/interaction mirrors the
  original Kimi Market Watch app; no invented visuals; ask when uncertain.
  _Compliance: UI modules and layout mirror the source application; uncertain
  visual details flagged in research.md for guidance._
- **G2 - Live Data Integrity**: Quotes/levels wired to data (Tanstack Query),
  no hard-coded/stale values in components; mock data through MSW, not inline
  fixtures in JSX. _Compliance: simulated data served through MSW from separate
  data files; components consume it via Tanstack Query._
- **G3 - Validation-First**: zod + React Hook Form for validation/forms.
  _Compliance: no forms in this feature; not applicable. No zod schemas required
  because no user input exists._
- **G4 - Charts via eCharts**: All charts use eCharts only. _Compliance: intraday
  chart and any sector-flow visualization use eCharts._
- **G5 - Meaningful Naming**: No abbreviations; descriptive names. _Compliance:
  code uses full, meaningful identifiers._

No gate violations. Phase 0 (research) may proceed.

**Post-design re-check (after Phase 1):** All gates remain green.

- G1: `research.md` flags the visual-parity open item and defers to the reference
  app; no invented UI introduced.
- G2: design routes all simulated data through `src/data/` → MSW handlers →
  Tanstack Query; no data hard-coded in components (see `contracts/api.md`,
  `data-model.md`).
- G3: no forms, so not applicable.
- G4: intraday chart and sector visualizations use eCharts only.
- G5: naming conventions applied throughout the planned structure.

## Project Structure

### Documentation (this feature)

```text
specs/001-market-tape-dashboard/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── index-strip/
│   ├── quote-tape/
│   ├── intraday-chart/
│   ├── sector-flows/
│   ├── news-panel/
│   └── ai-read/
├── hooks/
├── lib/                 # eCharts setup, formatting, typewriter util
├── mocks/               # MSW handlers + browser/worker setup
├── data/                # simulated data files (indexes, quotes, sectors, news, session read)
├── App.tsx
├── main.tsx
└── index.css

tests/  (or colocated __tests__)
├── unit/
├── component/
└── e2e/
```

**Structure Decision**: Single frontend project (Option 1). The feature is a
self-contained SPA with no backend, so a single `src/` tree with a
feature-per-module component folder matches the requirement and keeps each of the
six modules independently testable. Simulated data is isolated in `src/data/`
and delivered through MSW handlers in `src/mocks/`, so no data is embedded in JSX.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations require justification.
