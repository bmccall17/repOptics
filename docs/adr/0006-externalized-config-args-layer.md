# 6. Externalized Config (Args Layer)

Date: 2026-02-23

## Status

Accepted

## Context

All scoring behavior in repOptics was hardcoded inline across five TypeScript library files (`heuristics.ts`, `scanner.ts`, `dependencies.ts`, `github.ts`, `recommendations.ts`). Every threshold, weight, point allocation, and personality string was a magic number in source code with zero configuration files for application behavior.

This created three problems:

1. **Persistent Intent Layer blocked** -- The next planned feature (Repo Profiles that calibrate scoring per-repo based on intent like prototype vs production) had nowhere to plug in overrides. Every tuning knob was buried in function bodies.
2. **Poor testability** -- Testing "what if governance weights were different?" required mocking entire functions rather than passing a different config.
3. **No customization foundation** -- Different organizations define "good" differently, but there was no mechanism to express those differences.

The GOTCHA framework (Governance, Observability, Testing, Configuration, Hardening, Automation) identifies this as a Configuration gap: behavior settings should live in an external Args layer that changes how the system acts without editing source code.

## Decision

Create a single typed `RepOpticsConfig` object in `lib/config.ts` that captures every hardcoded scoring value as a named, typed default. Refactor all five library files to accept an optional config parameter (defaulting to `DEFAULT_CONFIG`), replacing inline magic numbers with config reads.

Key design choices:

- **Single config object, not scattered params** -- One `RepOpticsConfig` type covers all domains (grade thresholds, category weights, scoring formulas, personality strings, scanner limits, recommendation thresholds). This gives the future Repo Profile a single surface to override.
- **DeepPartial overrides** -- A `resolveConfig(overrides?)` function deep-merges partial overrides onto frozen defaults. Callers only specify what they want to change.
- **Default parameter pattern** -- Every public function uses `config: RepOpticsConfig = DEFAULT_CONFIG` so existing call sites and tests work unchanged with zero modifications.
- **Frozen defaults** -- `DEFAULT_CONFIG` is `Object.freeze`d to prevent accidental mutation.

## Consequences

- All existing tests pass unchanged -- the default config reproduces current behavior exactly.
- New tests can verify scoring with custom configs by passing overrides directly.
- The Persistent Intent Layer can now be implemented as: load a Repo Profile, convert it to config overrides, pass to `resolveConfig()`, and thread the result through `scoreRepo()` and `generateRecommendations()`.
- Org-level customization becomes possible by defining config presets.
- The config type serves as living documentation of every tuning knob in the system.
