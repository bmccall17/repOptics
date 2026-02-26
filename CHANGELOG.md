# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2026-02-25

### Added
- **Tabbed Report Navigation**: Report page now uses 4 tabs (Health Check, Insights, Governance, Dependencies) instead of a single vertical scroll
- **Progressive Disclosure**: Health Check categories and individual check items are collapsible; failed checks auto-expand for immediate visibility
- **Interactive Category Cards**: Clicking a category card (Decisions, Architecture, etc.) navigates to the relevant tab with active ring highlight
- **Bookmarkable Tabs**: Tab state syncs to URL search params (`?tab=health`) so links to specific sections are shareable
- **Functional Export Report**: Export button opens a dialog with section checkboxes, Select All/Deselect All, and JSON or Markdown format toggle
- **JSON Export**: Structured output optimized for AI agent re-import with metadata, section filtering, and clean schema
- **Markdown Export**: Human-readable report with proper headings, tables, and code blocks
- **UI Primitives**: New `Tabs` and `CollapsibleSection` components built with React context + Tailwind (no new dependencies)

### Changed
- `app/report/[...slug]/page.tsx`: Refactored from 659 lines to ~100 lines by extracting 8 component modules
- `app/report/[...slug]/loading.tsx`: Updated skeleton to match new 5-column card + tab layout

### New Files
- `components/ui/tabs.tsx` — Tab primitives (Tabs, TabsList, TabsTrigger, TabsContent)
- `components/ui/collapsible.tsx` — CollapsibleSection with animated chevron
- `components/report/health-check-panel.tsx` — Collapsible health checklist with auto-expanding failures
- `components/report/insights-panel.tsx` — Decision Optics + Delivery Velocity + Recommendations
- `components/report/governance-panel.tsx` — Governance & Compliance + Guardrails & Security
- `components/report/dependencies-panel.tsx` — Dependency Health + Repository Map
- `components/report/report-tabs.tsx` — Tab orchestration with URL search param sync
- `components/report/interactive-category-cards.tsx` — Clickable category cards with tab navigation
- `components/report/export-dialog.tsx` — Export modal with section/format selection and blob download
- `lib/report-export.ts` — Pure functions for JSON and Markdown export with section filtering

## [0.3.0] - 2026-01-28

### Added
- **Decision Intelligence**: Generator wizard now uses decision answers to drive behavior (ADR-0005)
- **Auto-Select Modules**: Modules automatically enabled/disabled based on intent, lifespan, CI, and testing answers
- **"Recommended" Badges**: Visual indicators show which modules are recommended based on your decisions
- **Decision Conflict Warnings**: Yellow warning boxes alert users to problematic combinations (e.g., production + no tests, server + $0 budget)
- **Expanded Stack Recommendations**: 15+ combinatorial recommendations based on runtime, budget, storage, auth, and purpose
- **Decision Summary**: Collapsible "View all X decisions" section in Review step shows all captured question/answer pairs
- **Manual Override Tracking**: Auto-selections respect user manual changes and don't overwrite them

### Changed
- `lib/questions.ts`: Added `validateDecisions()`, `getSelectedOption()`, and `DecisionConflict` type
- `lib/handoff.ts`: Expanded `generateStackRecommendations()` with combinatorial logic
- `app/generate/page.tsx`: Added decision-driven module selection and conflict display

## [0.2.0] - 2026-01-28

### Added
- **Project Generator Wizard**: A 5-step interactive workflow (`/generate`) to scaffold new projects with best practices (ADRs, Governance, CI/CD).
- **Governance Optics**: Enhanced repo scoring to check for `CODEOWNERS`, [CONTRIBUTING.md](cci:7://file:///c:/Users/brett/Documents/GitHub/repOptics/CONTRIBUTING.md:0:0-0:0), and `AGENTS.md`.
- **Dependency Audit**: Visual breakdown of major vs. minor dependency updates in the report view.
- **Decision Timeline**: Mermaid JS visualization for Architecture Decision Records (ADRs).

### Fixed
- **Development Environment**: Resolved critical `npm` installation failures on Windows environments.
- **Build System**: Fixed missing `@rollup/rollup-win32-x64-msvc` binary causing test and dev server crashes.
- **Dependencies**: Synchronized [package-lock.json](cci:7://file:///c:/Users/brett/Documents/GitHub/repOptics/package-lock.json:0:0-0:0) with correct optional dependencies for cross-platform stability.

### Verified
- **End-to-End Testing**: Validated [vitest](cci:7://file:///c:/Users/brett/Documents/GitHub/repOptics/node_modules/.bin/vitest:0:0-0:0) test suite passes (Heuristics & Dependency scanners).
- **Scanner Logic**: Confirmed report generation works for public repositories.