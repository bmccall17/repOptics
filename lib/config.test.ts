import { describe, it, expect } from "vitest";
import { DEFAULT_CONFIG, resolveConfig } from "./config";

describe("config", () => {
  it("resolveConfig() with no args returns DEFAULT_CONFIG", () => {
    const config = resolveConfig();
    expect(config).toBe(DEFAULT_CONFIG);
  });

  it("resolveConfig(undefined) returns DEFAULT_CONFIG", () => {
    const config = resolveConfig(undefined);
    expect(config).toBe(DEFAULT_CONFIG);
  });

  it("partial override merges correctly at top level", () => {
    const config = resolveConfig({
      gradeThresholds: { A: 95 },
    });

    expect(config.gradeThresholds.A).toBe(95);
    // Other grade thresholds remain at defaults
    expect(config.gradeThresholds.B).toBe(70);
    expect(config.gradeThresholds.C).toBe(50);
    // Other sections remain at defaults
    expect(config.categoryWeights).toEqual(DEFAULT_CONFIG.categoryWeights);
    expect(config.scoring).toEqual(DEFAULT_CONFIG.scoring);
  });

  it("nested partial override works for scoring subsection", () => {
    const config = resolveConfig({
      scoring: {
        decisions: { adrExistsPoints: 75 },
      },
    });

    expect(config.scoring.decisions.adrExistsPoints).toBe(75);
    // Other decisions fields remain at defaults
    expect(config.scoring.decisions.multipleAdrsPoints).toBe(30);
    expect(config.scoring.decisions.datedAdrsPoints).toBe(20);
    // Other scoring sections remain at defaults
    expect(config.scoring.architecture).toEqual(DEFAULT_CONFIG.scoring.architecture);
    expect(config.scoring.governance).toEqual(DEFAULT_CONFIG.scoring.governance);
  });

  it("deep merge does not mutate DEFAULT_CONFIG", () => {
    const originalA = DEFAULT_CONFIG.gradeThresholds.A;
    const originalPoints = DEFAULT_CONFIG.scoring.decisions.adrExistsPoints;

    resolveConfig({
      gradeThresholds: { A: 99 },
      scoring: { decisions: { adrExistsPoints: 999 } },
    });

    expect(DEFAULT_CONFIG.gradeThresholds.A).toBe(originalA);
    expect(DEFAULT_CONFIG.scoring.decisions.adrExistsPoints).toBe(originalPoints);
  });

  it("multiple overrides at different depths merge correctly", () => {
    const config = resolveConfig({
      gradeThresholds: { A: 95, B: 75 },
      categoryWeights: { decisions: 30 },
      scoring: {
        delivery: { workflowsPoints: 60 },
        dependencies: { majorPenalty: 20 },
      },
      scannerLimits: { maxPrsToFetch: 50 },
    });

    expect(config.gradeThresholds.A).toBe(95);
    expect(config.gradeThresholds.B).toBe(75);
    expect(config.gradeThresholds.C).toBe(50);
    expect(config.categoryWeights.decisions).toBe(30);
    expect(config.categoryWeights.architecture).toBe(20);
    expect(config.scoring.delivery.workflowsPoints).toBe(60);
    expect(config.scoring.delivery.prTemplatePoints).toBe(30);
    expect(config.scoring.dependencies.majorPenalty).toBe(20);
    expect(config.scoring.dependencies.minorPenalty).toBe(5);
    expect(config.scannerLimits.maxPrsToFetch).toBe(50);
    expect(config.scannerLimits.maxAdrsToScan).toBe(20);
  });

  it("personality overrides merge correctly", () => {
    const config = resolveConfig({
      personality: {
        gradeSummaries: { A: "Perfect!" },
      },
    });

    expect(config.personality.gradeSummaries.A).toBe("Perfect!");
    expect(config.personality.gradeSummaries.B).toBe(DEFAULT_CONFIG.personality.gradeSummaries.B);
    expect(config.personality.decisions).toEqual(DEFAULT_CONFIG.personality.decisions);
  });
});
