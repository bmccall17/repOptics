
export const ADR_TEMPLATE = `
# {NUMBER}. {TITLE}

Date: {DATE}

## Status

{STATUS}

## Context

{CONTEXT}

## Decision

{DECISION}

## Consequences

{CONSEQUENCES}
`.trim();

export const ADR_README = `
# Architecture Decision Records

We use Architecture Decision Records (ADRs) to document significant architectural decisions.

## Why?

* To document the history of decisions.
* To facilitate onboarding of new team members.
* To ensure alignment on architectural choices.

## How to create a new ADR?

Copy the template and increment the number.
`.trim();

export const CI_WORKFLOW = `
name: CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
    
    - name: Run Tests
      run: echo "Replace this with your test command" && exit 0

    - name: Lint
      run: echo "Replace this with your lint command"
`.trim();

export const CODEOWNERS = `
# This file defines who owns what in the repository.
# https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-codeowners

* @your-team-lead
/doc/architecture/ @arch-team
`.trim();

export const README_TEMPLATE = `
# {PROJECT_NAME}

{DESCRIPTION}

## Architecture

See [doc/architecture/decisions](doc/architecture/decisions) for key decisions.

## Development

### Prerequisites

* Node.js (v20+)
* ...

### Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md).
`.trim();
