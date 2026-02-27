import { describe, it, expect } from "vitest";
import { scoreRepo, Report, CategoryScore } from "./heuristics";
import { RepoEvidence, FileNode, AdrFile, PrMetrics } from "./scanner";
import { resolveConfig } from "./config";
import { emptyVulnerabilityReport } from "./dependencies";

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
    hasGovernance: false,
    hasAgents: false,
    adrCount: 0,
    adrs: [],
    diagramCount: 0,
    diagrams: [],
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
        totalDeps: 0,
        vulnerabilities: emptyVulnerabilityReport(),
    },
    guardrails: {
      hasBranchProtection: false,
      requiresReviews: false,
      requiredReviewers: 0,
      requiresStatusChecks: false,
      statusChecks: [],
      hasDependabot: false,
      hasSecretScanning: false,
      hasCodeScanning: false,
      hasSnyk: false,
      snykDetails: [],
    }
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
          totalDeps: 0,
          vulnerabilities: emptyVulnerabilityReport(),
      }
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

  describe("config overrides", () => {
    it("custom grade thresholds shift grading", () => {
      // With stricter thresholds, a perfect repo should still be A
      const strict = resolveConfig({ gradeThresholds: { A: 95, B: 80, C: 60 } });
      const perfectEvidence: RepoEvidence = {
        ...emptyEvidence,
        hasReadme: true,
        readmeContent: "a".repeat(1001),
        hasCodeowners: true,
        hasWorkflows: true,
        hasLicense: true,
        hasContributing: true,
        hasPrTemplate: true,
        adrCount: 5,
        adrs: [{ date: "2024-01-01" } as AdrFile],
        diagramCount: 1,
        prMetrics: { mergedCount: 10, avgLeadTimeHours: 12 },
        dependencies: { audits: [], outdatedCount: 0, majorCount: 0, minorCount: 0, patchCount: 0, totalDeps: 0, vulnerabilities: emptyVulnerabilityReport() },
      };
      const report = scoreRepo(perfectEvidence, strict);
      expect(report.grade).toBe("A");

      // A middling score that was B under defaults becomes C under strict thresholds
      const lenient = resolveConfig({ gradeThresholds: { A: 60, B: 40, C: 20 } });
      const middlingEvidence: RepoEvidence = {
        ...emptyEvidence,
        hasReadme: true,
        readmeContent: "short",
        hasLicense: true,
        adrCount: 1,
        adrs: [],
      };
      const reportLenient = scoreRepo(middlingEvidence, lenient);
      const reportDefault = scoreRepo(middlingEvidence);
      // Under lenient thresholds, a repo that was F becomes better graded
      expect(reportLenient.grade).not.toBe("F");
      expect(reportDefault.grade).toBe("F");
    });

    it("custom category weights change total score", () => {
      // Weight decisions at 100, everything else at 0
      const decisionsOnly = resolveConfig({
        categoryWeights: { decisions: 100, architecture: 0, governance: 0, delivery: 0, dependencies: 0 },
      });

      const evidence: RepoEvidence = {
        ...emptyEvidence,
        adrCount: 5,
        adrs: [{ date: "2024-01-01" } as AdrFile],
      };

      const report = scoreRepo(evidence, decisionsOnly);
      // Decisions score is 100 (green), so total should be 100
      expect(report.totalScore).toBe(100);
      expect(report.grade).toBe("A");

      // With default weights, the same evidence gives a low score
      const defaultReport = scoreRepo(evidence);
      expect(defaultReport.totalScore).toBeLessThan(50);
    });

    it("custom scoring points change category scores", () => {
      const config = resolveConfig({
        scoring: {
          governance: {
            // Make codeowners worth everything
            codeownersPoints: 100,
            licensePoints: 0,
            contributingPoints: 0,
          },
        },
      });

      // Only CODEOWNERS, no license or contributing
      const evidence: RepoEvidence = {
        ...emptyEvidence,
        hasCodeowners: true,
      };

      const report = scoreRepo(evidence, config);
      // 100 points >= greenThreshold (80) → green score (100)
      expect(report.categories.governance.score).toBe(100);
      expect(report.categories.governance.status).toBe("green");

      // With defaults, CODEOWNERS alone = 40 → yellow
      const defaultReport = scoreRepo(evidence);
      expect(defaultReport.categories.governance.score).toBe(50);
      expect(defaultReport.categories.governance.status).toBe("yellow");
    });
  });
});
