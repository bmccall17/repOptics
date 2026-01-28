# 4. Client-Side ZIP Generation

Date: 2026-01-22

## Status

Accepted

## Context

The Project Generator Wizard creates starter project files (README, ADRs, CI config, etc.). We needed to decide how to deliver these files to users:

1. **Server-side generation**: Create ZIP on server, store temporarily, provide download link
2. **Client-side generation**: Create ZIP in browser using JavaScript, download directly
3. **GitHub repo creation**: Use GitHub API to create repo with files directly

## Decision

We chose **client-side ZIP generation** using the JSZip library.

Key factors:
1. **Stateless architecture**: No server-side file storage needed
2. **Privacy**: Generated content never leaves the user's browser until download
3. **Simplicity**: No temporary file cleanup, no storage costs, no server load
4. **Offline-capable**: Once the page loads, generation works without server

## Consequences

**Positive**:
- Zero server-side storage requirements
- Instant downloads (no round-trip to server)
- Privacy-preserving (files generated locally)
- No file cleanup cron jobs or storage limits
- Works on static hosting if needed

**Negative**:
- Limited by browser memory for very large projects (not a concern for starter kits)
- Can't generate binary files or run server-side transformations
- ZIP generation JavaScript adds ~45KB to bundle (JSZip minified)

**Implementation Details**:
- JSZip creates an in-memory ZIP archive
- `Blob` API creates downloadable file
- Temporary object URL triggers download
- URL revoked after download to free memory

**Bundle Impact**:
JSZip (~45KB gzipped) is only loaded on the `/generate` page via dynamic import, not affecting initial page load for the scanner.

**Alternative Considered**:
GitHub API to create repository directly was rejected because:
- Requires OAuth authentication
- Users may want to review files before committing
- Not all users want the project on GitHub
