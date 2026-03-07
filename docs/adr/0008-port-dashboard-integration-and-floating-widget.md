# 8. Port.io Dashboard Integration and Floating Catalog Widget

Date: 2026-03-06

## Status

Accepted

## Context

repOptics had a working Port.io integration: Ocean sync (hourly via GitHub Actions), Snyk enrichment, 4 scorecards, a service blueprint with 12 entities, and a comparison page (`/port-compare`) rendering live catalog data server-side. The Port setup was entirely REST API-driven (bash scripts + curl), with no UI presence beyond the comparison page.

Three gaps remained:

1. **No PR metrics visibility** -- The `github-ocean` exporter was syncing `githubPullRequest` entities (with `status`, `creator`, `leadTimeHours`, `createdAt`, `mergedAt`, etc.), but no dashboard existed to surface them.
2. **No portfolio overview dashboard** -- Scorecard data, vulnerability aggregates, service distribution, and language breakdown were only visible by navigating individual entities in the Port UI.
3. **No quick access to Port from within repOptics** -- Users had to context-switch to `app.getport.io` to see catalog data. The comparison page showed side-by-side analysis but not the catalog health at a glance.

A secondary constraint emerged: Port's REST API does not support creating `entities-number-chart` widgets. The schema requires an `agentIdentifier` field that conflicts with widget properties like `blueprint` and `dataset`, producing validation errors regardless of field combinations. Only `entities-pie-chart`, `table-entities-explorer`, and `markdown` widget types can be created via API. Number chart widgets must be added through the Port UI.

## Decision

### Port Dashboard Scripts (API-created)

Create two new bash scripts following the established pattern in `scripts/port-setup.sh`:

**`scripts/port-pr-metrics-dashboard.sh`** -- Creates a `pr_metrics` dashboard page with 6 widgets:
- PR Status Distribution pie chart (open/merged/closed)
- PRs by Creator pie chart
- Filtered tables for Open, Merged, and Closed PRs
- Header markdown with guidance to add Number Chart widgets via the Port UI

**`scripts/port-home-dashboard.sh`** -- Creates a `home_overview` dashboard page with 15 widgets across 4 logical rows:
- Row 1: Services by Type, Lifecycle, and Tier pie charts
- Row 2: All 4 scorecard pies (Security, Decisions, Governance, Delivery) + repOptics Grades
- Row 3: Repos by Language pie + Active Services table + All Repos table
- Row 4: Quick Links markdown with navigation to other dashboard pages

Both scripts are idempotent (delete-then-create) and print post-run instructions for adding Number Chart widgets manually.

### Floating Catalog Widget (in-app)

Rather than embedding Port's UI in an iframe (blocked by `X-Frame-Options`), create a floating widget that fetches Port catalog data through repOptics' own API and renders a mini-dashboard inline.

**`/api/port/summary`** -- New API route that fetches `githubRepository` entities from Port (or falls back to static data), aggregates them into a `PortSummary` shape: repo count, vulnerability sums, scorecard level distributions, language breakdown, and per-repo grade/security summaries. Response is cached (`s-maxage=3600, stale-while-revalidate=86400`).

**`components/port-floating-widget.tsx`** -- Client component added to the root layout, available on every page:
- Trigger: purple "Port.io" pill button (bottom-right)
- Panel: draggable, pinnable, collapsible
- Content: stats row (repos, critical vulns, high vulns), scorecard level counts, language tags, repo list with grades, and quick links to Port pages
- Shows LIVE/STATIC badge based on whether Port API was reachable
- Refresh button to re-fetch on demand

### Landing Page Button Fixes

The outline button variant in `components/ui/button.tsx` had light-theme defaults (`bg-white hover:bg-zinc-100`) that conflicted with the dark-theme overrides applied on the landing page, causing hover states to flash rather than persist. The three navigation buttons (Generate, Comparison, Port Dashboard) were also wrapped in `<Link>`/`<a>` around `<Button>`, creating nested interactive elements that fought over hover/focus state.

Fixes:
- Changed the outline variant base to `bg-transparent hover:bg-zinc-800 hover:text-zinc-50`
- Replaced wrapped `Button` elements with direct `<Link>` and `<a>` tags styled inline, eliminating the nesting issue

## Consequences

- Port catalog health is now visible without leaving repOptics (floating widget on every page).
- PR velocity metrics have a dedicated dashboard in Port (`pr_metrics`), surfacing data that was syncing but invisible.
- The home overview dashboard (`home_overview`) provides the org-wide portfolio view described in `docs/HomePageDashboardIdeas.md`.
- Number chart widgets (counts, sums, averages) must still be added via the Port UI -- this is a known Port API limitation, not a repOptics gap. The scripts document exactly which widgets to add and with what configuration.
- The summary API introduces a server-side aggregation layer that could serve future features (scheduled reports, Slack notifications, CLI output) without re-fetching raw entities each time.
- Landing page buttons now have consistent, persistent hover states across the dark theme.

### Parked Ideas

- **Port public dashboard sharing** -- Port does not support unauthenticated dashboard views. The floating widget + summary API is the workaround. If Port adds public pages, the iframe approach becomes viable.
- **Number chart API creation** -- If Port fixes the `agentIdentifier` schema conflict, the dashboard scripts should be updated to include count/sum widgets.
- **PR lead time trends** -- The `leadTimeHours` property exists on `githubPullRequest` entities. A time-series visualization (not currently possible via Port API widget creation) would be high value.
- **Scheduled summary snapshots** -- The `/api/port/summary` response could be persisted (e.g., daily cron writing to a JSON file or DB) to show trends over time without requiring Port API availability.
