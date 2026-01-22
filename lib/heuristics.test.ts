import { describe, it, expect } from "vitest";
import { scoreRepo } from "./heuristics";
import { RepoEvidence, AdrFile } from "./scanner";

describe("heuristics", () => {
  const emptyEvidence: RepoEvidence = {
    owner: "test",
    repo: "test",
    tree: [],
    hasReadme: false,
    hasCodeowners: false,
    hasWorkflows: false,
    hasLicense: false,
    hasContributing: false,
    hasPrTemplate: false,
    adrCount: 0,
    adrs: [],
    diagramCount: 0,
    prMetrics: {
      avgLeadTimeHours: 0,
      mergedCount: 0,
    },
    dependencies: {
        audits: [],
        outdatedCount: 0,
        majorCount: 0,
        minorCount: 0,
        patchCount: 0,
        totalDeps: 0
    },
    diagrams: []
  };

  it("should give a failing grade for an empty repo", () => {
    const report = scoreRepo(emptyEvidence);
    expect(report.totalScore).toBeLessThan(50);
    expect(report.grade).toBe("F");
    expect(report.categories.decisions.score).toBe(0);
    expect(report.categories.architecture.score).toBe(0);
    expect(report.categories.governance.score).toBe(0);
    expect(report.categories.delivery.score).toBe(0);
  });

  it("should give a perfect score for a perfect repo", () => {
    const perfectEvidence: RepoEvidence = {
      ...emptyEvidence,
      hasReadme: true,
      readmeContent: "a".repeat(1001), // Long readme
      hasCodeowners: true,
      hasWorkflows: true,
      hasLicense: true,
      hasContributing: true,
      hasPrTemplate: true,
      adrCount: 5,
      adrs: [{ date: "2024-01-01" } as AdrFile], // Recent decision
      diagramCount: 1,
      prMetrics: {
        mergedCount: 10,
        avgLeadTimeHours: 12, // < 24h
      },
      dependencies: {
          audits: [],
          outdatedCount: 0,
          majorCount: 0,
          minorCount: 0,
          patchCount: 0,
          totalDeps: 0
      },
      diagrams: []
    };

    const report = scoreRepo(perfectEvidence);
    expect(report.totalScore).toBe(100);
    expect(report.grade).toBe("A");
    expect(report.categories.decisions.score).toBe(100);
    expect(report.categories.architecture.score).toBe(100);
    expect(report.categories.governance.score).toBe(100);
    expect(report.categories.delivery.score).toBe(100);
  });

  it("should score decisions correctly", () => {
    // Case 1: Minimal ADRs
    const evidence = { ...emptyEvidence, adrCount: 1 };
    const report = scoreRepo(evidence);
    expect(report.categories.decisions.score).toBe(60);

    // Case 2: Many ADRs but no dates (Score 80 -> Normalized to 60)
    const evidence2 = { ...emptyEvidence, adrCount: 3 };
    const report2 = scoreRepo(evidence2);
    expect(report2.categories.decisions.score).toBe(60);

    // Case 3: Many ADRs with dates (Score 100 -> Normalized to 100)
    const evidence3 = { ...emptyEvidence, adrCount: 3, adrs: [{ date: "2024-01-01" } as AdrFile] };
    const report3 = scoreRepo(evidence3);
    expect(report3.categories.decisions.score).toBe(100);
  });
});
