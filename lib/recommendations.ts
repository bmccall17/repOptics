import { RepoEvidence } from "./scanner";

export type Recommendation = {
  id: string;
  category: "decisions" | "architecture" | "governance" | "delivery";
  priority: "high" | "medium" | "low";
  type: "quick_win" | "strategic" | "risk_reduction";
  effort: "low" | "medium" | "high";
  title: string;
  rationale: string;
  action: string;
  filePath: string;
};

export function generateRecommendations(evidence: RepoEvidence): Recommendation[] {
  const recs: Recommendation[] = [];

  // Decisions
  if (evidence.adrCount === 0) {
    recs.push({
      id: "adr-init",
      category: "decisions",
      priority: "high",
      type: "strategic",
      effort: "medium",
      title: "Start an ADR Log",
      rationale: "Nobody remembers why we chose this database. ADRs prevent history amnesia.",
      action: "Create an ADR folder and your first decision record.",
      filePath: "docs/adr/0001-record-architecture-decisions.md",
    });
  } else {
      // Check for stale or poorly formatted ADRs could go here
  }

  // Architecture
  if (!evidence.hasReadme) {
    recs.push({
      id: "readme-create",
      category: "architecture",
      priority: "high",
      type: "strategic",
      effort: "medium",
      title: "Create a README",
      rationale: "If it's not documented, it doesn't exist. This is the entry door to your codebase.",
      action: "Add a README.md with Install, Usage, and Contributing sections.",
      filePath: "README.md",
    });
  } else if (evidence.readmeContent && evidence.readmeContent.length < 500) {
    recs.push({
      id: "readme-expand",
      category: "architecture",
      priority: "medium",
      type: "quick_win",
      effort: "low",
      title: "Expand README",
      rationale: "Your README is a tweet. Make it a blog post.",
      action: "Add 'Architecture' and 'Development' sections.",
      filePath: "README.md",
    });
  }

  if (evidence.diagramCount === 0) {
    recs.push({
      id: "diagram-create",
      category: "architecture",
      priority: "medium",
      type: "strategic",
      effort: "high",
      title: "Add an Architecture Diagram",
      rationale: "A picture is worth 1000 lines of spaghetti code. Visualizing the system helps onboarding.",
      action: "Add a mermaid or plantuml diagram showing the system context.",
      filePath: "docs/diagrams/system-context.mermaid",
    });
  }

  // Governance
  if (!evidence.hasCodeowners) {
    recs.push({
      id: "codeowners-create",
      category: "governance",
      priority: "high",
      type: "risk_reduction",
      effort: "low",
      title: "Define CODEOWNERS",
      rationale: "Avoid the 'who reviews this?' shuffle. Ensure the right eyes are on the code.",
      action: "Add a CODEOWNERS file.",
      filePath: ".github/CODEOWNERS",
    });
  }

  if (!evidence.hasContributing) {
     recs.push({
         id: "contributing-create",
         category: "governance",
         priority: "medium",
         type: "quick_win",
         effort: "low",
         title: "Add CONTRIBUTING Guide",
         rationale: "Tell developers how to setup, test, and submit PRs.",
         action: "Add a standard CONTRIBUTING.md file.",
         filePath: "CONTRIBUTING.md"
     })
  }

  // Delivery
  if (!evidence.hasWorkflows) {
    recs.push({
      id: "ci-setup",
      category: "delivery",
      priority: "high",
      type: "risk_reduction",
      effort: "high",
      title: "Set up CI",
      rationale: "Friends don't let friends deploy from localhost. Automate your tests.",
      action: "Add a GitHub Action for linting and testing.",
      filePath: ".github/workflows/ci.yml",
    });
  }

  if (!evidence.hasPrTemplate) {
    recs.push({
      id: "pr-template",
      category: "delivery",
      priority: "low",
      type: "quick_win",
      effort: "low",
      title: "Add PR Template",
      rationale: "Standardize your code reviews. Remind authors to self-check.",
      action: "Create a pull request template.",
      filePath: ".github/pull_request_template.md",
    });
  }

  return recs;
}
