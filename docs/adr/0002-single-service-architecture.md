# 2. Single Service Architecture

Date: 2026-01-22

## Status

Accepted

## Context

Early planning documents (see `docs/devnotes/architecture_decision_tree.md`) recommended a monorepo structure with separate services:

- `apps/web` - Dashboard UI
- `apps/worker` - Scanner background jobs
- `packages/rules` - Shared checks catalog

This would align with Render's Blueprint model for multi-service deployments.

However, for the MVP we needed to decide: build the recommended monorepo from day one, or ship a simpler single-service architecture first?

## Decision

We chose a **single Next.js application** architecture for the MVP.

Key factors:
1. **MVP velocity**: A single codebase is faster to develop, test, and deploy
2. **Scan performance**: Repository scans complete in under 10 seconds for most repos, eliminating the need for background workers
3. **Stateless design**: With no database and ephemeral scans, there's nothing to share between services
4. **Reduced operational complexity**: One service to deploy, monitor, and debug

## Consequences

**Positive**:
- Faster time to MVP
- Simpler deployment (single Render web service)
- Easier local development (just `npm run dev`)
- Unified codebase for scanner, heuristics, and UI

**Negative**:
- Large repo scans may hit timeout limits (mitigated by GitHub API pagination limits anyway)
- No background job queue if we need async processing later
- Would require refactoring to extract services if we scale

**Migration Path**:
If we need to scale, Next.js Server Actions can be extracted into separate API routes, and those can be deployed as separate services. The scanning logic in `lib/scanner.ts` is already decoupled from the UI.
