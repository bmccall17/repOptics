# Check Definitions & Rules

This document defines the heuristics used by repOptics to score a repository.

## 1. Decisions (ADRs)
*   **Goal**: Ensure architectural decisions are recorded.
*   **Checks**:
    *   File path existence: `docs/adr`, `doc/adr`, `docs/architecture/decisions`.
    *   File count: > 0 files in that directory.
    *   **Scoring**:
        *   Green: Directory exists AND > 2 files.
        *   Yellow: Directory exists, empty or 1 file.
        *   Red: No directory found.
    *   **Commentary**:
        *   Red: "Zero ADRs found. Assuming all decisions are made via hallway shouts."
        *   Green: "ADRs detected. History will remember you."

## 2. Architecture Documentation
*   **Goal**: Ensure the codebase is understandable.
*   **Checks**:
    *   **README**:
        *   Exists?
        *   Length > 1000 characters?
        *   Has headers like "Architecture", "Design", "How it works"?
    *   **Diagrams**:
        *   Checks for `docs/diagrams`, `*.puml`, `*.mermaid` files.
    *   **Scoring**:
        *   Green: README is deep + Diagrams exist.
        *   Yellow: README exists but is shallow (< 500 chars).
        *   Red: No README or empty.

## 3. Governance
*   **Goal**: Ensure ownership and rules.
*   **Checks**:
    *   `CODEOWNERS`: Exists in root or `.github/`.
    *   `LICENSE`: Exists.
    *   `CONTRIBUTING.md`: Exists.
    *   **Scoring**:
        *   Green: CODEOWNERS + LICENSE + CONTRIBUTING.
        *   Yellow: Missing CODEOWNERS.
        *   Red: Missing all.

## 4. CI/Delivery Hygiene
*   **Goal**: Automated verification.
*   **Checks**:
    *   Workflows: `.github/workflows` directory exists and is not empty.
    *   PR Template: `.github/pull_request_template.md` exists.
    *   **Scoring**:
        *   Green: Workflows + PR Template.
        *   Red: No workflows.

## 5. Scoring Algorithm
*   Each category is weighted equally (20%).
*   Final Score = Sum of category scores (0-100).
*   **Grades**:
    *   A (90-100): "Ship it."
    *   B (70-89): "Acceptable, but messy."
    *   C (50-69): "Technical Debt Factory."
    *   F (< 50): "Burn it down."
