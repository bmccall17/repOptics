# repOptics - Product & Technical Specification

## 1. Product Overview
**repOptics** is a "repo optics" tool for Product Managers and Technical Leads. It scans a GitHub repository for decision evidence, architecture documentation, and delivery hygiene.

**Core Value**: It answers the question, "Do we have our house in order?" by identifying missing ADRs, architecture docs, and governance controls.

**Personality**: The tool uses a "dry humor, developer nerd" persona. It doesn't just report errors; it gently mocks the lack of discipline (e.g., "You have no ADRs. Did we decide the architecture by telepathy?").

## 2. Features (MVP)
1.  **Repo Connection**:
    *   Input: `owner/repo` string (e.g., `facebook/react`).
    *   Auth: Optional Personal Access Token (PAT) for higher rate limits/private repos. Default to unauthenticated public access.
2.  **The Scan (Heuristics Engine)**:
    *   **Decisions (ADRs)**: Checks for `docs/adr`, `decision-records`, etc.
    *   **Architecture**: Checks for C4 diagrams, comprehensive READMEs.
    *   **Governance**: Checks for `CODEOWNERS`, `LICENSE`, `CONTRIBUTING.md`.
    *   **CI/CD**: Checks for `.github/workflows`.
    *   **Hygiene**: Checks for PR templates (`.github/pull_request_template.md`).
3.  **Dashboard**:
    *   Visual "Health Score".
    *   "What's Missing" vs "What Exists".
    *   **Recommendations**: Prioritized list of tasks (e.g., "Create a CODEOWNERS file so we know who to blame").
4.  **Outputs**:
    *   Web Dashboard.
    *   Markdown Report (Downloadable).
    *   "Dry Run" Issue Creation (Simulates creating GitHub issues).

## 3. Technical Architecture
*   **Framework**: Next.js 14+ (App Router).
*   **Styling**: Tailwind CSS (Clean, high-contrast, "terminal-like" aesthetics optionally).
*   **API Client**: `octokit` (GitHub SDK).
*   **State/Cache**: In-memory/React State for MVP (scans are on-demand).

## 4. Data Privacy
*   No database storage of code.
*   Tokens are kept in browser memory or session, never persisted to a backend DB by us.

## 5. Future Roadmap (Post-MVP)
*   Full OAuth App integration.
*   History tracking (Score over time).
*   Automatic PR creation for missing files.
