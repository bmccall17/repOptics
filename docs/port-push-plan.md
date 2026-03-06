# Plan: Push Port.io As Far As It Goes

## Current State (as of 2026-03-06)
- Port account on EU endpoint (`api.getport.io`)
- 15 githubRepository entities (identifier = repo name, NOT owner_repo)
- 12 service entities (10 with repo relations, 2 PartyKit with no repos)
- 4 scorecards: decision_clarity, governance_standards, delivery_maturity, security_posture
- Snyk enrichment on repo entities (vuln counts, monitored flag)
- Dashboard page: "Scorecard Overview" with 8 widgets
- Comparison page live on Render (repOptics vs Port)
- All API work via curl/REST

## Repo: bmccall17/repOptics
- Scripts: `scripts/port-setup.sh`, `scripts/port-services-setup.sh`, `scripts/scan-for-port.ts`
- Workflows: `port-ocean-sync.yml`, `port-repoptics-scan.yml`, `main.yml`, `ci.yml`
- package.json has `"type": "module"`, tsx devDep
- tsconfig excludes `scripts/`

---

## Tier 1: LOW effort / HIGH reward

### 1. Snyk -> Port [DONE]
- Snyk vuln counts as properties on each repo entity
- security_posture scorecard (Bronze/Silver/Gold based on vuln severity)
- Enrichment runs in `port-ocean-sync.yml`

### 2. Dashboard: Scorecard Heatmap [DONE]
- "Scorecard Overview" page created via API
- Widgets: markdown header, repo table, 4 scorecard pies, repOptics grades pie, language pie

### 3. Self-Service Action: Trigger repOptics Scan [IN PROGRESS]
- Workflow file exists: `port-repoptics-scan.yml` (uses port-labs/port-github-action@v1)
- Action registered in Port: `run_repoptics_scan`
- BLOCKER: Port GitHub App not installed on repo — Port can't dispatch the workflow
- FIX NEEDED: Install Port GitHub App on bmccall17/repOptics with Actions: Read & Write
- Scanner tested locally: works (repOptics = B, 74/100)

### 4. Automation: Slack notification on scorecard drop [SKIPPED]
- No Slack available

---

## Tier 2: MEDIUM effort / MEDIUM reward

### 5. PR Metrics Dashboard [NOT STARTED]
- Already have githubPullRequest entities
- Build dashboard widgets: avg PR lead time, open PR count, merge frequency
- Pure API work — just POST widget JSON to existing or new dashboard page

### 6. Service Blueprint + Relations [DONE]
- Service blueprint has properties: description, type, tier, lifecycle, techStack, url
- Relation: service -> repositories (many)
- 12 services created (including 2 PartyKit with no repos)
- Service types: platform, web-app, game, tool, static-site, ai-agent

### 7. Custom Scorecard: Security Posture (Snyk-backed) [DONE]
- Created in `port-ocean-sync.yml`
- Rules: snykMonitored=Bronze, noCritical=Silver, noHigh=Gold

---

## Tier 3: HIGH effort / NICHE reward [ALL SKIPPED]
- SonarQube, Terraform/AWS, PagerDuty, Custom Ocean Integration

---

## Cleanup / Fixes Still Pending
- [ ] Install Port GitHub App on repo (unblocks self-service action)
- [ ] Push main.yml fix (added GH_PAT token to Ocean config for PR/user sync)
- [ ] Push services setup script + main.yml changes
- [ ] Commit port-repoptics-scan.yml changes (port-labs/port-github-action@v1, port_run_id required)

## Interview Talking Points from This Work
- Built 4 scorecards measuring decision clarity, governance, delivery, security
- Integrated Snyk vulnerability data as catalog properties
- Created self-service action: "click button in Port, get repo health report"
- Modeled services with repo relations (entity graph)
- Dashboard with pie charts showing org-wide scorecard distribution
- Brought non-GitHub projects (PartyKit) into the catalog as services
- All done via REST API — demonstrates deep understanding of Port's data model
