# Changelog

All notable changes to this project will be documented in this file.

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