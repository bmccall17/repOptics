#!/usr/bin/env bash
# Port.io Home Overview Dashboard
# Creates a 4-row dashboard page with the layout from HomePageDashboardIdeas.md:
#   Row 1: High-Level Overview (service type pie, lifecycle pie)
#   Row 2: Security & Quality Metrics (scorecard pies, repOptics grades, vuln table)
#   Row 3: Repository Activity (repos table, language pie)
#   Row 4: Quick Actions (markdown with links)
# Requires: PORT_CLIENT_ID, PORT_CLIENT_SECRET env vars
#
# NOTE: Number chart widgets (entities-number-chart) cannot be created via
# the Port REST API. After running this script, you can add number widgets
# manually in the Port UI (+ Widget > Number Chart).

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
# Create Home Overview Dashboard Page
# ============================================================
echo ""
echo "=== Creating Home Overview Dashboard ==="

# Delete existing page if present (idempotent)
curl -s -X DELETE "$PORT_BASE_URL/v1/pages/home_overview" \
  -H "Authorization: Bearer $TOKEN" > /dev/null 2>&1 || true

curl -s -X POST "$PORT_BASE_URL/v1/pages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "home_overview",
    "title": "Home Overview",
    "icon": "Home",
    "type": "dashboard",
    "widgets": [

      {
        "id": "row1-header",
        "type": "markdown",
        "title": "",
        "description": "",
        "markdown": "# Portfolio Overview\nHigh-level view of all services, repositories, and their health across the catalog.\n\n> **Tip:** Add Number Chart widgets via the Port UI for total service/repo counts and vulnerability sums.",
        "icon": "Home"
      },

      {
        "id": "services-by-type-pie",
        "type": "entities-pie-chart",
        "title": "Services by Type",
        "icon": "Blueprint",
        "blueprint": "service",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "type"
      },
      {
        "id": "services-by-lifecycle-pie",
        "type": "entities-pie-chart",
        "title": "Services by Lifecycle",
        "icon": "Lifecycle",
        "blueprint": "service",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "lifecycle"
      },
      {
        "id": "services-by-tier-pie",
        "type": "entities-pie-chart",
        "title": "Services by Tier",
        "icon": "Star",
        "blueprint": "service",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "tier"
      },

      {
        "id": "row2-header",
        "type": "markdown",
        "title": "",
        "description": "",
        "markdown": "---\n## Security & Quality Metrics\nSnyk vulnerability data and scorecard health across the catalog.",
        "icon": "Alert"
      },

      {
        "id": "security-scorecard-pie",
        "type": "entities-pie-chart",
        "title": "Security Posture Levels",
        "icon": "Lock",
        "blueprint": "githubRepository",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "$scorecard.security_posture.level"
      },
      {
        "id": "decision-clarity-pie",
        "type": "entities-pie-chart",
        "title": "Decision Clarity Levels",
        "icon": "Star",
        "blueprint": "githubRepository",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "$scorecard.decision_clarity.level"
      },
      {
        "id": "governance-pie",
        "type": "entities-pie-chart",
        "title": "Governance Standards Levels",
        "icon": "Lock",
        "blueprint": "githubRepository",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "$scorecard.governance_standards.level"
      },
      {
        "id": "delivery-maturity-pie",
        "type": "entities-pie-chart",
        "title": "Delivery Maturity Levels",
        "icon": "DeployedAt",
        "blueprint": "githubRepository",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "$scorecard.delivery_maturity.level"
      },
      {
        "id": "repoptics-grade-pie",
        "type": "entities-pie-chart",
        "title": "repOptics Grades",
        "icon": "Microservice",
        "blueprint": "githubRepository",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "repOpticsGrade"
      },

      {
        "id": "row3-header",
        "type": "markdown",
        "title": "",
        "description": "",
        "markdown": "---\n## Repository Activity\nAll repositories and tech stack distribution.",
        "icon": "Github"
      },

      {
        "id": "repos-by-language-pie",
        "type": "entities-pie-chart",
        "title": "Repos by Language",
        "icon": "Code",
        "blueprint": "githubRepository",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "language"
      },
      {
        "id": "active-services-table",
        "type": "table-entities-explorer",
        "title": "Active Services",
        "icon": "Microservice",
        "blueprint": "service",
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "property": "lifecycle",
              "operator": "=",
              "value": "active"
            }
          ]
        }
      },
      {
        "id": "all-repos-table",
        "type": "table-entities-explorer",
        "title": "All Repositories",
        "icon": "Github",
        "blueprint": "githubRepository",
        "dataset": {
          "combinator": "and",
          "rules": []
        }
      },

      {
        "id": "row4-links",
        "type": "markdown",
        "title": "",
        "description": "",
        "markdown": "---\n## Quick Links\n\n| Dashboard | Description |\n|-----------|-------------|\n| [Scorecard Overview](/scorecard_overview) | Decision clarity, governance, delivery, security scorecards |\n| [PR Metrics](/pr_metrics) | Pull request velocity, open counts, merge patterns |\n\n---\n*Data sourced from GitHub, Snyk, and repOptics. Synced hourly via github-ocean.*",
        "icon": "Link"
      }
    ]
  }' | jq .

echo ""
echo "=== Home Overview Dashboard created! ==="
echo "View it in your Port portal under the 'Home Overview' page."
echo ""
echo "Optional: In the Port UI, add Number Chart widgets for:"
echo "  - Total Services (blueprint: service, count)"
echo "  - Total Repositories (blueprint: githubRepository, count)"
echo "  - Critical Vulnerabilities (blueprint: githubRepository, property: snykVulnCritical, sum)"
echo "  - High Vulnerabilities (blueprint: githubRepository, property: snykVulnHigh, sum)"
echo "  - Total Vulnerabilities (blueprint: githubRepository, property: snykVulnTotal, sum)"
echo ""
echo "Tip: In Port UI, you can set this as your default home page"
echo "by going to Settings > Home Page and selecting 'Home Overview'."
