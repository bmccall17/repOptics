# repOptics: Documentation Alignment & Product Evolution Plan

## Executive Summary

**Current State**: repOptics is a functional MVP (v0.2.0) - a developer hygiene analytics platform that scans GitHub repos and scores them across 5 categories. It includes a Project Generator Wizard for scaffolding new projects.

**Key Insight from Max**: The real product isn't "starter kit templates" - it's a **decision-clarity system** that produces knowns, unknowns, and next actions.

**This Plan**:
- Phase 0: Fix outdated/inconsistent documentation (immediate)
- Phases 1-3: Evolve toward Max's vision of a decision-capture system

---

## PHASE 0: Documentation Alignment (Immediate)

### 0.1 Replace Generic README.md
**File**: `/README.md`

**Problem**: Currently contains default Next.js boilerplate - says nothing about repOptics.

**Action**: Replace with actual project description including:
- What repOptics does (scan repos, 5-category scoring, recommendations)
- Features (Scanner, Generator Wizard, Decision Timeline)
- Tech stack (Next.js 16, React 19, TypeScript, Octokit)
- Quick start instructions
- Links to docs/ARCHITECTURE.md and CONTRIBUTING.md

---

### 0.2 Consolidate Duplicate Workflow Docs
**Files**:
- DELETE: `docs/devnotes/gettingstartedworkflow_gitcopilot.md`
- RENAME: `docs/devnotes/gettingstartedworkflow_openai.md` → `docs/devnotes/architecture_decision_tree.md`

**Problem**: Two identical 219-line files with misleading names (they're not tool-specific).

**Action**: Keep one file with accurate name, add header noting it's early ideation content.

---

### 0.3 Update spec.md with v0.2.0 Features
**File**: `docs/spec.md`

**Problem**: Missing current features: Generator Wizard, Decision Timeline, Dependency Audit, AGENTS.md detection.

**Action**: Add sections for:
- Project Generator Wizard (5-step workflow, ZIP download)
- Decision Timeline (Mermaid visualization)
- Enhanced scoring (Dependencies category, AGENTS.md, GOVERNANCE.md)
- Updated tech stack (Next.js 16, React 19, Mermaid.js, JSZip)

---

### 0.4 Create Missing ADRs
**Directory**: `docs/adr/`

Create 3 new ADRs documenting decisions already made:

| ADR | Title | Key Decision |
|-----|-------|--------------|
| 0002 | Single Service Architecture | Chose single Next.js app over planned monorepo for MVP velocity |
| 0003 | Unauthenticated GitHub API by Default | Public API with optional GITHUB_TOKEN for higher limits |
| 0004 | Client-Side ZIP Generation | JSZip for browser-side project scaffolding downloads |

---

### 0.5 Clarify AI Tool Ecosystem in CONTRIBUTING.md
**File**: `CONTRIBUTING.md`

**Problem**: Mentions "Jules" and "Claude" without explanation.

**Action**: Add section explaining:
- **Jules**: Google's AI agent with direct GitHub commit access (primary)
- **Claude Code**: Anthropic's CLI assistant with staged changes (secondary)
- When to use which tool
- Role of AGENTS.md files

---

## PHASE 1: Foundation for Decision-Clarity System

*Based on Max's core insight: "Your MVP isn't starter kit templates. It's the decision system that produces clarity + next actions."*

### 1.1 Create Question Bank Taxonomy
**New File**: `lib/questions.ts`

Build a structured question bank with 6 categories (from Max's meeting):
- **Intent**: prototype / ship / client demo
- **Runtime**: static / server / functions
- **Data**: none / local / hosted / auth needed
- **Deploy**: GitHub Pages / Vercel / Firebase
- **Cost**: hard $0 / hobby / ok-to-pay
- **Guardrails**: tests / lint / branch rules / none

Each question includes:
- Text and options
- "Why it matters" explanation
- Consequences of each choice

---

### 1.2 Enhance Generator Wizard with Decision Capture
**File**: `app/generate/page.tsx`

Transform from "checkbox form" to "interrogation wizard":
- Step 1: **Intent** - What are you building and why?
- Step 2: **Constraints** - Runtime, data, deployment, cost
- Step 3: Codebase scaffolding
- Step 4: Governance (ADR, CODEOWNERS)
- Step 5: Operations (CI/CD, Docker)
- Step 6: Review + Generate

---

### 1.3 Create Hand-off Artifact Generator
**New File**: `lib/handoff.ts`

Generate a "Decisions Made" document (included in ZIP) with:
- Decisions captured (question + answer + consequence)
- Knowns / Unknowns / Next Decisions
- Recommended stack based on answers

---

## PHASE 2: Enhanced State-of-Repo Dashboard

### 2.1 Transform Report to Checklist Format
**File**: `lib/heuristics.ts`, `app/report/[...slug]/page.tsx`

Each check becomes:
- **Status**: Done / Not Done / Partial
- **Why It Matters**: Educational context
- **Impact**: What breaks if missing
- **Fix**: Action to take

---

### 2.2 Add Guardrails Visibility
**File**: `lib/scanner.ts`

New checks via GitHub API:
- Branch protection rules
- Required reviews
- CI status checks required
- Dependabot enabled
- Secret scanning

---

## PHASE 3: Learning Loop ("3 Projects the Right Way")

*Max's advice: "Don't finish repOptics yet. Instrument your own process first."*

### 3.1 Create Friction Log Template
**New File**: `docs/devnotes/friction-log-template.md`

Template for documenting during each project:
- What decisions made upfront
- What decisions deferred
- Where you got stuck
- What question would have prevented getting stuck

### 3.2 Run 3 Projects
- **Project 1**: Pure prototype (fast, minimal)
- **Project 2**: "Might ship" (adds guardrails)
- **Project 3**: "Ship-ish" (adds tests + governance)

### 3.3 Evolve Question Bank
After each project, extract patterns from friction log into Question Bank.

---

## Explicit Non-Goals (Deferred)

Per Max's guidance on avoiding over-engineering:
- Database persistence (stay stateless)
- Multi-repo organization view
- Automatic PR creation
- OAuth / GitHub App integration
- Background workers
- Monorepo extraction
- History/trends tracking

---

## Files to Modify/Create

### Phase 0 (Documentation)
| Action | File |
|--------|------|
| EDIT | `/README.md` |
| DELETE | `/docs/devnotes/gettingstartedworkflow_gitcopilot.md` |
| RENAME | `/docs/devnotes/gettingstartedworkflow_openai.md` → `architecture_decision_tree.md` |
| EDIT | `/docs/spec.md` |
| CREATE | `/docs/adr/0002-single-service-architecture.md` |
| CREATE | `/docs/adr/0003-unauthenticated-github-api-default.md` |
| CREATE | `/docs/adr/0004-client-side-zip-generation.md` |
| EDIT | `/CONTRIBUTING.md` |

### Phase 1 (Decision System)
| Action | File |
|--------|------|
| CREATE | `/lib/questions.ts` |
| EDIT | `/app/generate/page.tsx` |
| CREATE | `/lib/handoff.ts` |

### Phase 2 (Dashboard Enhancement)
| Action | File |
|--------|------|
| EDIT | `/lib/heuristics.ts` |
| EDIT | `/lib/scanner.ts` |
| EDIT | `/app/report/[...slug]/page.tsx` |

### Phase 3 (Learning Loop)
| Action | File |
|--------|------|
| CREATE | `/docs/devnotes/friction-log-template.md` |

---

## Verification

### Phase 0 Complete When:
- [ ] README describes repOptics (not generic Next.js)
- [ ] No duplicate workflow docs
- [ ] spec.md includes Generator Wizard, Decision Timeline
- [ ] 4 ADRs exist (0001-0004)
- [ ] CONTRIBUTING.md explains Jules/Claude ecosystem

### Phase 1 Complete When:
- [ ] Question Bank has 6 categories with questions
- [ ] Generator asks intent/constraint questions before scaffolding
- [ ] Hand-off artifact generated in ZIP

### Phase 2 Complete When:
- [ ] Report shows "why it matters" for each check
- [ ] Guardrails visibility (branch protection, etc.) added

### Phase 3 Success:
- [ ] 3 projects completed with friction logs
- [ ] Question Bank evolved from real experience
