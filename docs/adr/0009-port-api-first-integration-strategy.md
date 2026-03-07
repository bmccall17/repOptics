# 9. Port.io API-First Integration Strategy

Date: 2026-03-06

## Status

Accepted

## Context

Over two days of intensive Port.io integration work (March 5-6, 2026), a clear pattern emerged: every abstraction layer Port provides on top of its REST API introduced friction, while the API itself was consistently reliable. This ADR captures the architectural decision about how repOptics should interact with Port going forward, grounded in specific failure modes encountered.

### The abstraction layers that failed

**Ocean-Sail GitHub Action** -- The recommended path for syncing GitHub data into Port. Failed immediately: the action pulls a Docker image from `ghcr.io/port-labs/port-ocean-github` which returned `denied` with no registry authentication step. The action doesn't handle ghcr auth. Dead end on first run.

**Port UI Wizard** -- Multi-step integration setup with a "Connect" button. All prerequisite steps showed green checkmarks. The Connect button stayed grayed out. No validation feedback, no error message, no indication of what was missing.

**Secret naming conventions** -- Port documentation uses at least four different naming patterns for the same two credentials: `port_client_id` (action inputs), `OCEAN__PORT__CLIENT_ID` (internal env vars), the UI wizard showing internal env var names as GitHub secret names, and `clientId` (API body). No single source of truth about which names to use where.

**GitHub App auto-provisioning** -- Installing Port's GitHub App to enable self-service action dispatch silently created a second integration ("Exporter") that used a different entity identifier format (`repoName`) than the existing Ocean sync (`owner/repoName`). This tripled repo entities with no warning. The platform assumes you want every integration it can spin up.

**Identifier contract mismatch** -- Three data sources were creating `githubRepository` entities with three different identifier formats: the old exporter (`repoName`), the Ocean integration (`owner/repoName`), and the custom sync workflow (initially `owner_repoName`). No enforcement, no validation, no conflict detection. The fix required suspending deprecated integrations, deleting duplicate entities, and auditing all identifier constructions across three workflow files.

**Region assignment** -- Port credentials only work against the assigned regional endpoint (`api.getport.io` for EU, `api.us.getport.io` for US). There was no region selection during signup, no confirmation of assignment, no label in the dashboard. Discovery was by trial and error after authentication failures on the wrong endpoint.

### What worked reliably

**Port REST API** -- Every direct API call (entity upsert, blueprint patch, scorecard creation, dashboard page creation, action registration) worked on the first attempt. The API is consistent, well-documented, and predictable. Creating two scorecards via `curl` took 4 seconds total; the UI form had consumed 15+ minutes without success.

**Port AI assistant** -- Accurate, specific answers about sync failures, missing blueprints, action configuration, and dashboard widget options. The AI understood the catalog state and could build views conversationally. If Port leaned into this as the primary onboarding path, the multi-hour integration pain could collapse to minutes.

## Decision

### API-first for all Port interactions

All Port integration in repOptics uses direct REST API calls. No Ocean-Sail action, no managed Docker images, no UI wizard configurations stored outside the repo.

Specifically:
- **Entity sync**: Custom GitHub Actions workflow (`port-ocean-sync.yml`) that fetches repos from the GitHub API and upserts entities via `POST /v1/blueprints/{blueprint}/entities?upsert=true&merge=true`
- **Snyk enrichment**: Same workflow queries the Snyk API and merges vulnerability data onto repo entities
- **Scorecards**: Created via `POST /v1/blueprints/{blueprint}/scorecards` in the sync workflow
- **Dashboards**: Created via `POST /v1/pages` in setup scripts (`scripts/port-setup.sh`, `scripts/port-pr-metrics-dashboard.sh`, `scripts/port-home-dashboard.sh`)
- **Service entities**: Created via upsert in `scripts/port-services-setup.sh`
- **Self-service actions**: Registered via `POST /v1/actions` in setup scripts; execution uses `port-labs/port-github-action@v1` (a thin wrapper that works reliably, unlike Ocean-Sail)
- **In-app data**: Fetched via `lib/port.ts` TypeScript client using `fetch()` against the REST API

### Identifier contract: `owner/repo`

All entity identifiers for `githubRepository` use the `owner/repo` format (e.g., `bmccall17/repOptics`). This matches the GitHub API's `full_name` field and the Ocean integration's default. All custom workflows enforce this format. No short-name identifiers.

### Scripts as infrastructure-as-code

Port configuration lives in version-controlled bash scripts, not in Port's UI. The scripts are idempotent (delete-then-create for dashboards, upsert for entities). Running `port-setup.sh` + `port-services-setup.sh` + `port-pr-metrics-dashboard.sh` + `port-home-dashboard.sh` reproduces the entire Port catalog configuration from scratch.

### Use the managed Ocean integration only for data Port owns

The `main.yml` workflow still uses `port-labs/ocean-sail@v1` for the `github-ocean` exporter, which syncs pull requests, users, and other GitHub-native entities that Port's Ocean integration handles well. This is the one case where the abstraction adds value: Port maintains the mapping between GitHub's API schema and their blueprint schema, and keeping that mapping current isn't worth owning.

Rule of thumb: **if repOptics owns the data transformation logic, use the REST API directly. If Port owns the mapping (GitHub PR schema -> Port entity schema), use the managed integration.**

## Consequences

- All Port configuration is reproducible from the repo. No "click around in the UI to set things up" steps except for Number Chart widgets (Port API limitation).
- The sync workflow is transparent: every property mapping, every identifier construction, every upsert is visible in the YAML. When something breaks, `git blame` shows what changed.
- The tradeoff is maintenance: if Port changes their API, the custom workflows break and we fix them ourselves. The managed Ocean integration absorbs those changes automatically. This is acceptable for the current scale (15 repos, 12 services).
- Onboarding a new developer to the Port integration means reading 4 bash scripts and 2 workflow files, not navigating Port's UI wizard.
- The self-service action (scan a repo from Port) works end-to-end: button click in Port -> GitHub Actions workflow dispatch -> repOptics scanner -> entity update -> status callback. This loop is the demo. The three hours of identifier debugging to get there is the tax.

### Lessons for the TSM role

These integration pain points are not edge cases — they are the first-run experience for every new Port user:

1. **When a vendor's "easy path" is broken, go straight to the API.** The API is Port's strongest product surface. The layers above it (Ocean-Sail, UI wizards, auto-provisioned integrations) each add friction instead of removing it.
2. **Identifier contracts between integrations are implicit, not enforced.** If you run a custom sync alongside a managed integration, you are responsible for making sure they agree on naming. Nobody checks.
3. **Installing one integration can silently create side effects in another.** The GitHub App provisioned a deprecated Exporter that conflicted with the Ocean sync. The integrations don't just get in the way — they get in each other's way.
4. **The Port AI is the redeeming onboarding experience.** It understood the catalog state, knew what scorecards existed, and helped build views conversationally. If Port leaned into "just talk to the AI and it'll set things up" as the primary onboarding path, the multi-day integration pain could collapse to an afternoon.
5. **Developer experience is a product decision.** Port's core concepts (software catalog, scorecards, self-service actions, entity relations) are genuinely powerful. The on-ramp undermines that. Conflicting secret names, a wizard with no validation feedback, a Docker image that can't be pulled without undocumented prerequisites, and silent region assignment are all fixable. The product is strong; the first 5 minutes need to feel like magic instead of a puzzle with missing pieces.
