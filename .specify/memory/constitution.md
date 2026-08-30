<!--
# Sync Impact Report

- Version change: (none/blank scaffold) → 1.0.0
- Modified principles: none renamed (first population of all sections)
- Added sections: Core Principles (5), UI/UX & Data Requirements, Development Workflow, Governance
- Removed sections: none
- Deferred TODOs: RATIFICATION_DATE (original adoption date unknown)

RAISED / NOTES:
- Initial constitution is being populated from the resolved template scaffold.
- RATIFICATION_DATE intentionally left TODO because the original project
  constitution had no recorded adoption date.
-->

# KimiMarketLiveWatch Constitution

## Core Principles

### I. UI/UX Parity (NON-NEGOTIABLE)

Every screen and interaction MUST mirror the original web application
([Kimi Market watch](https://7shescfoerzyo.ok.kimi.link/)) as closely as
possible. UI/UX MUST not be assumed or invented. When a visual or behavioral
match cannot be determined with confidence, MUST ask for guidance rather than
guess.

### II. Live Data Integrity

All market quotes and prices MUST be wired to live data feeds; no hard-coded or
stale values in production. Data fetching from the backend MUST use Tanstack
Query. When a real backend is not available, mock data MUST be provided through
MSW (Mock Service Worker) rather than inline fixtures in components.

### III. Validation-First

All schema and form validation MUST use zod. All forms MUST be built with React
Hook Form. Validation rules MUST be declarative and centralized in zod schemas;
components MUST consume validated data, not duplicate validation logic.

### IV. Charts via eCharts

All chart and graphing requirements MUST be implemented with eCharts. No
alternative charting library MAY be introduced without explicit approval.

### V. Meaningful Naming

Functions and classes MUST use meaningful, descriptive names. Abbreviations ARE
FORBIDDEN unless they are widely understood domain terms. Names MUST communicate
intent so that code reads as documentation.

## UI/UX & Data Requirements

This application is a clone of the original Kimi Market Watch web application.
Behavioural parity with the source is a primary requirement.

- The SPA dashboard MUST provide a market overview with live-updating quotes.
- Visual layout, typography, spacing, and interaction patterns MUST match the
  original application.
- Real-time updates MUST be reflected without full-page reloads.
- Query state (loading, error, stale) MUST be handled gracefully and surfaced to
  the user consistent with the original UI.

## Development Workflow

- Tests MUST be written before implementation (test-first). A feature or fix is
  not complete until its tests pass.
- Matching against the original web application is a verification gate: any UI
  change MUST be confirmed against the source before being considered done.
- Before claiming completion, run the project's lint and typecheck commands and
  confirm a clean result.
- Do not commit or create pull requests unless explicitly requested.

## Governance

This constitution supersedes all other project practices. It defines the
non-negotiable constraints for this application.

- Amendments require written documentation of the change and a recorded reason.
- Constitutional changes MUST follow semantic versioning (MAJOR for removed or
  redefined principles, MINOR for new principles or materially expanded
  guidance, PATCH for clarifications and wording).
- All code reviews, pull requests, and feature work MUST comply with the
  principles herein. Any deviation MUST be justified and, where appropriate,
  proposed as a constitutional amendment rather than silently ignored.
- Where runtime development guidance is needed, refer to AGENTS.md.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2026-08-30
