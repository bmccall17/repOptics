# Contributing to Rep Optics App

Welcome to the Rep Optics App! This guide outlines the workflows and processes for contributing to the project. We aim to streamline production using AI-assisted development and automated deployments.

## Production Workflows

We use two main workflows for development and deployment. Our production environment is hosted on **Render** and is continuously deployed from our **GitHub** repository.

### 1. Primary Workflow: Jules (Automated)

This is our preferred method for most tasks, bug fixes, and feature implementations.

*   **Agent:** Jules
*   **Flow:** `Jules -> GitHub -> Render`
*   **Process:**
    1.  Jules (the AI engineer) performs the task (coding, testing, verifying).
    2.  Jules commits the changes directly to the GitHub repository.
    3.  Render automatically triggers a deployment based on the new commit.

### 2. Secondary Workflow: Claude (Staged)

We use this workflow for tasks requiring manual oversight, complex architectural changes, or when working with Claude for staging.

*   **Agent:** Claude
*   **Flow:** `Claude (Staged) -> Manual Commit (GitHub Desktop) -> Render`
*   **Process:**
    1.  Claude generates the code or changes, which are staged locally.
    2.  A human developer reviews the changes.
    3.  The changes are committed and pushed manually using **GitHub Desktop**.
    4.  Render automatically triggers a deployment based on the pushed commit.

## General Guidelines

To help steer production effectively:

*   **Tests:** Ensure `npm test` passes before finalizing any workflow. Jules handles this automatically, but manual commits must also be verified.
*   **Environment:** We use Node.js (v20.11.0) and Next.js. Ensure your local environment matches the production configuration in `render.yaml`.
*   **Code Quality:** Follow the existing patterns (Shadcn UI, Server Components).
*   **Documentation:** Update this guide or `README.md` if workflows change.
