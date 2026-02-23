Feature Proposal: Persistent Intent Layer To bridge the logic gap between the Generator and Scanner, we must implement a shared "Intent Schema" that acts as the single source of truth for a repository's purpose. Currently, the Generator gathers critical context (e.g., "Prototype vs. Production," "Experimental vs. Long-term") which is discarded immediately after scaffolding. We need to introduce a persistence mechanism—likely backed by a centralized database—to store this Repo Profile.

The Generator becomes the writer: It initializes the Repo Profile in the database at the moment of creation.

The Scanner becomes the reader: Before analyzing code, it queries the database for the Repo Profile and dynamically calibrates its heuristics (e.g., suppressing "Governance" penalties for a repository tagged as mode: prototype). This transforms repOptics from a stateless tool into a stateful platform that evaluates code based on its intended constraints rather than a rigid, one-size-fits-all standard.

---
### my original prompt: `it strikes me that. Every repo that goes into the system whether it's starting or reading an existing repo. should have a collection of settings and those settings help determine the scanners focus and severity with which it analyzes the repo`
---

What this proposal is *really* asking for is: **make repOptics “context-aware” across time** by persisting the Generator’s intent decisions so the Scanner can evaluate a repo *relative to what it’s trying to be*, not a universal standard.

Today you have a “one-shot” pipeline:

1. **Generator** collects intent signals (prototype vs production, experimental vs long-term, etc.)
2. scaffolds code
3. **intent evaporates**
4. **Scanner** later grades the repo with static heuristics → false positives, wrong penalties, noisy optics

The proposal introduces a durable **Repo Profile** (aka “Intent Schema”) as a *single source of truth* that both tools share. 

---

## The core product requirement

### Persistent Intent Layer

* A structured schema describing “what this repo is for”
* Stored durably (central DB)
* Accessible to both Generator and Scanner through a stable API
* Used by Scanner to **calibrate** its checks (weights, thresholds, suppressions, required rules)

This is a classic “decision record” idea applied to repo intent: capture the *reasoning* once, then keep using it as the system evolves. 

---

## Architecture thinking

### Key components

**1) Intent Service (new)**

* Owns the Repo Profile data model + validation
* Provides CRUD + versioning + access control
* Emits events when intent changes (optional but powerful)

**2) Generator (writer)**

* On repo creation:

  * collects intent answers
  * creates a Repo Profile in Intent Service
  * stores a durable linkage: `repo_id` (or provider + org + repo slug)

**3) Scanner (reader)**

* On scan start:

  * fetches Repo Profile (or uses fallback if missing)
  * loads “policy pack” based on profile
  * runs checks with tuned configuration

**4) Policy/Heuristics engine**

* A ruleset that can be parameterized by profile
* Think: “controls” (rules) + “modes” (profiles) + “overrides” (per-repo exceptions)

---

## Data model: Repo Profile (Intent Schema)

A practical MVP shape (you can expand later):

* **Identity**

  * `repo_id` (internal)
  * `provider` (github/gitlab/etc), `org`, `name`
* **Mode**

  * `mode`: `prototype | production | library | internal_tool | template | learning | archival`
* **Horizon**

  * `lifecycle`: `experiment | short_term | long_term`
* **Risk posture**

  * `risk_level`: `low | medium | high`
* **Governance expectation**

  * `governance_level`: `none | light | standard | strict`
* **Compliance / constraints**

  * e.g., `pii: true/false`, `regulated: none | hipaa | sox | ...`
* **Owners**

  * `team`, `tech_lead`, `slack_channel`, etc.
* **Overrides**

  * allow explicit “Scanner exceptions” with justification
* **Versioning**

  * `version`, `created_at`, `updated_at`, `updated_by`
  * optional history log for audits (“why did we change this?”)

---

## Scanner calibration: how it should work

Instead of “pass/fail” universal checks, treat checks as:

* **Required** (always on): security basics, secrets scanning, license issues
* **Conditional** (depends on profile): governance, test coverage, doc requirements, CI rigor, release tagging, dependency policies
* **Weighted** (score impact varies): prototypes get less penalty for missing ADRs, production gets heavier penalty

Example calibration:

* If `mode=prototype`:

  * suppress “missing governance docs”
  * lower test coverage expectations
  * keep *security* checks on
* If `mode=production` + `regulated=true`:

  * enforce strict dependency rules
  * require SBOM, CI, reviews, observability stubs, etc.

---

## User stories (who, what, why)

### Primary actors

1. **Repo creator** (dev / PM / lead) using Generator
2. **Scanner** system user
3. **Org admin / platform owner** who wants policy consistency
4. **Auditor / security** (optional) who needs traceability

### Story set (MVP)

**Generator**

* As a repo creator, I want to answer a few intent questions during scaffolding so the repo is evaluated fairly later.
* As a repo creator, I want to edit intent later when the repo “graduates” from prototype → production.

**Intent Service**

* As an org admin, I want defaults per org/team so people aren’t forced to hand-curate every repo.
* As an org admin, I want a history of changes to intent (who changed what, when, why).

**Scanner**

* As the scanner, I want to fetch repo intent before scanning so I can choose the correct rule configuration.
* As a dev, I want scan results to explain “this rule was suppressed because mode=prototype” so it feels trustworthy.

### “Graduation” stories (very important)

* As a team, we want to change `mode` from prototype → production and immediately see stricter expectations kick in.
* As a team, we want a checklist suggesting what to add when graduating (CI, ADRs, observability, docs).

(That “slice to MVP then expand” approach is straight out of story mapping practice—build the backbone first, then deepen. )

---

## A simple user story map (backbone)

**Activity: Create and maintain a repo that gets evaluated appropriately**

1. Create repo
2. Capture intent
3. Store intent
4. Scan repo using intent
5. View results with rationale
6. Update intent (graduation/change)
7. Re-scan with new posture

Now vertical slices:

**Release 1 (Minimum Viable Intent)**

* Generator writes profile (mode + horizon + governance)
* Scanner reads profile and toggles 3–5 major checks
* UI/Output shows “intent-aware” rationale

**Release 2 (Governance maturity)**

* Edit intent + version history
* Org defaults / templates
* Graduation guidance

**Release 3 (Policy platform)**

* Policy packs by org/team
* Event-driven rescans
* Fine-grained overrides + approvals

---

## Design/engineering decisions you’ll want to make early

* **Identity strategy:** how you uniquely identify repos across providers and renames
* **Fallback behavior:** if no Repo Profile exists, does Scanner assume “prototype” or “unknown → safe defaults”?
* **AuthZ model:** who can read vs write intent? repo admins? org admins?
* **Schema evolution:** adding new intent fields without breaking old repos
* **Explainability:** Scanner must show *why* it applied a rule set (trust builder)

---

## The “hidden” success criteria

If this ships and works, you should see:

* fewer “Scanner is wrong/noisy” complaints
* higher adoption of Scanner because results feel fair
* a clean path for teams to “graduate” repos and improve quality over time
* more consistent governance without forcing prototypes to cosplay as production

---

If you want, I can turn this into:

* a tight PRD + API sketch (endpoints + example payloads), and/or
* a story map formatted as a backlog with MVP slice + next slices.
