# Feature Specification: Market Tape Dashboard

**Feature Branch**: `001-market-tape-dashboard`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "A single-page market tape led by an index strip and scrolling quotes, with an intraday chart, sector flows, four news tabs and a typewriter-style AI read of the session. Data shown is simulated."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View the market at a glance (Priority: P1)

A trader opens the market dashboard and immediately sees the current state of the
session in a single screen: the headline index strip across the top, live
scrolling quotes, and a summary of where the market stands. They can read the
whole session in seconds without navigating away.

**Why this priority**: The index strip and scrolling quotes are the core of a
"market tape" experience. Without this the dashboard does not deliver its primary
value of an at-a-glance market read.

**Independent Test**: Load the page and confirm the index strip renders current
levels/change for the headline indices and that quotes scroll continuously. This
alone is a usable MVP that shows live market movement.

**Acceptance Scenarios**:

1. **Given** the dashboard is opened, **When** the page finishes loading, **Then**
   an index strip is visible at the top showing each index name, level, change,
   and percent change.
2. **Given** the dashboard is open, **When** time passes, **Then** the scrolling
   quote tape updates automatically without any page reload.

---

### User Story 2 - Analyse the intraday picture (Priority: P1)

After seeing the headline numbers, the user studies the intraday chart and
sector flows to understand what is driving the session and where money is
moving.

**Why this priority**: Intraday chart and sector flows answer the "why" behind
the headline movement, which is the analytical heart of the dashboard.

**Independent Test**: View the intraday price chart of a selected instrument and
the sector flow display (gaining/losing sectors). Individually testable and
delivers analysis value.

**Acceptance Scenarios**:

1. **Given** an instrument is selected, **When** the intraday chart loads, **Then**
   a price line for the session is shown along a time axis.
2. **Given** sector flow data is available, **When** the sector panel is viewed,
   **Then** sectors are ordered by net flow and marked as gaining or losing.

---

### User Story 3 - Consume the news and the AI read (Priority: P2)

The user reviews the four news tabs to keep up with the latest headlines and
reads an AI-generated, typewriter-style summary of the session to get a narrative
take on the day.

**Why this priority**: News and the AI read enrich the tape, but the dashboard
remains valuable without them; hence P2.

**Independent Test**: Browse content across all four news tabs and observe the
typewriter-style AI read render progressively. Individually testable as a
secondary value layer.

**Acceptance Scenarios**:

1. **Given** the news panel is shown, **When** the user switches between any of
   the four tabs, **Then** the appropriate content loads for the selected tab.
2. **Given** an AI read is available, **When** it is displayed, **Then** the text
   appears progressively in typewriter fashion until the full read is shown.

---

### Edge Cases

- What happens when the simulated feed pauses or the quote tape has no new
  updates — does the tape remain stable without errors?
- What happens when there is no AI read available for the current session — is a
  friendly empty/fallback state shown?
- What happens when a news tab has no articles — is an empty state shown
  consistent with the original UI?
- What happens when the intraday chart has a single data point or a gap in the
  session — does it render without breaking?
- What happens on smaller viewport widths — does the single-page layout remain
  readable and scrollable?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display an index strip at the top of the page listing
  each headline index with its name, current level, change, and percent change.
- **FR-002**: System MUST render a scrolling quote tape that updates automatically
  as new simulated quotes arrive, without requiring user action.
- **FR-003**: System MUST present an intraday chart showing price movement over
  the current session along a time axis.
- **FR-004**: System MUST show sector flows, distinguishing gaining from losing
  sectors and indicating relative magnitude.
- **FR-005**: System MUST provide four distinct news tabs, each presenting a
  separate category of headlines, switchable in-place.
- **FR-006**: System MUST display a typewriter-style AI read that renders a
  narrative summary of the session progressively until complete.
- **FR-007**: System MUST present all of the above within a single page without
  full-page reloads as data updates.
- **FR-008**: System MUST run entirely on simulated data with no real market
  data source, and MUST clearly not depend on live external feeds.
- **FR-009**: System MUST handle empty states gracefully (no news in a tab, no AI
  read available, no quote updates) without errors.
- **FR-010**: System MUST keep the layout usable and readable on smaller
  viewport widths.

### Key Entities _(include if feature involves data)_

- **Index**: A headline market index with name, current level, session change,
  and percent change.
- **Quote**: A single instrument's simulated price entry used by the scrolling
  tape, including symbol, price, and change.
- **IntradayPricePoint**: A timestamped price value composing the intraday chart
  series for a selected instrument.
- **Sector**: A market sector with a net flow magnitude and direction
  (gaining/losing).
- **News Item**: A headline article with a category, title, and source, grouped
  under one of the four news tabs.
- **Session Read**: A generated, narrative summary of the market session rendered
  in typewriter style.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users see the index strip and scrolling quotes within 3 seconds of
  opening the dashboard.
- **SC-002**: Quotes update and pages remain responsive without any full-page
  reload during a 1-minute observation.
- **SC-003**: Users can switch between all four news tabs with visible content
  loading in under 1 second each.
- **SC-004**: The AI session read renders from start to finish in typewriter
  style without user interaction within 5 seconds of becoming available.
- **SC-005**: All primary features (index strip, quotes, chart, sector flows,
  news, AI read) remain functional on desktop and common tablet viewports.

## Assumptions

- Data is simulated; the feature does not connect to any real market data
  provider. All quotes, levels, and flows are generated locally.
- The dashboard targets a desktop-first single-page layout, with responsive
  behaviour on common browser widths.
- The visual design must match the original Kimi Market Watch application; any
  unspecified visual detail should follow the source application's conventions
  where determinable, otherwise be flagged for guidance.
- Updates are near-real-time within a single browser session; historical
  multi-day data is out of scope for this feature.
- No user authentication, accounts, or personalization is required; the
  dashboard is a public read-only view.
- The AI read is a generated narrative; its source is assumed to be an available
  simulated/generated text for the current session.
