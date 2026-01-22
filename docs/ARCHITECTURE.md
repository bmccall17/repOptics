# Architecture

## System Context

This diagram illustrates the high-level context of the **repOptics** system.

```mermaid
C4Context
    title System Context Diagram for repOptics

    Person(user, "User", "Product Manager or Tech Lead checking repo hygiene.")
    System(repOptics, "repOptics", "Scans GitHub repositories for decision evidence, architecture documentation, and delivery hygiene.")
    System_Ext(github, "GitHub API", "Provides repository file structure and metadata.")

    Rel(user, repOptics, "Uses", "HTTPS")
    Rel(repOptics, github, "Reads repository data", "HTTPS/REST API")
```

## Internal Architecture

This diagram shows the logical components and data flow within the application during a repository scan.

```mermaid
graph TD
    subgraph Client [Browser / Client]
        User((User))
        UI[Web Dashboard]
    end

    subgraph Server [Next.js Server Actions/API]
        Scanner[Scanner Orchestrator]
        Heuristics[Heuristics Engine]
        Report[Report Generator]
    end

    subgraph External [External Systems]
        Github[GitHub API]
    end

    User -->|Input owner/repo| UI
    UI -->|Request Scan| Scanner
    Scanner -->|Fetch File List| Github
    Github -->|Return File Tree| Scanner
    Scanner -->|Analyze Files| Heuristics

    Heuristics -->|Check Decisions| CheckADR[ADR Check]
    Heuristics -->|Check Governance| CheckGov[Governance Check]
    Heuristics -->|Check CI/CD| CheckCI[CI/CD Check]

    Heuristics -->|Results| Scanner
    Scanner -->|Compile| Report
    Report -->|JSON/View| UI
```
