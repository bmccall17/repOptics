# 3. Unauthenticated GitHub API by Default

Date: 2026-01-22

## Status

Accepted

## Context

repOptics needs to fetch repository data from GitHub. GitHub offers two access models:

1. **Unauthenticated**: 60 requests/hour per IP, public repos only
2. **Authenticated (PAT)**: 5,000 requests/hour, access to private repos

Early planning suggested requiring a GitHub App or OAuth integration for org-level installs and higher rate limits.

## Decision

We chose **unauthenticated GitHub API access by default**, with an optional `GITHUB_TOKEN` environment variable for users who need higher limits or private repo access.

Key factors:
1. **Zero-friction onboarding**: Users can scan public repos immediately without any setup
2. **MVP scope**: Most users scanning their own public repos won't hit rate limits
3. **Privacy-first**: We don't store tokens; users provide them only if needed
4. **Incremental authentication**: Adding OAuth later doesn't break existing functionality

## Consequences

**Positive**:
- Instant usability - no auth flow required for basic usage
- No OAuth app registration or approval needed
- No token storage security concerns
- Users understand the tradeoff (rate limits) and can opt-in to auth

**Negative**:
- 60 requests/hour limit can be hit quickly when scanning multiple repos
- Private repositories inaccessible without user-provided token
- No organization-level features (team repos, org-wide scanning)

**Rate Limit Reality**:
A typical scan uses ~5-25 API calls (tree fetch, file contents, PRs). At 60 requests/hour, users can scan 2-10 repos per hour unauthenticated. This is acceptable for the "check a few repos" use case.

**Future Options**:
- Add OAuth GitHub App for seamless auth (v1.x)
- Implement local caching to reduce API calls
- Add rate limit detection and user-friendly error messages
