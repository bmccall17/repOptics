import { RepoEvidence } from "./scanner";

export type CategoryScore = {
  score: number; // 0-100
  status: "green" | "yellow" | "red";
  message: string;
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
  const { outdatedCount, majorCount, minorCount } = evidence.dependencies;

  if (majorCount > 0) score -= majorCount * 15;
  if (minorCount > 0) score -= minorCount * 5;

  if (score < 0) score = 0;

  if (score >= 90) return { score: score, status: "green", message: "Fresh as a daisy." };
  if (score >= 60) return { score: score, status: "yellow", message: `${outdatedCount} updates available.` };
  return { score: score, status: "red", message: `Dep rot detected. ${majorCount} major updates.` };
}

function scoreDecisions(evidence: RepoEvidence): CategoryScore {
  let score = 0;
  
  if (evidence.adrCount > 0) score += 50;
  if (evidence.adrCount > 2) score += 30;
  
  // Bonus: Check for recent decisions (MVP: just check if we have dates)
  const hasDates = evidence.adrs.some(a => !!a.date);
  if (hasDates) score += 20;

  if (score >= 100) return { score: 100, status: "green", message: "History will remember you." };
  if (score >= 50) return { score: 60, status: "yellow", message: "A few decisions recorded. Better than telepathy." };
  return { score: 0, status: "red", message: "Zero ADRs. Decisions made by hallway shouts?" };
}

function scoreArchitecture(evidence: RepoEvidence): CategoryScore {
  let score = 0;
  // Readme Check
  if (evidence.hasReadme) {
    if (evidence.readmeContent && evidence.readmeContent.length > 1000) {
      score += 50;
    } else {
      score += 20;
    }
  }

  // Diagrams Check
  if (evidence.diagramCount > 0) {
    score += 50;
  }

  if (score >= 80) return { score: 100, status: "green", message: "Well documented. A joy to read." };
  if (score >= 40) return { score: 50, status: "yellow", message: "Basic README found, but where are the pictures?" };
  return { score: 0, status: "red", message: "No README. Good luck, future maintainers." };
}

function scoreGovernance(evidence: RepoEvidence): CategoryScore {
  let score = 0;
  if (evidence.hasCodeowners) score += 40;
  if (evidence.hasLicense) score += 30;
  if (evidence.hasContributing) score += 30;
  
  if (score >= 80) return { score: 100, status: "green", message: "Lawful Good." };
  if (score >= 40) return { score: 50, status: "yellow", message: "Chaotic Neutral. Some rules exist." };
  return { score: 0, status: "red", message: "Anarchy. Who owns this? Nobody knows." };
}

function scoreDelivery(evidence: RepoEvidence): CategoryScore {
  let score = 0;
  if (evidence.hasWorkflows) score += 50;
  if (evidence.hasPrTemplate) score += 30;
  
  // Bonus: Lead time check (if available)
  // If merged count > 0, we can judge lead time. 
  // < 24h = Good, > 72h = Bad.
  if (evidence.prMetrics.mergedCount > 0) {
      if (evidence.prMetrics.avgLeadTimeHours < 24) score += 20;
      else if (evidence.prMetrics.avgLeadTimeHours < 72) score += 10;
  } else {
      // Neutral if no data
      score += 10;
  }

  if (score >= 90) return { score: 100, status: "green", message: "Automated bliss." };
  if (score >= 50) return { score: 60, status: "yellow", message: "It builds, mostly." };
  return { score: 0, status: "red", message: "Works on my machine?" };
}

function generateSummary(grade: string): string {
  if (grade === "A") return "Ship it. This repo is a shining example of engineering discipline.";
  if (grade === "B") return "Acceptable, but messy. A little spring cleaning wouldn't hurt.";
  if (grade === "C") return "Technical Debt Factory. Proceed with caution.";
  return "Burn it down. Or fix it. But probably burn it down.";
}
