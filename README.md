# repOptics

**Repo Optics** - A developer hygiene analytics platform for Product Managers and Technical Leads.

repOptics scans GitHub repositories for decision evidence, architecture documentation, and delivery hygiene. It answers the question: *"Do we have our house in order?"*

## Features

### Repository Scanner
Scans any public GitHub repository and scores it across 5 categories:
- **Decisions**: Architecture Decision Records (ADRs) and decision documentation
- **Architecture**: README quality, diagrams, and technical documentation
- **Governance**: CODEOWNERS, LICENSE, CONTRIBUTING.md, GOVERNANCE.md
- **Delivery**: CI/CD workflows, PR templates, and merge velocity metrics
- **Dependencies**: Package freshness audit (major/minor/patch updates)

### Project Generator Wizard
A 5-step wizard to scaffold new projects with excellent hygiene from day one:
1. **Identity** - Project name and description
2. **Codebase** - TypeScript scaffolding and AI context (AGENTS.md)
3. **Governance** - ADRs and ownership files
4. **Operations** - CI/CD and Docker infrastructure
5. **Review & Download** - Generate a ready-to-use ZIP

### Decision Timeline
Visual Mermaid-based timeline showing ADR evolution and status changes over time.

### Dependency Audit
Automated package.json analysis comparing installed versions against npm registry latest.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **GitHub Integration**: Octokit
- **Visualizations**: Mermaid.js
- **ZIP Generation**: JSZip (client-side)
- **Testing**: Vitest

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Optional | Personal Access Token for higher rate limits and private repo access |

Without a token, repOptics uses unauthenticated GitHub API access (60 requests/hour limit).

## Usage

### Scanning a Repository
1. Navigate to the home page
2. Enter a repository in `owner/repo` format (e.g., `facebook/react`)
3. Click "Scan" to generate a hygiene report

### Generating a New Project
1. Click "Generate" or navigate to `/generate`
2. Follow the 5-step wizard
3. Download your configured starter kit ZIP

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md) - System context and component diagrams
- [Product Specification](docs/spec.md) - Features and technical spec
- [Architecture Decision Records](docs/adr/) - Documented decisions
- [Contributing Guide](CONTRIBUTING.md) - Development workflows

## Personality

repOptics uses a "dry humor, developer nerd" persona. It doesn't just report findings; it gently comments on the state of your repo:

> "Zero ADRs. Decisions made by hallway shouts?"
>
> "No README. Good luck, future maintainers."
>
> "Ship it. This repo is a shining example of engineering discipline."

## License

See [LICENSE](LICENSE) for details.
