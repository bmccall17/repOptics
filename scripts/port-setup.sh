#!/usr/bin/env bash
# Port.io Setup Script
# Creates: blueprint properties, self-service action, dashboard page
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
echo "Authenticated successfully."

# ============================================================
# STEP 1: Add repOptics properties to githubRepository blueprint
# ============================================================
echo ""
echo "=== Step 1: Adding repOptics properties to githubRepository blueprint ==="

curl -s -X PATCH "$PORT_BASE_URL/v1/blueprints/githubRepository" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schema": {
      "properties": {
        "url": { "type": "string", "format": "url", "title": "Repository URL" },
        "language": { "type": "string", "title": "Primary Language" },
        "defaultBranch": { "type": "string", "title": "Default Branch" },
        "readme": { "type": "boolean", "title": "Has README" },
        "openIssues": { "type": "number", "title": "Open Issues" },
        "stars": { "type": "number", "title": "Stars" },
        "description": { "type": "string", "title": "Description" },
        "lastPush": { "type": "string", "format": "date-time", "title": "Last Push" },
        "snykVulnCritical": { "type": "number", "title": "Snyk Critical Vulns" },
        "snykVulnHigh": { "type": "number", "title": "Snyk High Vulns" },
        "snykVulnMedium": { "type": "number", "title": "Snyk Medium Vulns" },
        "snykVulnLow": { "type": "number", "title": "Snyk Low Vulns" },
        "snykVulnTotal": { "type": "number", "title": "Snyk Total Vulns" },
        "snykLastTested": { "type": "string", "format": "date-time", "title": "Snyk Last Scan" },
        "snykMonitored": { "type": "boolean", "title": "Snyk Monitored" },
        "repOpticsGrade": { "type": "string", "title": "repOptics Grade", "enum": ["A", "B", "C", "F"], "enumColors": { "A": "green", "B": "blue", "C": "orange", "F": "red" } },
        "repOpticsScore": { "type": "number", "title": "repOptics Score" },
        "repOpticsDecisions": { "type": "number", "title": "Decisions Score" },
        "repOpticsArchitecture": { "type": "number", "title": "Architecture Score" },
        "repOpticsGovernance": { "type": "number", "title": "Governance Score" },
        "repOpticsDelivery": { "type": "number", "title": "Delivery Score" },
        "repOpticsDependencies": { "type": "number", "title": "Dependencies Score" },
        "repOpticsScannedAt": { "type": "string", "format": "date-time", "title": "Last repOptics Scan" }
      }
    }
  }' | jq -r '.ok // .message'

echo "Blueprint properties updated."

# ============================================================
# STEP 2: Create Self-Service Action — Trigger repOptics Scan
# ============================================================
echo ""
echo "=== Step 2: Creating self-service action ==="

# First, delete existing action if it exists (idempotent)
curl -s -X DELETE "$PORT_BASE_URL/v1/actions/run_repoptics_scan" \
  -H "Authorization: Bearer $TOKEN" > /dev/null 2>&1 || true

curl -s -X POST "$PORT_BASE_URL/v1/actions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "run_repoptics_scan",
    "title": "Run repOptics Scan",
    "icon": "Microservice",
    "description": "Trigger a repOptics repository health scan and update scores in the catalog",
    "trigger": {
      "type": "self-service",
      "blueprintIdentifier": "githubRepository",
      "operation": "DAY-2",
      "userInputs": {
        "properties": {},
        "required": []
      }
    },
    "invocationMethod": {
      "type": "GITHUB",
      "org": "bmccall17",
      "repo": "repOptics",
      "workflow": "port-repoptics-scan.yml",
      "workflowInputs": {
        "repo": "{{ .entity.title }}",
        "owner": "bmccall17",
        "port_run_id": "{{ .run.id }}"
      },
      "reportWorkflowStatus": true
    }
  }' | jq .

echo "Self-service action created."

# ============================================================
# STEP 3: Create Dashboard Page — Scorecard Overview
# ============================================================
echo ""
echo "=== Step 3: Creating dashboard page ==="

# Delete existing page if present (idempotent)
curl -s -X DELETE "$PORT_BASE_URL/v1/pages/scorecard_overview" \
  -H "Authorization: Bearer $TOKEN" > /dev/null 2>&1 || true

curl -s -X POST "$PORT_BASE_URL/v1/pages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "scorecard_overview",
    "title": "Scorecard Overview",
    "icon": "Dashboard",
    "type": "dashboard",
    "widgets": [
      {
        "id": "header-text",
        "type": "markdown",
        "title": "Repository Health Dashboard",
        "description": "",
        "markdown": "# Repository Catalog Health\nA unified view of all repositories across **Decision Clarity**, **Governance Standards**, **Delivery Maturity**, and **Security Posture** scorecards.\n\nRepos are enriched with data from GitHub, Snyk, and repOptics.",
        "icon": "BlankPage"
      },
      {
        "id": "repos-table",
        "type": "table-entities-explorer",
        "blueprint": "githubRepository",
        "dataset": {
          "combinator": "and",
          "rules": []
        }
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
        "id": "security-pie",
        "type": "entities-pie-chart",
        "title": "Security Posture Levels",
        "icon": "Alert",
        "blueprint": "githubRepository",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "$scorecard.security_posture.level"
      },
      {
        "id": "repoptics-grades-pie",
        "type": "entities-pie-chart",
        "title": "repOptics Grades Distribution",
        "icon": "Microservice",
        "blueprint": "githubRepository",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "repOpticsGrade"
      },
      {
        "id": "language-pie",
        "type": "entities-pie-chart",
        "title": "Languages",
        "icon": "Code",
        "blueprint": "githubRepository",
        "dataset": {
          "combinator": "and",
          "rules": []
        },
        "property": "language"
      }
    ]
  }' | jq .

echo "Dashboard page created."

echo ""
echo "=== All done! ==="
echo "1. Blueprint: githubRepository now has repOptics properties"
echo "2. Self-service action: 'Run repOptics Scan' available on repo entities"
echo "3. Dashboard: 'Scorecard Overview' page created with widgets"
echo ""
echo "Next steps:"
echo "  - Push the workflow file to GitHub"
echo "  - Test the self-service action from a repo entity in Port"
echo "  - View the dashboard at your Port portal"
