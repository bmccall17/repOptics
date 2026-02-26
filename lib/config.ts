// ─── Config Args Layer ───────────────────────────────────────────────
// Every scoring threshold, weight, point allocation, and personality
// string that was formerly hardcoded inline is captured here as a
// named, typed default.  The resolveConfig() function deep-merges
// partial overrides onto these defaults so callers can customize
// behavior without editing source code.

// ─── Utility type ────────────────────────────────────────────────────

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ─── Config schema ───────────────────────────────────────────────────

export type RepOpticsConfig = {
  gradeThresholds: {
    A: number;
    B: number;
    C: number;
  };

  categoryWeights: {
    decisions: number;
    architecture: number;
    governance: number;
    delivery: number;
    dependencies: number;
  };

  scoring: {
    decisions: {
      adrExistsPoints: number;
      multipleAdrsPoints: number;
      datedAdrsPoints: number;
      greenThreshold: number;
      yellowThreshold: number;
      greenScore: number;
      yellowScore: number;
    };
    architecture: {
      readmeShortPoints: number;
      readmeLongPoints: number;
      diagramPoints: number;
      readmeCharThreshold: number;
      greenThreshold: number;
      yellowThreshold: number;
      greenScore: number;
      yellowScore: number;
    };
    governance: {
      codeownersPoints: number;
      licensePoints: number;
      contributingPoints: number;
      greenThreshold: number;
      yellowThreshold: number;
      greenScore: number;
      yellowScore: number;
    };
    delivery: {
      workflowsPoints: number;
      prTemplatePoints: number;
      leadTimeFastPoints: number;
      leadTimeMediumPoints: number;
      leadTimeFastHours: number;
      leadTimeMediumHours: number;
      noPrsBaselinePoints: number;
      greenThreshold: number;
      yellowThreshold: number;
      greenScore: number;
      yellowScore: number;
    };
    dependencies: {
      majorPenalty: number;
      minorPenalty: number;
      greenThreshold: number;
      yellowThreshold: number;
      minorPartialThreshold: number;
      outdatedPartialThreshold: number;
    };
  };

  personality: {
    decisions: {
      green: string;
      yellow: string;
      red: string;
    };
    architecture: {
      green: string;
      yellow: string;
      red: string;
    };
    governance: {
      green: string;
      yellow: string;
      red: string;
    };
    delivery: {
      green: string;
      yellow: string;
      red: string;
    };
    dependencies: {
      green: string;
      yellowTemplate: string;
      redTemplate: string;
    };
    gradeSummaries: {
      A: string;
      B: string;
      C: string;
      F: string;
    };
  };

  scannerLimits: {
    maxAdrsToScan: number;
    maxDiagramsToScan: number;
    maxPrsToFetch: number;
    maxDepsToAudit: number;
    depFetchTimeoutMs: number;
    octokitTimeoutMs: number;
  };

  recommendations: {
    readmeExpandMinChars: number;
  };
};

// ─── Default config (reproduces all current hardcoded behavior) ──────

export const DEFAULT_CONFIG: RepOpticsConfig = Object.freeze({
  gradeThresholds: Object.freeze({
    A: 90,
    B: 70,
    C: 50,
  }),

  categoryWeights: Object.freeze({
    decisions: 20,
    architecture: 20,
    governance: 20,
    delivery: 20,
    dependencies: 20,
  }),

  scoring: Object.freeze({
    decisions: Object.freeze({
      adrExistsPoints: 50,
      multipleAdrsPoints: 30,
      datedAdrsPoints: 20,
      greenThreshold: 100,
      yellowThreshold: 50,
      greenScore: 100,
      yellowScore: 60,
    }),
    architecture: Object.freeze({
      readmeShortPoints: 20,
      readmeLongPoints: 50,
      diagramPoints: 50,
      readmeCharThreshold: 1000,
      greenThreshold: 80,
      yellowThreshold: 40,
      greenScore: 100,
      yellowScore: 50,
    }),
    governance: Object.freeze({
      codeownersPoints: 40,
      licensePoints: 30,
      contributingPoints: 30,
      greenThreshold: 80,
      yellowThreshold: 40,
      greenScore: 100,
      yellowScore: 50,
    }),
    delivery: Object.freeze({
      workflowsPoints: 50,
      prTemplatePoints: 30,
      leadTimeFastPoints: 20,
      leadTimeMediumPoints: 10,
      leadTimeFastHours: 24,
      leadTimeMediumHours: 72,
      noPrsBaselinePoints: 10,
      greenThreshold: 90,
      yellowThreshold: 50,
      greenScore: 100,
      yellowScore: 60,
    }),
    dependencies: Object.freeze({
      majorPenalty: 15,
      minorPenalty: 5,
      greenThreshold: 90,
      yellowThreshold: 60,
      minorPartialThreshold: 3,
      outdatedPartialThreshold: 5,
    }),
  }),

  personality: Object.freeze({
    decisions: Object.freeze({
      green: "History will remember you.",
      yellow: "A few decisions recorded. Better than telepathy.",
      red: "Zero ADRs. Decisions made by hallway shouts?",
    }),
    architecture: Object.freeze({
      green: "Well documented. A joy to read.",
      yellow: "Basic README found, but where are the pictures?",
      red: "No README. Good luck, future maintainers.",
    }),
    governance: Object.freeze({
      green: "Lawful Good.",
      yellow: "Chaotic Neutral. Some rules exist.",
      red: "Anarchy. Who owns this? Nobody knows.",
    }),
    delivery: Object.freeze({
      green: "Automated bliss.",
      yellow: "It builds, mostly.",
      red: "Works on my machine?",
    }),
    dependencies: Object.freeze({
      green: "Fresh as a daisy.",
      yellowTemplate: "{outdatedCount} updates available.",
      redTemplate: "Dep rot detected. {majorCount} major updates.",
    }),
    gradeSummaries: Object.freeze({
      A: "Ship it. This repo is a shining example of engineering discipline.",
      B: "Acceptable, but messy. A little spring cleaning wouldn't hurt.",
      C: "Technical Debt Factory. Proceed with caution.",
      F: "Burn it down. Or fix it. But probably burn it down.",
    }),
  }),

  scannerLimits: Object.freeze({
    maxAdrsToScan: 20,
    maxDiagramsToScan: 10,
    maxPrsToFetch: 20,
    maxDepsToAudit: 33,
    depFetchTimeoutMs: 5000,
    octokitTimeoutMs: 10000,
  }),

  recommendations: Object.freeze({
    readmeExpandMinChars: 500,
  }),
}) as RepOpticsConfig;

// ─── Deep merge ──────────────────────────────────────────────────────

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  overrides: DeepPartial<T>
): T {
  const result = { ...base };
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const val = overrides[key];
    if (
      val !== undefined &&
      val !== null &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(
        base[key] as Record<string, unknown>,
        val as DeepPartial<Record<string, unknown>>
      ) as T[keyof T];
    } else if (val !== undefined) {
      result[key] = val as T[keyof T];
    }
  }
  return result;
}

/**
 * Merge partial config overrides onto DEFAULT_CONFIG.
 * Returns a new config object — never mutates the defaults.
 */
export function resolveConfig(
  overrides?: DeepPartial<RepOpticsConfig>
): RepOpticsConfig {
  if (!overrides) return DEFAULT_CONFIG;
  return deepMerge(
    DEFAULT_CONFIG as unknown as Record<string, unknown>,
    overrides as DeepPartial<Record<string, unknown>>
  ) as unknown as RepOpticsConfig;
}
