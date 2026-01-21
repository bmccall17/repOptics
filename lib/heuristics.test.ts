import { describe, it, expect } from "vitest";
import { scoreRepo, Report, CategoryScore } from "./heuristics";
import { RepoEvidence, FileNode, AdrFile, PrMetrics } from "./scanner";

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
    const evidence = { ...emptyEvidence, adrCount: 1 };
    const report = scoreRepo(evidence);
    expect(report.categories.decisions.score).toBe(60); // 50 for count > 0, + 0 for > 2, + 0 for dates -> but code says: if score >= 50 return 60
    // Logic check:
    // score += 50 (adrCount > 0)
    // score < 100
    // if score >= 50 return { score: 60, ... }

    // Test for higher score
    const evidence2 = { ...emptyEvidence, adrCount: 3 };
    const report2 = scoreRepo(evidence2);
    // score = 50 + 30 = 80.
    // if score >= 50 return 60. Wait.
    // The logic in heuristics.ts is:
    // if (score >= 100) return 100
    // if (score >= 50) return 60
    // So 80 results in 60.
    // To get 100, we need dates.

    expect(report2.categories.decisions.score).toBe(60);

    const evidence3 = { ...emptyEvidence, adrCount: 3, adrs: [{ date: "2024-01-01" } as AdrFile] };
    const report3 = scoreRepo(evidence3);
    // score = 50 + 30 + 20 = 100.
    expect(report3.categories.decisions.score).toBe(100);
  });
});
