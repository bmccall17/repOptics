# repOptics - Product & Technical Specification

**Version**: 0.2.0

## 1. Product Overview

**repOptics** is a "repo optics" tool for Product Managers and Technical Leads. It scans a GitHub repository for decision evidence, architecture documentation, and delivery hygiene.

**Core Value**: It answers the question, "Do we have our house in order?" by identifying missing ADRs, architecture docs, and governance controls.

**Personality**: The tool uses a "dry humor, developer nerd" persona. It doesn't just report errors; it gently mocks the lack of discipline (e.g., "You have no ADRs. Did we decide the architecture by telepathy?").

## 2. Features

### 2.1 Repository Scanner (MVP)

1. **Repo Connection**:
   - Input: `owner/repo` string (e.g., `facebook/react`).
   - Auth: Optional Personal Access Token (PAT) for higher rate limits/private repos. Default to unauthenticated public access.

2. **The Scan (Heuristics Engine)**:
   - **Decisions (ADRs)**: Checks for `docs/adr`, `doc/adr`, `docs/architecture/decisions`, etc.
   - **Architecture**: Checks for comprehensive READMEs, diagrams (`.puml`, `.mermaid`, `.drawio`, `.excalidraw`).
   - **Governance**: Checks for `CODEOWNERS`, `LICENSE`, `CONTRIBUTING.md`, `GOVERNANCE.md`, `AGENTS.md`.
   - **CI/CD**: Checks for `.github/workflows`.
   - **Hygiene**: Checks for PR templates (`.github/pull_request_template.md`).
   - **Dependencies**: Audits `package.json` against npm registry for outdated packages.

3. **Dashboard**:
   - Visual "Health Score" (0-100) with letter grade (A/B/C/F).
   - Five category breakdown: Decisions, Architecture, Governance, Delivery, Dependencies.
   - "What's Missing" vs "What Exists" visualization.
   - **Recommendations**: Prioritized list of tasks (Quick Wins vs Strategic).

4. **Outputs**:
   - Web Dashboard.
   - Markdown Report (Downloadable - planned).
   - "Dry Run" Issue Creation (Simulates creating GitHub issues - planned).

### 2.2 Project Generator Wizard (v0.2.0)

A 5-step wizard for scaffolding new projects with excellent hygiene:

| Step | Name | Description |
|------|------|-------------|
| 1 | Identity | Project name and description |
| 2 | Codebase | TypeScript scaffolding, AI context (AGENTS.md) |
| 3 | Governance | ADR templates, CODEOWNERS, PR templates |
| 4 | Operations | CI/CD workflows (GitHub Actions), Docker |
| 5 | Review | Summary and ZIP download |

**Generated Artifacts**:
- `README.md` - Project documentation
- `doc/architecture/decisions/` - ADR directory with starter ADR
- `.github/workflows/ci.yml` - CI pipeline
- `CODEOWNERS` - Ownership definitions
- `.github/pull_request_template.md` - PR checklist
- `AGENTS.md` - AI agent context file
- `Dockerfile` / `docker-compose.yml` - Container config (optional)
- `package.json`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts` - TypeScript scaffold (optional)

**Implementation**: Client-side ZIP generation using JSZip. No server-side file storage.

### 2.3 Decision Timeline (v0.2.0)

Visual representation of ADR history using Mermaid.js:
- Chronological graph of decisions
- Color-coded by status (Accepted=green, Rejected=red, Proposed=yellow)
- Interactive node display

### 2.4 Dependency Audit (v0.2.0)

Automated package health check:
- Parses `package.json` from scanned repository
- Compares versions against npm registry latest
- Categorizes updates: Major (breaking), Minor (features), Patch (fixes)
- Impacts scoring in Dependencies category

### 2.5 Enhanced Governance Detection (v0.2.0)

New file detections:
- `AGENTS.md` - AI agent instructions for automated coding tools
- `GOVERNANCE.md` - Project governance documentation

## 3. Technical Architecture

- **Framework**: Next.js 16 (App Router, Server Components)
- **React**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **API Client**: `octokit` (GitHub SDK)
- **Visualizations**: Mermaid.js for decision timelines
- **ZIP Generation**: JSZip (client-side, browser-based)
- **Testing**: Vitest
- **State/Cache**: In-memory/React State (scans are on-demand, stateless)

### Architecture Decision Records

Key decisions are documented in `docs/adr/`:
- ADR-0001: Use Architecture Decision Records
- ADR-0002: Single Service Architecture (vs monorepo)
- ADR-0003: Unauthenticated GitHub API by Default
- ADR-0004: Client-Side ZIP Generation

## 4. Data Privacy

- No database storage of code.
- Tokens are kept in browser memory or server environment, never persisted to a backend DB.
- Scans are ephemeral - results are not stored between sessions.
- Generated ZIP files are created client-side and never uploaded.

## 5. Scoring System

### Category Weights (Equal)
Each category contributes 20% to the total score.

### Decisions Score
- Base: 0 ADRs = 0 points
- 1+ ADRs = 50 points
- 3+ ADRs = 80 points
- ADRs with dates = +20 points bonus

### Architecture Score
- README exists = 20 points
- README > 1000 chars = 50 points
- Diagrams present = 50 points

### Governance Score
- CODEOWNERS = 40 points
- LICENSE = 30 points
- CONTRIBUTING.md = 30 points

### Delivery Score
- CI workflows = 50 points
- PR template = 30 points
- Fast PR merge time (<24h) = 20 points
- Medium PR merge time (<72h) = 10 points

### Dependencies Score
- Starts at 100
- Major updates: -15 points each
- Minor updates: -5 points each

### Grade Thresholds
- A: 90+
- B: 70-89
- C: 50-69
- F: <50

## 6. Future Roadmap (Post-MVP)

### Deferred by Design
Per Max's guidance on avoiding over-engineering:
- Database persistence (stay stateless)
- Multi-repo organization view
- Automatic PR creation
- OAuth / GitHub App integration
- Background workers
- Monorepo extraction
- History/trends tracking

### Potential v0.3.0+
- Export to Markdown report
- GitHub Issue creation (dry run)
- Branch protection visibility
- Secret scanning detection
- Dependabot status
