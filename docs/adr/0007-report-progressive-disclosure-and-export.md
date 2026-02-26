# 7. Report Progressive Disclosure and Functional Export

Date: 2026-02-25

## Status

Accepted

## Context

The report page (`app/report/[...slug]/page.tsx`) rendered all scan results as a single 659-line vertical scroll: grade, 5 category cards, the full health checklist (every check expanded with why/impact/fix), deep dive metrics, governance, guardrails, dependencies, repo map, and recommendations — all visible at once. This created two problems:

1. **Information overload** — Users couldn't focus on specific areas. The health checklist alone showed 15-20 fully expanded checks with 3-column detail grids, burying the sections below it.
2. **Dead export button** — The "Export Report" button in the header was non-functional, making it impossible to share or feed report data into AI agents for further analysis.

The page was also a single 659-line server component with 5 inline helper components (CategoryCard, CheckItem, ChecklistSection, GuardrailItem, RecommendationCard), making it difficult to maintain or extend.

## Decision

### Progressive Disclosure via Tabs + Collapsibles

Reorganize the report into an always-visible header (grade card + 5 category summary cards) followed by 4 tabbed sections:

| Tab | Content | Rationale |
|-----|---------|-----------|
| Health Check | Collapsible category sections with collapsible check items | Primary diagnostic, largest section — benefits most from collapse |
| Insights | Decision Optics + Delivery Velocity + Recommendations | Groups "what happened and what to do" |
| Governance | Governance & Compliance + Guardrails & Security | Organizational/process controls together |
| Dependencies | Dependency Health + Repository Map | Codebase composition and supply chain |

Within Health Check: categories are collapsed by default (showing summary badges like "3 passed, 1 warning"), check items show one-line status when expanded, and detail grids (why/impact/fix) require a second click. Failed checks (`not_done`) auto-expand to surface issues immediately.

Category cards are clickable and navigate to the mapped tab. Tab state syncs to `?tab=` URL search params for bookmarkability.

### Functional Export with Section Selection

The Export button opens a client-side dialog where users select which sections to include and choose between JSON (structured for AI agent consumption) or Markdown (human-readable). Download uses the proven blob-download pattern from the generator page. Export logic lives in a pure utility (`lib/report-export.ts`) separate from UI concerns.

### Component Extraction

Extract the monolithic page into 8 focused components under `components/report/`, reducing the page to ~100 lines of data fetching + composition. Server component passes serializable data to client component slots via the standard Next.js App Router pattern.

Key design choices:

- **No new npm dependencies** — Tabs and collapsibles built with React context and state. No headless UI library needed for this scope.
- **URL-synced tabs via `useSearchParams`** — Wrapped in `<Suspense>` for hydration safety. Router replace (not push) to avoid polluting history.
- **Pure export functions** — `exportReportAsJson` and `exportReportAsMarkdown` are pure functions that take data + a `Set<ExportSection>`, making them testable without UI.

## Consequences

- Report page is now navigable by section instead of requiring full-page scrolling.
- Failed checks are immediately visible without manually scanning a long list.
- Reports can be exported and shared as JSON (for AI agent pipelines) or Markdown (for PRs, Slack, docs).
- The page component dropped from 659 to ~100 lines; each panel is independently maintainable.
- MermaidDiagram re-mounts on tab switch (acceptable, already handles via `useEffect`).
- Future work: deep-link to specific checks, export to clipboard, scheduled report generation.
