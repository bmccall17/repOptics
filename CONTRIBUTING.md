# Contributing to repOptics

Welcome to repOptics! This guide outlines the workflows and processes for contributing to the project. We use AI-assisted development and automated deployments.

## AI Tool Ecosystem

We use multiple AI coding assistants in our workflow. Here's how they differ:

### Jules (Google's AI Agent)
- **What it is**: Google's AI engineering agent with direct GitHub integration
- **Capabilities**: Can read, write, and commit code directly to the repository
- **Best for**: Routine bug fixes, well-defined feature implementations, automated tasks
- **Flow**: Jules works autonomously and commits directly to GitHub

### Claude Code (Anthropic's CLI)
- **What it is**: Anthropic's command-line AI assistant
- **Capabilities**: Generates code locally, requires human review before commit
- **Best for**: Complex architectural changes, exploratory work, pair programming
- **Flow**: Claude stages changes locally; human reviews and commits via GitHub Desktop or CLI

### When to Use Which

| Scenario | Recommended Tool |
|----------|-----------------|
| Simple bug fix with clear reproduction | Jules |
| New feature with existing patterns | Jules |
| Architectural refactoring | Claude Code |
| Exploratory prototyping | Claude Code |
| Documentation updates | Either |
| Security-sensitive changes | Claude Code (human review) |

### AGENTS.md Files

Both tools can use `AGENTS.md` files to understand project context. This file acts as a "README for robots" and should include:
- Project structure and conventions
- Testing requirements
- Code style guidelines
- Domain-specific rules

repOptics scans for `AGENTS.md` in its governance checks and the Generator Wizard can create one for new projects.

## Production Workflows

Our production environment is hosted on **Render** and continuously deployed from our **GitHub** repository.

### 1. Primary Workflow: Jules (Automated)

Preferred for most tasks, bug fixes, and feature implementations.

*   **Agent:** Jules
*   **Flow:** `Jules -> GitHub -> Render`
*   **Process:**
    1.  Jules performs the task (coding, testing, verifying).
    2.  Jules commits the changes directly to the GitHub repository.
    3.  Render automatically triggers a deployment based on the new commit.

### 2. Secondary Workflow: Claude (Staged)

Used for tasks requiring manual oversight or complex architectural changes.

*   **Agent:** Claude Code
*   **Flow:** `Claude (Staged) -> Manual Commit (GitHub Desktop) -> Render`
*   **Process:**
    1.  Claude generates code or changes, staged locally.
    2.  A human developer reviews the changes.
    3.  Changes are committed and pushed manually using **GitHub Desktop**.
    4.  Render automatically triggers a deployment based on the pushed commit.

## General Guidelines

To help steer production effectively:

*   **Tests:** Ensure `npm test` passes before finalizing any workflow. Jules handles this automatically, but manual commits must also be verified.
*   **Environment:** We use Node.js (v20.11.0) and Next.js. Ensure your local environment matches the production configuration in `render.yaml`.
*   **Code Quality:** Follow the existing patterns (Shadcn UI, Server Components).
*   **Documentation:** Update this guide or `README.md` if workflows change.
