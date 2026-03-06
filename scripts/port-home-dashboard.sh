#!/usr/bin/env bash
# Port.io Home Overview Dashboard
# Creates a 4-row dashboard page with the layout from HomePageDashboardIdeas.md:
#   Row 1: High-Level Overview (service type pie, lifecycle pie, total services count)
#   Row 2: Security & Quality Metrics (critical/high vuln counts, fixes, scorecard pie)
#   Row 3: Repository Activity (recently updated repos table, language pie)
#   Row 4: Quick Actions (markdown with links)
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
        "markdown": "# Portfolio Overview\nHigh-level view of all services, repositories, and their health across the catalog.",
        "icon": "Home"
      },

      {
        "id": "total-services-count",
        "type": "entities-number-chart",
        "title": "Total Services",
        "icon": "Microservice",
        "blueprint": "service",
        "calculationBy": "entities",
        "func": "count",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "description": "All services in the catalog"
      },
      {
        "id": "total-repos-count",
        "type": "entities-number-chart",
        "title": "Total Repositories",
        "icon": "Github",
        "blueprint": "githubRepository",
        "calculationBy": "entities",
        "func": "count",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "description": "All GitHub repositories tracked"
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
        "property": "type",
        "description": "Distribution: web-app, game, tool, platform, etc."
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
        "property": "lifecycle",
        "description": "Active vs Maintained vs Deprecated vs Archived"
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
        "id": "critical-vulns-count",
        "type": "entities-number-chart",
        "title": "Critical Vulnerabilities",
        "icon": "Alert",
        "blueprint": "githubRepository",
        "calculationBy": "property",
        "property": "snykVulnCritical",
        "func": "sum",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "description": "Sum of critical Snyk vulnerabilities across all repos"
      },
      {
        "id": "high-vulns-count",
        "type": "entities-number-chart",
        "title": "High Vulnerabilities",
        "icon": "Alert",
        "blueprint": "githubRepository",
        "calculationBy": "property",
        "property": "snykVulnHigh",
        "func": "sum",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "description": "Sum of high Snyk vulnerabilities across all repos"
      },
      {
        "id": "total-vulns-count",
        "type": "entities-number-chart",
        "title": "Total Vulnerabilities",
        "icon": "DefaultBlueprint",
        "blueprint": "githubRepository",
        "calculationBy": "property",
        "property": "snykVulnTotal",
        "func": "sum",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "description": "Sum of all Snyk vulnerabilities"
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
        "property": "$scorecard.security_posture.level",
        "description": "Gold / Silver / Bronze / Basic distribution"
      },
      {
        "id": "repoptics-grade-pie",
        "type": "entities-pie-chart",
        "title": "repOptics Grades",
        "icon": "Star",
        "blueprint": "githubRepository",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "repOpticsGrade",
        "description": "A / B / C / F grade distribution"
      },

      {
        "id": "row3-header",
        "type": "markdown",
        "title": "",
        "description": "",
        "markdown": "---\n## Repository Activity\nRecently updated repos and tech stack distribution.",
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
        "property": "language",
        "description": "Programming language distribution"
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
echo "Tip: In Port UI, you can set this as your default home page"
echo "by going to Settings > Home Page and selecting 'Home Overview'."
