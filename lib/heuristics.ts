import { RepoEvidence } from "./scanner";

export type CheckStatus = "done" | "partial" | "not_done";

export type CheckResult = {
  id: string;
  name: string;
  status: CheckStatus;
  whyItMatters: string;
  impact: string;
  fix: string;
  details?: string;
};

export type CategoryScore = {
  score: number; // 0-100
  status: "green" | "yellow" | "red";
  message: string;
  checks: CheckResult[];
};

export type Report = {
  totalScore: number;
  grade: string;
  categories: {
    decisions: CategoryScore;
    architecture: CategoryScore;
    governance: CategoryScore;
    delivery: CategoryScore;
    dependencies: CategoryScore;
  };
  summary: string;
};

export function scoreRepo(evidence: RepoEvidence): Report {
  const decisions = scoreDecisions(evidence);
  const architecture = scoreArchitecture(evidence);
  const governance = scoreGovernance(evidence);
  const delivery = scoreDelivery(evidence);
  const dependencies = scoreDependencies(evidence);

  const totalScore = Math.round(
    (decisions.score + architecture.score + governance.score + delivery.score + dependencies.score) / 5
  );

  let grade = "F";
  if (totalScore >= 90) grade = "A";
  else if (totalScore >= 70) grade = "B";
  else if (totalScore >= 50) grade = "C";

  return {
    totalScore,
    grade,
    categories: {
      decisions,
      architecture,
      governance,
      delivery,
      dependencies,
    },
    summary: generateSummary(grade),
  };
}

function scoreDependencies(evidence: RepoEvidence): CategoryScore {
  let score = 100;
  const { outdatedCount, majorCount, minorCount, patchCount, totalDeps } = evidence.dependencies;

  if (majorCount > 0) score -= majorCount * 15;
  if (minorCount > 0) score -= minorCount * 5;

  if (score < 0) score = 0;

  const checks: CheckResult[] = [
    {
      id: "deps-package-json",
      name: "Package.json exists",
      status: totalDeps > 0 ? "done" : "not_done",
      whyItMatters: "A package.json defines your project's dependencies and scripts.",
      impact: "Without it, npm/yarn can't install dependencies or run scripts.",
      fix: "Run `npm init` to create a package.json file.",
      details: totalDeps > 0 ? `${totalDeps} dependencies found` : undefined,
    },
    {
      id: "deps-no-major",
      name: "No major version updates pending",
      status: majorCount === 0 ? "done" : "not_done",
      whyItMatters: "Major version updates often contain breaking changes that require code modifications.",
      impact: "Running outdated major versions may expose security vulnerabilities and miss important fixes.",
      fix: "Review and update major dependencies one at a time, testing thoroughly after each update.",
      details: majorCount > 0 ? `${majorCount} major update${majorCount !== 1 ? "s" : ""} available` : undefined,
    },
    {
      id: "deps-no-minor",
      name: "No minor version updates pending",
      status: minorCount === 0 ? "done" : minorCount <= 3 ? "partial" : "not_done",
      whyItMatters: "Minor versions add new features and bug fixes without breaking changes.",
      impact: "Missing minor updates means missing out on improvements and potential security patches.",
      fix: "Run `npm update` to safely update minor versions.",
      details: minorCount > 0 ? `${minorCount} minor update${minorCount !== 1 ? "s" : ""} available` : undefined,
    },
    {
      id: "deps-fresh",
      name: "Dependencies are fresh",
      status: outdatedCount === 0 ? "done" : outdatedCount <= 5 ? "partial" : "not_done",
      whyItMatters: "Fresh dependencies ensure you have the latest security patches and improvements.",
      impact: "Stale dependencies accumulate tech debt and make future updates harder.",
      fix: "Regularly run `npm outdated` and update dependencies incrementally.",
      details: patchCount > 0 ? `${patchCount} patch update${patchCount !== 1 ? "s" : ""} available` : undefined,
    },
  ];

  let message: string;
  if (score >= 90) {
    message = "Fresh as a daisy.";
  } else if (score >= 60) {
    message = `${outdatedCount} updates available.`;
  } else {
    message = `Dep rot detected. ${majorCount} major updates.`;
  }

  return { score, status: score >= 90 ? "green" : score >= 60 ? "yellow" : "red", message, checks };
}

function scoreDecisions(evidence: RepoEvidence): CategoryScore {
  let score = 0;

  if (evidence.adrCount > 0) score += 50;
  if (evidence.adrCount > 2) score += 30;

  const hasDates = evidence.adrs.some(a => !!a.date);
  if (hasDates) score += 20;

  const checks: CheckResult[] = [
    {
      id: "decisions-adr-exists",
      name: "ADR directory exists",
      status: evidence.adrCount > 0 ? "done" : "not_done",
      whyItMatters: "Architecture Decision Records (ADRs) capture the 'why' behind technical choices.",
      impact: "Without ADRs, future developers waste time rediscovering context or repeating past mistakes.",
      fix: "Create a `docs/adr/` directory and add your first ADR using the template in the Generator.",
      details: evidence.adrCount > 0 ? `${evidence.adrCount} ADR${evidence.adrCount !== 1 ? "s" : ""} found` : undefined,
    },
    {
      id: "decisions-multiple-adrs",
      name: "Multiple decisions recorded",
      status: evidence.adrCount > 2 ? "done" : evidence.adrCount > 0 ? "partial" : "not_done",
      whyItMatters: "Real projects have multiple significant decisions worth documenting.",
      impact: "A single ADR suggests decisions aren't being captured consistently.",
      fix: "Document decisions as they're made: tech stack choices, API design, data models, etc.",
    },
    {
      id: "decisions-dated",
      name: "ADRs include dates",
      status: hasDates ? "done" : evidence.adrCount > 0 ? "partial" : "not_done",
      whyItMatters: "Dates provide historical context - when was this decided?",
      impact: "Without dates, it's hard to understand the decision timeline or if a decision is stale.",
      fix: "Add a 'Date: YYYY-MM-DD' line to each ADR following the standard format.",
    },
  ];

  let message: string;
  if (score >= 100) {
    message = "History will remember you.";
  } else if (score >= 50) {
    message = "A few decisions recorded. Better than telepathy.";
  } else {
    message = "Zero ADRs. Decisions made by hallway shouts?";
  }

  return {
    score: score >= 100 ? 100 : score >= 50 ? 60 : 0,
    status: score >= 100 ? "green" : score >= 50 ? "yellow" : "red",
    message,
    checks,
  };
}

function scoreArchitecture(evidence: RepoEvidence): CategoryScore {
  let score = 0;

  if (evidence.hasReadme) {
    if (evidence.readmeContent && evidence.readmeContent.length > 1000) {
      score += 50;
    } else {
      score += 20;
    }
  }

  if (evidence.diagramCount > 0) {
    score += 50;
  }

  const readmeLength = evidence.readmeContent?.length || 0;

  const checks: CheckResult[] = [
    {
      id: "arch-readme-exists",
      name: "README.md exists",
      status: evidence.hasReadme ? "done" : "not_done",
      whyItMatters: "The README is the front door to your project - first thing developers see.",
      impact: "Without a README, developers don't know what the project does or how to use it.",
      fix: "Create a README.md with project purpose, setup instructions, and usage examples.",
    },
    {
      id: "arch-readme-comprehensive",
      name: "README is comprehensive",
      status: readmeLength > 1000 ? "done" : evidence.hasReadme ? "partial" : "not_done",
      whyItMatters: "A comprehensive README reduces onboarding time and support questions.",
      impact: "Short READMEs leave developers guessing and lead to incorrect assumptions.",
      fix: "Expand your README with: overview, installation, usage, configuration, and contributing sections.",
      details: evidence.hasReadme ? `${readmeLength} characters` : undefined,
    },
    {
      id: "arch-diagrams",
      name: "Architecture diagrams exist",
      status: evidence.diagramCount > 0 ? "done" : "not_done",
      whyItMatters: "Diagrams communicate system design faster than text alone.",
      impact: "Without diagrams, developers build incorrect mental models of the system.",
      fix: "Add diagrams in docs/ using Mermaid, PlantUML, or Excalidraw formats.",
      details: evidence.diagramCount > 0 ? `${evidence.diagramCount} diagram${evidence.diagramCount !== 1 ? "s" : ""} found` : undefined,
    },
  ];

  let message: string;
  if (score >= 80) {
    message = "Well documented. A joy to read.";
  } else if (score >= 40) {
    message = "Basic README found, but where are the pictures?";
  } else {
    message = "No README. Good luck, future maintainers.";
  }

  return {
    score: score >= 80 ? 100 : score >= 40 ? 50 : 0,
    status: score >= 80 ? "green" : score >= 40 ? "yellow" : "red",
    message,
    checks,
  };
}

function scoreGovernance(evidence: RepoEvidence): CategoryScore {
  let score = 0;
  if (evidence.hasCodeowners) score += 40;
  if (evidence.hasLicense) score += 30;
  if (evidence.hasContributing) score += 30;

  const checks: CheckResult[] = [
    {
      id: "gov-codeowners",
      name: "CODEOWNERS file exists",
      status: evidence.hasCodeowners ? "done" : "not_done",
      whyItMatters: "CODEOWNERS defines who is responsible for reviewing changes to specific files.",
      impact: "Without CODEOWNERS, PRs may be merged without appropriate reviewers.",
      fix: "Create a CODEOWNERS file at root or .github/ mapping paths to team members.",
    },
    {
      id: "gov-license",
      name: "LICENSE file exists",
      status: evidence.hasLicense ? "done" : "not_done",
      whyItMatters: "A license defines how others can use your code legally.",
      impact: "Without a license, the code is technically all-rights-reserved and legally risky to use.",
      fix: "Add a LICENSE file - MIT, Apache 2.0, or ISC are common choices for open source.",
    },
    {
      id: "gov-contributing",
      name: "CONTRIBUTING.md exists",
      status: evidence.hasContributing ? "done" : "not_done",
      whyItMatters: "Contributing guidelines set expectations for how to submit changes.",
      impact: "Without guidelines, contributors may submit PRs that don't match project standards.",
      fix: "Create CONTRIBUTING.md with PR process, code style, and testing requirements.",
    },
    {
      id: "gov-governance",
      name: "GOVERNANCE.md exists",
      status: evidence.hasGovernance ? "done" : "partial",
      whyItMatters: "Governance docs explain decision-making processes and project leadership.",
      impact: "Important for mature projects but optional for most - explains how the project is run.",
      fix: "Create GOVERNANCE.md if you have multiple maintainers or community contributors.",
    },
    {
      id: "gov-agents",
      name: "AGENTS.md exists (AI readiness)",
      status: evidence.hasAgents ? "done" : "partial",
      whyItMatters: "AGENTS.md helps AI coding assistants understand your project's rules.",
      impact: "AI tools work better when they understand project conventions and constraints.",
      fix: "Create AGENTS.md with project structure, coding conventions, and testing requirements.",
    },
  ];

  let message: string;
  if (score >= 80) {
    message = "Lawful Good.";
  } else if (score >= 40) {
    message = "Chaotic Neutral. Some rules exist.";
  } else {
    message = "Anarchy. Who owns this? Nobody knows.";
  }

  return {
    score: score >= 80 ? 100 : score >= 40 ? 50 : 0,
    status: score >= 80 ? "green" : score >= 40 ? "yellow" : "red",
    message,
    checks,
  };
}

function scoreDelivery(evidence: RepoEvidence): CategoryScore {
  let score = 0;
  if (evidence.hasWorkflows) score += 50;
  if (evidence.hasPrTemplate) score += 30;

  if (evidence.prMetrics.mergedCount > 0) {
    if (evidence.prMetrics.avgLeadTimeHours < 24) score += 20;
    else if (evidence.prMetrics.avgLeadTimeHours < 72) score += 10;
  } else {
    score += 10;
  }

  const leadTimeStatus: CheckStatus =
    evidence.prMetrics.mergedCount === 0 ? "partial" :
    evidence.prMetrics.avgLeadTimeHours < 24 ? "done" :
    evidence.prMetrics.avgLeadTimeHours < 72 ? "partial" : "not_done";

  const checks: CheckResult[] = [
    {
      id: "delivery-ci",
      name: "CI/CD workflows exist",
      status: evidence.hasWorkflows ? "done" : "not_done",
      whyItMatters: "CI/CD automates testing and deployment, catching issues before they reach production.",
      impact: "Without CI, broken code can be merged. Without CD, deployments are manual and error-prone.",
      fix: "Create .github/workflows/ci.yml with lint, test, and build steps.",
    },
    {
      id: "delivery-pr-template",
      name: "PR template exists",
      status: evidence.hasPrTemplate ? "done" : "not_done",
      whyItMatters: "PR templates ensure consistent information in every pull request.",
      impact: "Without templates, PRs may lack context, testing notes, or checklists.",
      fix: "Create .github/pull_request_template.md with description, changes, and checklist sections.",
    },
    {
      id: "delivery-lead-time",
      name: "Fast PR lead time (<24h)",
      status: leadTimeStatus,
      whyItMatters: "Lead time measures how quickly PRs go from open to merged - a key delivery metric.",
      impact: "Slow PRs block progress, create merge conflicts, and slow iteration speed.",
      fix: "Review PRs daily. Keep PRs small. Use async review processes.",
      details: evidence.prMetrics.mergedCount > 0
        ? `Average: ${evidence.prMetrics.avgLeadTimeHours}h (${evidence.prMetrics.mergedCount} PRs sampled)`
        : "No merged PRs to analyze",
    },
  ];

  let message: string;
  if (score >= 90) {
    message = "Automated bliss.";
  } else if (score >= 50) {
    message = "It builds, mostly.";
  } else {
    message = "Works on my machine?";
  }

  return {
    score: score >= 90 ? 100 : score >= 50 ? 60 : 0,
    status: score >= 90 ? "green" : score >= 50 ? "yellow" : "red",
    message,
    checks,
  };
}

function generateSummary(grade: string): string {
  if (grade === "A") return "Ship it. This repo is a shining example of engineering discipline.";
  if (grade === "B") return "Acceptable, but messy. A little spring cleaning wouldn't hurt.";
  if (grade === "C") return "Technical Debt Factory. Proceed with caution.";
  return "Burn it down. Or fix it. But probably burn it down.";
}
