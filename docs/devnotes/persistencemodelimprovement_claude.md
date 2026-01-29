# Persistent Intent Layer - Implementation Plan

## Overview

Transform repOptics from a **stateless tool** into a **context-aware platform** by persisting the Generator's intent decisions so the Scanner can evaluate repos *relative to what they're trying to be*.

**Problem**: Today, intent evaporates after Generator scaffolding. The Scanner grades every repo against production standards, causing false positives for prototypes and internal tools.

**Solution**: Persistent Repo Profiles that both Generator (writer) and Scanner (reader) share.

---

## Current State

| Component | State | Notes |
|-----------|-------|-------|
| Generator | Captures intent in React state | Lost on refresh; only in DECISIONS.md |
| Scanner | Fixed heuristics | 18 checks, hardcoded weights |
| Storage | None | No database, localStorage, or cache |
| Auth | Server-side `GITHUB_TOKEN` only | No user-provided token flow |

---

## Design Decisions (User Confirmed)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage | **Supabase** | Cross-device persistence, org defaults, real database |
| Fallback | **Production (strictest)** | Unknown repos get full rigor, encourages defining intent |
| Token Scope | **Rate limit boost only** | Simpler implementation, public repos only |

---

## Target State (MVP - Release 1)

```
Generator → Repo Profile (Supabase) → Scanner reads profile → Calibrated scoring
                                                                      ↓
                                                          "Suppressed for prototype"
                                                          "Intent-aware" badge
```

**What MVP includes:**
- [ ] Profile schema (mode, lifecycle, governance level)
- [ ] Supabase database setup
- [ ] Generator writes profile on download
- [ ] Scanner reads profile before scoring
- [ ] 5 calibration rules (prototype suppressions)
- [ ] Intent banner in report
- [ ] Optional GitHub token for rate limit boost

---

## Phase 1: Data Model

### New File: `lib/profile.ts`

```typescript
export type RepoMode = "prototype" | "internal-tool" | "client-demo" | "production";
export type RepoLifecycle = "days" | "months" | "years";
export type GovernanceLevel = "none" | "light" | "standard" | "strict";

export type RepoProfile = {
  id: string;                    // UUID
  provider: "github" | "gitlab";
  owner: string;
  repo: string;

  mode: RepoMode;
  lifecycle: RepoLifecycle;
  governanceLevel: GovernanceLevel;

  description?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  source: "generator" | "manual" | "inferred";
};

export type ProfileCalibration = {
  mode: RepoMode;
  lifecycle: RepoLifecycle;
  governanceLevel: GovernanceLevel;
};

export const DEFAULT_PROFILE: ProfileCalibration = {
  mode: "production",        // Assume strictest for unknown repos
  lifecycle: "years",
  governanceLevel: "standard",
};
```

### Identity Strategy

Repo identity: `provider:owner/repo` (lowercase)
- Example: `github:bmccall17/repoptics`
- Handles cross-provider uniqueness
- Simple string key for localStorage

---

## Phase 2: Supabase Setup

### Supabase Project Setup

1. Create Supabase project at supabase.com
2. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   ```

### Database Schema (SQL)

```sql
CREATE TABLE repo_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'github',
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,

  mode TEXT NOT NULL CHECK (mode IN ('prototype', 'internal-tool', 'client-demo', 'production')),
  lifecycle TEXT NOT NULL CHECK (lifecycle IN ('days', 'months', 'years')),
  governance_level TEXT NOT NULL CHECK (governance_level IN ('none', 'light', 'standard', 'strict')),

  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL CHECK (source IN ('generator', 'manual', 'inferred')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(provider, owner, repo)
);

-- Row Level Security (allow anonymous read/write for MVP)
ALTER TABLE repo_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON repo_profiles FOR ALL USING (true);
```

### New File: `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### New File: `lib/profile-store.ts`

**Functions:**
- `getRepoIdentity(provider, owner, repo): string`
- `saveProfile(profile: RepoProfile): Promise<void>`
- `loadProfile(provider, owner, repo): Promise<RepoProfile | null>`
- `getProfileCalibration(owner, repo): Promise<ProfileCalibration>`
- `listProfiles(): Promise<RepoProfile[]>`

**Fallback**: If no profile exists, return `DEFAULT_PROFILE` (production strictest)

---

## Phase 3: Generator Integration

### Modify: `app/generate/page.tsx`

**Add:**
1. State for repo URL input: `const [repoUrl, setRepoUrl] = useState("")`
2. State for save toggle: `const [saveProfile, setSaveProfile] = useState(true)`
3. On download, after ZIP generation:
   ```typescript
   if (repoUrl && saveProfile) {
     const { owner, repo } = parseRepoUrl(repoUrl);
     const profile = mapAnswersToProfile(answers, owner, repo);
     saveProfile(profile);
   }
   ```

**UI in Review Step:**
- Input field for GitHub repo URL
- Checkbox to save profile
- Preview of derived profile (mode/lifecycle/governance)

### New Function in `lib/profile.ts`

```typescript
export function mapAnswersToProfile(
  answers: DecisionAnswer[],
  owner: string,
  repo: string
): RepoProfile
```

Maps `intent-purpose` → `mode`, `intent-lifespan` → `lifecycle`, derives `governanceLevel` from CI/testing answers.

---

## Phase 4: Scanner Calibration

### New File: `lib/calibration.ts`

**Calibration Effects:**

| Profile | Suppressed Checks | Rationale |
|---------|-------------------|-----------|
| mode=prototype | ADR checks, CODEOWNERS, CONTRIBUTING | Speed > process |
| mode=internal-tool | LICENSE | No external users |
| lifecycle=days | Dated ADRs, dependency freshness | Throwaway code |
| governance=strict | (none suppressed) | Extra rigor |

```typescript
export type CalibrationEffect = {
  checkId: string;
  action: "suppress" | "reduce_weight" | "require";
  reason: string;
};

export function getCalibrationEffects(calibration: ProfileCalibration): CalibrationEffect[]
```

### Modify: `lib/heuristics.ts`

**Add calibration parameter to `scoreRepo`:**

```typescript
export function scoreRepo(
  evidence: RepoEvidence,
  calibration?: ProfileCalibration
): Report
```

**Add helper functions:**
- `shouldSuppressCheck(checkId, effects): boolean`
- `getCheckWeight(checkId, effects): number`

**Modify each scoring function** (scoreDecisions, scoreGovernance, etc.) to check effects before scoring.

**Add to CheckResult type:**
```typescript
calibrationApplied?: boolean;
calibrationRationale?: string;
```

---

## Phase 5: Report UI Updates

### Modify: `app/report/[...slug]/page.tsx`

**Add Intent Banner:**
- If profile found: Blue banner showing "Intent: {mode} / {lifecycle} / {governance}"
- If no profile: Yellow warning "No Intent Profile Found - Using default standards"
- "Edit Intent" button to modify profile

**Add to CheckItem:**
- "Intent-Aware" badge when `calibrationApplied === true`
- Italic rationale text when check is suppressed

**Add "Set Intent" modal:**
- Quick form to create profile for scanned repo
- Mode dropdown, lifecycle dropdown, governance dropdown
- Save to localStorage

---

## Phase 6: GitHub Token Handling (Rate Limit Boost)

**Scope**: Public repos only, higher API rate limit (5000/hr vs 60/hr)

### New File: `lib/token-store.ts`

```typescript
const TOKEN_KEY = 'repoptics:github_token';

export function saveToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | undefined {
  if (typeof window === 'undefined') return process.env.GITHUB_TOKEN;
  return sessionStorage.getItem(TOKEN_KEY) ?? undefined;
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}
```

**Why sessionStorage**: Token cleared when browser closes (more secure)

### Modify: `app/report/[...slug]/page.tsx`

**Add Token Input (Optional):**
- Collapsed by default
- Expandable "Hitting rate limits? Add a GitHub token"
- Input: PAT (read-only public access sufficient)
- Save: Store in sessionStorage
- Note: "Increases API limit from 60 to 5000 requests/hour"

**Note**: Private repos NOT supported via user token (would require passing token to server, security concerns)

---

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `lib/profile.ts` | Profile types, DEFAULT_PROFILE, mapAnswersToProfile |
| `lib/supabase.ts` | Supabase client initialization |
| `lib/profile-store.ts` | Supabase CRUD for profiles |
| `lib/calibration.ts` | Calibration rules and effects |
| `lib/token-store.ts` | Session token management (rate limit boost) |
| `lib/calibration.test.ts` | Unit tests for calibration |
| `lib/profile-store.test.ts` | Unit tests for storage |

### Modified Files
| File | Changes |
|------|---------|
| `lib/heuristics.ts` | Add calibration parameter, modify scoring functions |
| `app/generate/page.tsx` | Add repo URL input, save profile on download |
| `app/report/[...slug]/page.tsx` | Add intent banner, token input, calibration badges |
| `package.json` | Add `@supabase/supabase-js` dependency |
| `.env.local` | Add Supabase URL and anon key |

---

## Verification Checklist

### Supabase Setup
- [ ] Create Supabase project
- [ ] Run schema SQL to create `repo_profiles` table
- [ ] Add env vars to `.env.local`
- [ ] Verify connection works (test query in app)

### Generator Flow
- [ ] Complete wizard with "Prototype" intent
- [ ] Enter repo URL in review step
- [ ] Download ZIP
- [ ] Verify profile saved to Supabase (check table in Supabase dashboard)

### Scanner Flow
- [ ] Scan repo that has saved profile
- [ ] Verify intent banner shows correct mode/lifecycle/governance
- [ ] Verify suppressed checks show "Intent-Aware" badge
- [ ] Verify lower score penalty for prototype

### Fallback Behavior
- [ ] Scan repo with no profile in Supabase
- [ ] Verify yellow warning banner
- [ ] Verify uses production defaults (strictest)

### Token Flow (Rate Limit Boost)
- [ ] Expand token input section
- [ ] Enter PAT
- [ ] Verify higher rate limit (check GitHub API response headers)
- [ ] Close browser, reopen → token should be cleared

### Calibration Rules
- [ ] Prototype: ADR checks suppressed
- [ ] Internal-tool: LICENSE check suppressed
- [ ] Short lifecycle: Dependency freshness suppressed
- [ ] Strict governance: All checks enforced

---

## Future Releases (Out of Scope for MVP)

**Release 2 - Governance Maturity:**
- Edit profile from report page
- Profile version history
- "Graduation" checklist (prototype → production)

**Release 3 - Platform:**
- Supabase backend option
- Org-level profile defaults
- API for profile management
- Event-driven rescans
