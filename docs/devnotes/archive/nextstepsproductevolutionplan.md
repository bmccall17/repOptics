# repOptics Post-Sprint Audit

## How The Current System Works

repOptics is now a **decision-clarity system** with two main flows that should work together:

### Flow 1: Scanner → Diagnose → Fix (Existing Repos)

```
GitHub Repo → Scanner → Evidence → Heuristics → CheckResults → Report
                                                      ↓
                                              "Why It Matters"
                                              "Impact"
                                              "Fix"
```

**What it detects (18 checks across 5 categories):**

| Category | Checks | What's Diagnosed |
|----------|--------|------------------|
| Decisions | 3 | ADRs exist? Multiple? Dated? |
| Architecture | 3 | README? Comprehensive? Diagrams? |
| Governance | 5 | CODEOWNERS, LICENSE, CONTRIBUTING, GOVERNANCE, AGENTS |
| Delivery | 3 | CI workflows? PR template? Fast lead time? |
| Dependencies | 4 | package.json? Major/minor/patch updates? |

**Plus Guardrails visibility:** Branch protection, required reviews, Dependabot, secret scanning, code scanning

### Flow 2: Generator → Decisions → Scaffold (New Projects)

```
User → Wizard Steps → Decision Capture → DECISIONS.md + ZIP Files
         ↓
   1. Identity (name/description)
   2. Intent (prototype/production/lifespan)
   3. Constraints (runtime/data/deploy/cost/guardrails)
   4. Codebase (scaffold, AGENTS.md)
   5. Governance (ADRs, CODEOWNERS)
   6. Operations (CI, Docker)
   7. Review + Download
```

**What it generates:**
- README.md (always)
- DECISIONS.md (captures knowns/unknowns/next actions)
- ADR directory + starter ADR (optional)
- CI workflow (optional)
- CODEOWNERS + PR template (optional)
- AGENTS.md (optional)
- TypeScript scaffold (optional)
- Docker files (optional)

---

## The Alignment Problem

**The Scanner checks for things the Generator doesn't create.**

| Scanner Detects | Generator Creates | Gap |
|-----------------|-------------------|-----|
| Diagrams (.mermaid, .puml) | Nothing | **50-point penalty** |
| LICENSE file | Nothing | **30-point penalty** |
| CONTRIBUTING.md | Nothing | 30-point penalty |
| GOVERNANCE.md | Nothing | Optional, but detected |
| Branch protection | Cannot create (GitHub API) | Acceptable |

**Result:** A brand new project from the Generator will score poorly on its own Scanner.

---

## The Intelligence Problem

**The Generator asks questions but doesn't use the answers.**

| Question Answered | What Should Happen | What Actually Happens |
|-------------------|-------------------|----------------------|
| Intent = "production" | Auto-enable CI, ADRs, Governance | User manually checks boxes |
| Lifespan = "years" | Auto-enable AGENTS.md, comprehensive docs | User manually checks boxes |
| Guardrails = "ci-cd" | Auto-enable CI checkbox | User manually checks boxes |
| Cost = "$0" | Warn if server runtime selected | No validation |
| Intent = "prototype" | Maybe skip ADRs, suggest minimal | Everything enabled by default |

**Result:** The decision-capture is for documentation only, not for driving behavior.

---

## Improvement Recommendations

### Priority 1: Close the Scanner/Generator Gap

| Fix | Effort | Impact |
|-----|--------|--------|
| Add Mermaid diagram template to Generator | Low | +50 points Architecture |
| Add LICENSE template (MIT) to Generator | Low | +30 points Governance |
| Add CONTRIBUTING.md template to Generator | Low | +30 points Governance |
| Add GOVERNANCE.md template to Generator | Low | Completeness |

**Files to modify:**
- `lib/templates.ts` - Add new templates
- `app/generate/page.tsx` - Add checkboxes for new options

### Priority 2: Make Decisions Drive Behavior

**Auto-select modules based on intent answers:**

```typescript
// In app/generate/page.tsx
function deriveModulesFromDecisions(answers: DecisionAnswer[]): Partial<Config> {
  const purpose = getAnswer(answers, "intent-purpose");
  const lifespan = getAnswer(answers, "intent-lifespan");
  const ci = getAnswer(answers, "guardrails-ci");

  return {
    includeADR: purpose === "production" || lifespan === "years",
    includeCI: ci !== "none",
    includeGovernance: purpose !== "prototype",
    includeAIContext: lifespan === "years",
    includeLicense: purpose !== "prototype",
    includeDiagrams: purpose === "production",
  };
}
```

**Add decision conflict warnings:**
- "Production" + "No tests" → Warning
- "Years lifespan" + "No ADRs" → Warning
- "$0 budget" + "Server runtime" → Warning about free tier limits

**Files to modify:**
- `app/generate/page.tsx` - Add `useEffect` to sync decisions → checkboxes
- `lib/questions.ts` - Add validation rules to question options

### Priority 3: Smarter Stack Recommendations

**Current:** 5 hard-coded decision paths
**Needed:** Combinatorial logic

| Decision Combo | Recommendation |
|----------------|----------------|
| static + $0 + prototype | "GitHub Pages, skip CI entirely" |
| server + production + database | "Render + Supabase, add monitoring" |
| serverless + oauth | "Vercel + NextAuth, watch cold starts" |

**Files to modify:**
- `lib/handoff.ts` - Expand `generateStackRecommendations()` with combo logic

### Priority 4: Personalized Next Steps

**Current:** Same generic next steps for everyone
**Needed:** Decision-aware onboarding

```typescript
function generatePersonalizedNextSteps(answers, config): string[] {
  const steps = ["Extract ZIP and run `git init`"];

  if (config.includeCI) {
    steps.push("Configure GitHub secrets for CI");
  }
  if (getAnswer(answers, "data-storage") === "database") {
    steps.push("Create database and add connection string to .env");
  }
  if (getAnswer(answers, "data-auth") === "oauth") {
    steps.push("Register OAuth app and configure NextAuth providers");
  }
  // etc.
  return steps;
}
```

**Files to modify:**
- `lib/handoff.ts` - Replace generic next steps with personalized function

### Priority 5: Scanner Enhancements

**Add detection for:**
- Test coverage (parse coverage reports if they exist)
- CHANGELOG.md presence and quality
- Security vulnerabilities (npm audit integration)
- Unused dependencies (parse package.json vs imports)

**Files to modify:**
- `lib/scanner.ts` - Add new evidence fields
- `lib/heuristics.ts` - Add new CheckResults

---

## Implementation Plan: Phase B - Decision Intelligence

**Selected by user for implementation.**

**Goal:** Make decision questions drive wizard behavior - turning repOptics from "documentation" into a true "decision-clarity system."

---

### Task 1: Auto-Select Modules Based on Decisions

**File:** `app/generate/page.tsx`

Add `useEffect` after step 3 completes to derive module selections from answers:

```typescript
function deriveModulesFromDecisions(answers: DecisionAnswer[]) {
  const purpose = findSelectedOption(answers, "intent-purpose");
  const lifespan = findSelectedOption(answers, "intent-lifespan");
  const ciLevel = findSelectedOption(answers, "guardrails-ci");
  const testing = findSelectedOption(answers, "guardrails-testing");

  return {
    includeADR: purpose === "production" || lifespan === "years",
    includeCI: ciLevel !== "none",
    includeGovernance: purpose !== "prototype",
    includeAIContext: lifespan === "years" || lifespan === "months",
    includeScaffold: testing !== "none" || ciLevel !== "none",
    includeDocker: purpose === "production",
  };
}
```

Show "Recommended" badge on auto-selected items. Track manual overrides so auto-select doesn't fight user.

---

### Task 2: Add Decision Conflict Warnings

**File:** `lib/questions.ts`

Add validation function:

```typescript
export type DecisionConflict = {
  severity: "warning" | "error";
  message: string;
  suggestion: string;
};

export function validateDecisions(answers: DecisionAnswer[]): DecisionConflict[]
```

**Conflicts to detect:**
- Production + no tests → "Production without tests is risky"
- Years lifespan + no ADRs → "Long-lived projects benefit from decision documentation"
- Server runtime + $0 budget → "Server on $0 has strict limits (cold starts, limited hours)"
- Production + no CI → "Production without CI risks deploying broken code"
- Prototype + full test suite + CI/CD → "May be overkill for a prototype"

**File:** `app/generate/page.tsx`

Display conflicts as yellow warning boxes in Review step (step 7).

---

### Task 3: Expand Stack Recommendations

**File:** `lib/handoff.ts`

Replace 5 hard-coded paths with 15+ combinatorial recommendations:

| Combo | Recommendation |
|-------|----------------|
| static + $0 | GitHub Pages |
| static + paid | Cloudflare Pages |
| serverless + any | Vercel |
| server + $0 | Render free tier (with cold start warning) |
| server + paid | Render or Railway |
| database + $0 | Supabase free tier |
| database + production | Supabase Pro or PlanetScale |
| oauth | NextAuth.js or Clerk |
| simple auth | Magic link via Resend |
| ci or ci-cd | GitHub Actions |
| unit or full tests | Vitest + Testing Library |

---

### Task 4: Decision Summary in Review

**File:** `app/generate/page.tsx`

Add collapsible "View all X decisions" in Review step showing question → answer pairs.

---

## Files to Modify

| File | Changes |
|------|---------|
| `lib/questions.ts` | Add `validateDecisions()`, `DecisionConflict` type |
| `app/generate/page.tsx` | Add `deriveModulesFromDecisions()`, useEffect, conflict display, decision summary |
| `lib/handoff.ts` | Expand `generateStackRecommendations()` |

---

## Verification

- [ ] Select "prototype" → ADRs/Governance auto-disabled
- [ ] Select "production" → ADRs/CI/Governance auto-enabled
- [ ] Select "production" + "no tests" → Warning appears
- [ ] Select "server" + "$0" → Warning about free tier
- [ ] Stack recommendations change based on decision combos
- [ ] Manual checkbox changes preserved (not overwritten)
- [ ] Review shows expandable decision list
