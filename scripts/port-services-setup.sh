#!/usr/bin/env bash
# Port.io Service Blueprint Setup
# Adds properties + repos relation to service blueprint,
# creates service entities, and links repos to services.

set -uo pipefail

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
# STEP 1: Update service blueprint with properties + relations
# ============================================================
echo ""
echo "=== Step 1: Updating service blueprint ==="

curl -s -X PATCH "$PORT_BASE_URL/v1/blueprints/service" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schema": {
      "properties": {
        "description": { "type": "string", "title": "Description" },
        "type": {
          "type": "string",
          "title": "Service Type",
          "enum": ["web-app", "api", "library", "tool", "game", "static-site", "ai-agent", "platform"],
          "enumColors": {
            "web-app": "blue",
            "api": "green",
            "library": "purple",
            "tool": "orange",
            "game": "pink",
            "static-site": "turquoise",
            "ai-agent": "red",
            "platform": "yellow"
          }
        },
        "tier": {
          "type": "string",
          "title": "Tier",
          "enum": ["critical", "production", "internal", "experimental"],
          "enumColors": {
            "critical": "red",
            "production": "green",
            "internal": "blue",
            "experimental": "bronze"
          }
        },
        "lifecycle": {
          "type": "string",
          "title": "Lifecycle",
          "enum": ["active", "maintained", "deprecated", "archived"],
          "enumColors": {
            "active": "green",
            "maintained": "blue",
            "deprecated": "orange",
            "archived": "darkGray"
          }
        },
        "techStack": {
          "type": "array",
          "title": "Tech Stack",
          "items": { "type": "string" }
        },
        "url": { "type": "string", "format": "url", "title": "Live URL" }
      }
    },
    "relations": {
      "snyk_target": {
        "title": "Snyk Target",
        "target": "snykTarget",
        "required": false,
        "many": false
      },
      "repositories": {
        "title": "Repositories",
        "target": "githubRepository",
        "required": false,
        "many": true
      }
    }
  }' | jq -r '.ok // .message'

echo "Service blueprint updated."

# ============================================================
# STEP 2: Create service entities with repo relations
# ============================================================
echo ""
echo "=== Step 2: Creating service entities ==="

# Helper function
upsert_service() {
  local id="$1"
  local title="$2"
  local payload="$3"

  echo "  Creating service: $title"
  curl -s -X POST "$PORT_BASE_URL/v1/blueprints/service/entities?upsert=true&merge=true" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$payload" | jq -r '.ok // .message'
}

# --- repOptics Platform ---
upsert_service "repoptics" "repOptics" "$(jq -n '{
  identifier: "repoptics",
  title: "repOptics",
  properties: {
    description: "Repository health scanner — analyzes decision records, architecture, governance, delivery, and dependencies across GitHub repos",
    type: "platform",
    tier: "production",
    lifecycle: "active",
    techStack: ["Next.js", "TypeScript", "Tailwind", "Vitest"],
    url: "https://repoptics.onrender.com"
  },
  relations: {
    repositories: ["repOptics"]
  }
}')"

# --- TarotTALKS ---
upsert_service "tarottalks" "TarotTALKS" "$(jq -n '{
  identifier: "tarottalks",
  title: "TarotTALKS",
  properties: {
    description: "AI-powered tarot reading experience with conversational interface",
    type: "web-app",
    tier: "production",
    lifecycle: "active",
    techStack: ["TypeScript", "React"]
  },
  relations: {
    repositories: ["TarotTALKS", "TwoCups"]
  }
}')"

# --- Ghost Job Detector ---
upsert_service "ghost-job-detector" "Ghost Job Detector" "$(jq -n '{
  identifier: "ghost-job-detector",
  title: "Ghost Job Detector",
  properties: {
    description: "Tool to identify potentially fake or ghost job listings",
    type: "tool",
    tier: "experimental",
    lifecycle: "active",
    techStack: ["TypeScript"]
  },
  relations: {
    repositories: ["Ghost-Job-Detector"]
  }
}')"

# --- bmccall17.github.io ---
upsert_service "bmccall17-site" "bmccall17.github.io" "$(jq -n '{
  identifier: "bmccall17-site",
  title: "bmccall17.github.io",
  properties: {
    description: "Personal GitHub Pages site",
    type: "static-site",
    tier: "production",
    lifecycle: "maintained",
    techStack: ["HTML", "CSS", "JavaScript"],
    url: "https://bmccall17.github.io"
  },
  relations: {
    repositories: ["portfolio", "BetterThanUnicorns_siterebuild"]
  }
}')"

# --- Cori ---
upsert_service "cori" "Cori" "$(jq -n '{
  identifier: "cori",
  title: "Cori",
  properties: {
    description: "Web application project",
    type: "web-app",
    tier: "experimental",
    lifecycle: "active"
  },
  relations: {
    repositories: ["cori", "auto-claude-test"]
  }
}')"

# --- morethanone.io ---
upsert_service "morethanone" "morethanone.io" "$(jq -n '{
  identifier: "morethanone",
  title: "morethanone.io",
  properties: {
    description: "Multiplayer web game",
    type: "game",
    tier: "internal",
    lifecycle: "maintained",
    techStack: ["TypeScript"]
  },
  relations: {
    repositories: ["morethanone.io"]
  }
}')"

# --- Sounds Like Home ---
upsert_service "soundslikehome" "Sounds Like Home" "$(jq -n '{
  identifier: "soundslikehome",
  title: "Sounds Like Home",
  properties: {
    description: "Audio/music web experience",
    type: "web-app",
    tier: "internal",
    lifecycle: "maintained",
    techStack: ["JavaScript"]
  },
  relations: {
    repositories: ["soundslikehome"]
  }
}')"

# --- AVL1000 ---
upsert_service "avl1000" "AVL1000" "$(jq -n '{
  identifier: "avl1000",
  title: "AVL1000",
  properties: {
    description: "Audio visual project",
    type: "web-app",
    tier: "internal",
    lifecycle: "maintained",
    techStack: ["JavaScript"]
  },
  relations: {
    repositories: ["AVL1000"]
  }
}')"

# --- Games ---
upsert_service "rampart-remake" "Rampart Remake" "$(jq -n '{
  identifier: "rampart-remake",
  title: "Rampart Remake",
  properties: {
    description: "Remake of the classic Rampart arcade game",
    type: "game",
    tier: "experimental",
    lifecycle: "active",
    techStack: ["TypeScript"]
  },
  relations: {
    repositories: ["rampart-remake"]
  }
}')"

# --- Legacy/Archive ---
upsert_service "archive" "Archive" "$(jq -n '{
  identifier: "archive",
  title: "Archive",
  properties: {
    description: "Archived and legacy projects",
    type: "static-site",
    tier: "internal",
    lifecycle: "archived"
  },
  relations: {
    repositories: ["JMD", "summonersacademy.com", "figmaflexboxdesigndemo"]
  }
}')"

# ============================================================
# STEP 3: PartyKit projects (no GitHub repos — services only)
# Add your PartyKit projects here with URLs
# ============================================================
echo ""
echo "=== Step 3: Creating PartyKit services (no repos) ==="

upsert_service "partykit-ids" "IDS" "$(jq -n '{
  identifier: "partykit-ids",
  title: "IDS",
  properties: {
    description: "Multiplayer party game hosted on PartyKit",
    type: "game",
    tier: "experimental",
    lifecycle: "active",
    techStack: ["TypeScript", "PartyKit"],
    url: "https://ids.bmccall17.partykit.dev"
  },
  relations: {}
}')"

upsert_service "partykit-forbidden-desert-xr" "Forbidden Desert XR" "$(jq -n '{
  identifier: "partykit-forbidden-desert-xr",
  title: "Forbidden Desert XR",
  properties: {
    description: "XR adaptation of the Forbidden Desert board game, multiplayer via PartyKit",
    type: "game",
    tier: "experimental",
    lifecycle: "active",
    techStack: ["TypeScript", "PartyKit", "WebXR"],
    url: "https://forbidden-desert-xr.bmccall17.partykit.dev"
  },
  relations: {}
}')"

echo ""
echo "=== Done! ==="
echo "Check Port: Services page should now show all services with linked repos."
