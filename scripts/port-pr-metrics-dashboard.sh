#!/usr/bin/env bash
# Port.io PR Metrics Dashboard
# Creates a dashboard page with PR analytics widgets
# Uses githubPullRequest blueprint from the github-ocean integration
# Requires: PORT_CLIENT_ID, PORT_CLIENT_SECRET env vars
#
# NOTE: Number chart widgets (entities-number-chart) cannot be created via
# the Port REST API — they require an agentIdentifier field that conflicts
# with the widget schema. After running this script, you can add number
# widgets manually in the Port UI (+ Widget > Number Chart).

set -euo pipefail

PORT_BASE_URL="${PORT_BASE_URL:-https://api.getport.io}"

if [ -z "${PORT_CLIENT_ID:-}" ] || [ -z "${PORT_CLIENT_SECRET:-}" ]; then
  echo "ERROR: PORT_CLIENT_ID and PORT_CLIENT_SECRET must be set"
  exit 1
fi

echo "=== Authenticating with Port ==="
TOKEN=$(curl -s -X POST "$PORT_BASE_URL/v1/auth/access_token" \
  -H "Content-Type: application/json" \
  -d "{\"clientId\":\"$PORT_CLIENT_ID\",\"clientSecret\":\"$PORT_CLIENT_SECRET\"}" \
  | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get Port access token"
  exit 1
fi
echo "Authenticated."

# ============================================================
# PRE-CHECK: Verify githubPullRequest blueprint exists
# ============================================================
echo ""
echo "=== Checking githubPullRequest blueprint ==="

BP_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  "$PORT_BASE_URL/v1/blueprints/githubPullRequest" \
  -H "Authorization: Bearer $TOKEN")

if [ "$BP_CHECK" != "200" ]; then
  echo "WARNING: githubPullRequest blueprint not found (HTTP $BP_CHECK)."
  echo "Make sure the github-ocean integration has run at least once (main.yml workflow)."
  echo "Continuing anyway — dashboard will populate once PR data syncs."
else
  echo "Blueprint found. Properties:"
  curl -s "$PORT_BASE_URL/v1/blueprints/githubPullRequest" \
    -H "Authorization: Bearer $TOKEN" \
    | jq -r '.blueprint.schema.properties // {} | keys[]' 2>/dev/null
fi

# ============================================================
# Create PR Metrics Dashboard Page
# ============================================================
echo ""
echo "=== Creating PR Metrics Dashboard ==="

# Delete existing page if present (idempotent)
curl -s -X DELETE "$PORT_BASE_URL/v1/pages/pr_metrics" \
  -H "Authorization: Bearer $TOKEN" > /dev/null 2>&1 || true

curl -s -X POST "$PORT_BASE_URL/v1/pages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "pr_metrics",
    "title": "PR Metrics",
    "icon": "Git",
    "type": "dashboard",
    "widgets": [
      {
        "id": "pr-header",
        "type": "markdown",
        "title": "Pull Request Analytics",
        "description": "",
        "markdown": "# Pull Request Metrics\nTrack PR velocity, open counts, and merge patterns across all repositories.\n\nData sourced from the **github-ocean** integration.\n\n> **Tip:** Add Number Chart widgets via the Port UI for open/merged/closed PR counts.",
        "icon": "Git"
      },
      {
        "id": "pr-status-pie",
        "type": "entities-pie-chart",
        "title": "PR Status Distribution",
        "icon": "PieChart",
        "blueprint": "githubPullRequest",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "status"
      },
      {
        "id": "pr-by-creator-pie",
        "type": "entities-pie-chart",
        "title": "PRs by Creator",
        "icon": "Team",
        "blueprint": "githubPullRequest",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "creator"
      },
      {
        "id": "open-prs-table",
        "type": "table-entities-explorer",
        "title": "Open Pull Requests",
        "icon": "GitPullRequest",
        "blueprint": "githubPullRequest",
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "open"
            }
          ]
        }
      },
      {
        "id": "merged-prs-table",
        "type": "table-entities-explorer",
        "title": "Merged Pull Requests",
        "icon": "GitMerge",
        "blueprint": "githubPullRequest",
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "merged"
            }
          ]
        }
      },
      {
        "id": "closed-prs-table",
        "type": "table-entities-explorer",
        "title": "Closed PRs (Unmerged)",
        "icon": "Close",
        "blueprint": "githubPullRequest",
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "closed"
            }
          ]
        }
      }
    ]
  }' | jq .

echo ""
echo "=== PR Metrics Dashboard created! ==="
echo "View it in your Port portal under the 'PR Metrics' page."
echo ""
echo "Optional: In the Port UI, add Number Chart widgets for:"
echo "  - Open PR count (blueprint: githubPullRequest, filter: status=open)"
echo "  - Merged PR count (blueprint: githubPullRequest, filter: status=merged)"
echo "  - Avg Lead Time (blueprint: githubPullRequest, property: leadTimeHours, func: average)"
