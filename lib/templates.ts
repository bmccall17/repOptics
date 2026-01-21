
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
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Lint
      run: npm run lint

    - name: Run Tests
      run: npm test
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
* Docker (optional)

### Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md).
`.trim();

export const AGENTS_MD_TEMPLATE = `
# AGENTS.md

This file provides context and instructions for AI agents working on this codebase.

## Project Structure

* \`src/\`: Source code
  * \`features/\`: Vertical slices of functionality
  * \`lib/\`: Shared utilities and core logic
  * \`components/\`: Shared UI components (if applicable)
* \`tests/\`: Test files (unless co-located)

## Coding Standards

* **Language**: TypeScript
* **Style**: Prettier + ESLint
* **Testing**: Vitest. prefer TDD.
* **Imports**: Use absolute imports \`@/...\` where possible.

## Directives

1. **Verify**: Always verify your changes by running tests.
2. **Context**: Read \`doc/architecture/decisions\` before making major architectural changes.
3. **Dependencies**: Do not add new dependencies without checking \`package.json\` first.
`.trim();

export const TSCONFIG_TEMPLATE = `
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
`.trim();

export const ESLINT_CONFIG_TEMPLATE = `
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Add custom rules here
    },
  }
);
`.trim();

export const VITEST_CONFIG_TEMPLATE = `
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`.trim();

export const DOCKERFILE_TEMPLATE = `
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "start"]
`.trim();

export const DOCKER_COMPOSE_TEMPLATE = `
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
`.trim();

export const BASE_PACKAGE_JSON = {
  name: "{PROJECT_NAME}",
  private: true,
  version: "0.0.0",
  type: "module",
  scripts: {
    dev: "vite",
    build: "tsc && vite build",
    lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    preview: "vite preview",
    test: "vitest"
  },
  dependencies: {
  },
  devDependencies: {
    "typescript": "^5.2.2",
    "vite": "^5.2.0",
    "@types/node": "^20.11.0",
    "eslint": "^8.57.0",
    "vitest": "^1.3.1",
    "typescript-eslint": "^7.1.0"
  }
};
