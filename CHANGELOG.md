# Changelog

All notable changes to this project will be documented in this file.

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