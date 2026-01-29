# 5. Decision-Driven Generator Wizard

Date: 2026-01-28

## Status

Accepted

## Context

The Project Generator Wizard collected decision answers (intent, runtime, data, cost, guardrails) but didn't use them to drive behavior. Users answered questions, then had to manually check the same boxes that their answers implied. This created two problems:

1. **Disconnect**: Decisions were captured for documentation only, not for driving recommendations
2. **Cognitive load**: Users had to mentally translate their answers into checkbox selections

Max's insight: "Your MVP isn't starter kit templates. It's the decision system that produces clarity + next actions."

We needed the wizard to be a true **decision-clarity system** where answers actively shape the generated output.

## Decision

We implemented **Decision Intelligence** - a system where user answers automatically drive module selection, validate consistency, and provide context-aware recommendations.

### Key Components

1. **Auto-Select Modules**: `deriveModulesFromDecisions()` maps answers to recommended modules:
   - Production/years lifespan → ADRs enabled
   - Any CI level selected → CI enabled
   - Non-prototype → Governance enabled
   - Testing or CI enabled → Scaffold enabled
   - Months/years lifespan → AI Context enabled
   - Production + server → Docker enabled

2. **Manual Override Tracking**: Users can change auto-selected values. Once manually changed, auto-select won't overwrite their choice.

3. **Conflict Validation**: `validateDecisions()` detects problematic combinations:
   - Production + no tests
   - Server runtime + $0 budget
   - Production + no CI
   - Prototype + full test suite (overkill)

4. **Expanded Recommendations**: 15+ combinatorial stack recommendations based on runtime, budget, storage, auth, and purpose combinations.

## Consequences

**Positive**:
- Decisions now have immediate, visible impact on the wizard
- Users understand *why* certain modules are recommended
- Conflict warnings catch common mistakes before project creation
- Stack recommendations are tailored to actual constraints
- Manual overrides are preserved (respects user agency)

**Negative**:
- More complex state management in the wizard (manual override tracking)
- Recommendations may need periodic updates as the ecosystem changes
- Users might be confused if auto-selection changes their previous manual choice (mitigated by only applying on first derivation)

**Trade-offs**:
- We chose to auto-enable modules rather than auto-disable. This means the wizard defaults to more comprehensive setups that users can opt out of, rather than minimal setups they must opt into.

## Implementation Details

- `lib/questions.ts`: Added `validateDecisions()` and `DecisionConflict` type
- `app/generate/page.tsx`: Added `deriveModulesFromDecisions()`, `useEffect` for sync, override tracking
- `lib/handoff.ts`: Expanded `generateStackRecommendations()` with combinatorial logic

## Related Decisions

- ADR-0004: Client-Side ZIP Generation (how files are delivered)
- ADR-0002: Single Service Architecture (why wizard is part of main app)
