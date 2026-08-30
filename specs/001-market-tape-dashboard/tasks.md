---
description: 'Task list template for feature implementation'
---

# Tasks: Market Tape Dashboard

**Input**: Design documents from `/specs/001-market-tape-dashboard/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included because the project constitution mandates a test-first workflow (Development Workflow: "Tests MUST be written before implementation"). Each user story phase includes unit/component tests that must fail before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, with `src/data/` for simulated data, `src/mocks/` for MSW, `src/components/`, `src/hooks/`, `src/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Vite + React + TypeScript project at repo root (package.json, vite.config.ts, tsconfig.json, index.html, src/main.tsx, src/App.tsx)
- [x] T002 [P] Install and configure Tailwind CSS (tailwind.config.js, postcss.config.js, src/index.css)
- [x] T003 [P] Install and configure eCharts base setup in src/lib/charts.ts
- [x] T004 [P] Install and configure Tanstack Query (QueryClientProvider) in src/main.tsx
- [x] T005 [P] Install and configure MSW worker bootstrap in src/mocks/browser.ts and generate public/mockServiceWorker.js
- [x] T006 [P] Install and configure Vitest + React Testing Library (vitest.config.ts, src/test/setup.ts)
- [x] T007 [P] Configure linting/formatting (eslint, prettier) for the project

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core simulated data feed and infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create simulated index data collection in src/data/indexes.ts (per data-model.md Index entity)
- [x] T009 [P] Create simulated quote data collection in src/data/quotes.ts (per data-model.md Quote entity)
- [x] T010 [P] Create simulated intraday price series in src/data/intradaySeries.ts (per data-model.md IntradayPricePoint)
- [x] T011 [P] Create simulated sector data collection in src/data/sectors.ts (per data-model.md Sector entity)
- [x] T012 [P] Create simulated news data collection in src/data/newsItems.ts (per data-model.md NewsItem across four tabs)
- [x] T013 [P] Create simulated session read in src/data/sessionRead.ts (per data-model.md Session Read)
- [x] T014 Create MSW handlers in src/mocks/handlers.ts exposing all endpoints defined in contracts/api.md (GET /api/indexes, /api/quotes, /api/intraday, /api/sectors, /api/news, /api/session-read)
- [x] T015 Create shared query hook base wrapping Tanstack Query in src/hooks/useApiQuery.ts (loading/error/empty handling)
- [x] T016 Create single-page App shell layout in src/App.tsx composing module placeholder slots (index strip, tape, chart, sectors, news, AI read)
- [x] T017 [P] Create shared formatting utilities in src/lib/format.ts (currency, percent, change sign/color)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Index Strip & Scrolling Quotes (Priority: P1) 🎯 MVP

**Goal**: Render the headline index strip across the top and a continuously
scrolling quote tape that updates automatically without page reload.

**Independent Test**: Load the page; confirm the index strip shows name, level,
change, and percent for each index, and that the quote tape updates in place over
time with no full-page reload (quickstart scenarios 1).

### Tests for User Story 1 (write FIRST, ensure they FAIL before implementation) ⚠️

- [x] T018 [P] [US1] Component test for IndexStrip rendering name/level/change/percent in tests/component/indexStrip.test.tsx
- [x] T019 [P] [US1] Component test for QuoteTape auto-updating without reload in tests/component/quoteTape.test.tsx

### Implementation for User Story 1

- [x] T020 [P] [US1] Implement useIndexes hook (Tanstack Query for GET /api/indexes) in src/hooks/useIndexes.ts
- [x] T021 [P] [US1] Implement IndexStrip component in src/components/index-strip/IndexStrip.tsx
- [x] T022 [P] [US1] Implement useQuotes hook (polling GET /api/quotes) in src/hooks/useQuotes.ts
- [x] T023 [US1] Implement QuoteTape component using useQuotes in src/components/quote-tape/QuoteTape.tsx (depends on T022)
- [x] T024 [US1] Wire IndexStrip and QuoteTape into the App shell in src/App.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Intraday Chart & Sector Flows (Priority: P1)

**Goal**: Render the intraday price chart (eCharts) for a selected instrument and
the sector flow panel ordering sectors by net flow with gaining/losing marks.

**Independent Test**: Select an instrument and see the intraday price line over a
time axis; view the sector panel ordered by net flow with gaining/losing markers
(quickstart scenario 2).

### Tests for User Story 2 (write FIRST, ensure they FAIL before implementation) ⚠️

- [x] T025 [P] [US2] Component test for IntradayChart rendering a series and tolerating single-point/empty data in tests/component/intradayChart.test.tsx
- [x] T026 [P] [US2] Component test for SectorFlows ordering and direction marking in tests/component/sectorFlows.test.tsx

### Implementation for User Story 2

- [x] T027 [P] [US2] Implement useIntradaySeries hook (GET /api/intraday?symbol=) in src/hooks/useIntradaySeries.ts
- [x] T028 [P] [US2] Implement IntradayChart component using eCharts in src/components/intraday-chart/IntradayChart.tsx
- [x] T029 [P] [US2] Implement useSectors hook (GET /api/sectors) in src/hooks/useSectors.ts
- [x] T030 [US2] Implement SectorFlows component in src/components/sector-flows/SectorFlows.tsx (depends on T029)
- [x] T031 [US2] Wire IntradayChart and SectorFlows into the App shell with instrument selection in src/App.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - News Tabs & Typewriter AI Read (Priority: P2)

**Goal**: Render four distinct switchable news tabs and a typewriter-style AI
read of the session that renders progressively until complete.

**Independent Test**: Switch across all four news tabs with content loading in
place; observe the AI read rendering progressively in typewriter style
(quickstart scenarios 3 and 4).

### Tests for User Story 3 (write FIRST, ensure they FAIL before implementation) ⚠️

- [x] T032 [P] [US3] Component test for NewsPanel switching across four tabs and empty-tab state in tests/component/newsPanel.test.tsx
- [x] T033 [P] [US3] Component test for AiRead progressive typewriter rendering in tests/component/aiRead.test.tsx

### Implementation for User Story 3

- [x] T034 [P] [US3] Implement useNews hook (GET /api/news?tab=) in src/hooks/useNews.ts
- [x] T035 [P] [US3] Implement NewsPanel component with four tabs in src/components/news-panel/NewsPanel.tsx
- [x] T036 [P] [US3] Implement useSessionRead hook (GET /api/session-read) in src/hooks/useSessionRead.ts
- [x] T037 [P] [US3] Create typewriter render utility in src/lib/typewriter.ts
- [x] T038 [US3] Implement AiRead component using typewriter utility in src/components/ai-read/AiRead.tsx (depends on T036, T037)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T039 [P] Responsive layout adjustments for tablet widths across all modules in src/App.tsx and component styles
- [x] T040 [P] Implement empty/fallback states (no news in a tab, no AI read, no quote updates, single-point/empty chart) across modules
- [x] T041 [P] Implement loading and error state handling consistent with the original UI across all data hooks
- [x] T042 Run lint and typecheck; fix all issues to a clean result
- [x] T043 Run quickstart.md validation scenarios end-to-end and confirm success criteria are met
- [x] T044 [P] Add/adjust unit tests to cover edge cases identified in spec.md (empty tape, single-point chart, empty tab)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independently testable, shares only the foundational data/MSW feed
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independently testable, shares only the foundational data/MSW feed

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Hooks before components
- Components before wiring into App shell
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Hooks/components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Component test for IndexStrip rendering in tests/component/indexStrip.test.tsx"
Task: "Component test for QuoteTape auto-updating in tests/component/quoteTape.test.tsx"

# Launch hooks and components together:
Task: "Implement useIndexes hook in src/hooks/useIndexes.ts"
Task: "Implement IndexStrip component in src/components/index-strip/IndexStrip.tsx"
Task: "Implement useQuotes hook in src/hooks/useQuotes.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Constitution (G1 UI/UX Parity): mirror the original Kimi Market Watch app; if the
  reference cannot be observed, confirm layout with the user before finalizing
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence
