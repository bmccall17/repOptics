#!/usr/bin/env bash
# Port.io PR Metrics Dashboard
# Creates a dashboard page with PR analytics widgets
# Uses githubPullRequest blueprint from the github-ocean integration
# Requires: PORT_CLIENT_ID, PORT_CLIENT_SECRET env vars

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
fi

# ============================================================
# Discover actual blueprint properties (for debugging)
# ============================================================
echo ""
echo "=== githubPullRequest blueprint properties ==="
curl -s "$PORT_BASE_URL/v1/blueprints/githubPullRequest" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.blueprint.schema.properties // {} | keys[]' 2>/dev/null || echo "(blueprint not found yet)"

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
        "markdown": "# Pull Request Metrics\nTrack PR velocity, open counts, and merge patterns across all repositories.\n\nData sourced from the **github-ocean** integration.",
        "icon": "Git"
      },
      {
        "id": "open-pr-count",
        "type": "entities-number-chart",
        "title": "Open PRs",
        "icon": "GitPullRequest",
        "blueprint": "githubPullRequest",
        "calculationBy": "entities",
        "func": "count",
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "open"
            }
          ]
        },
        "description": "Total open pull requests across all repos"
      },
      {
        "id": "merged-pr-count",
        "type": "entities-number-chart",
        "title": "Merged PRs (Total)",
        "icon": "GitMerge",
        "blueprint": "githubPullRequest",
        "calculationBy": "entities",
        "func": "count",
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "merged"
            }
          ]
        },
        "description": "Total merged pull requests"
      },
      {
        "id": "closed-pr-count",
        "type": "entities-number-chart",
        "title": "Closed PRs (Unmerged)",
        "icon": "Close",
        "blueprint": "githubPullRequest",
        "calculationBy": "entities",
        "func": "count",
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "=",
              "value": "closed"
            }
          ]
        },
        "description": "Pull requests closed without merging"
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
        "id": "recent-merged-table",
        "type": "table-entities-explorer",
        "title": "Recently Merged PRs",
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
      }
    ]
  }' | jq .

echo ""
echo "=== PR Metrics Dashboard created! ==="
echo "View it in your Port portal under the 'PR Metrics' page."
