export type Severity = "none" | "patch" | "minor" | "major" | "unknown";

export type DependencyAudit = {
  package: string;
  currentVersion: string;
  latestVersion: string;
  severity: Severity;
  impact: string;
};

export type VulnSeverity = "critical" | "high" | "moderate" | "low" | "info";

export type VulnerabilityAdvisory = {
  id: number;
  title: string;
  severity: VulnSeverity;
  url: string;
  moduleName: string;
  vulnerableVersions: string;
};

export type VulnerabilityReport = {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  info: number;
  total: number;
  advisories: VulnerabilityAdvisory[];
};

export type DependencyReport = {
  audits: DependencyAudit[];
  outdatedCount: number;
  majorCount: number;
  minorCount: number;
  patchCount: number;
  totalDeps: number;
  vulnerabilities: VulnerabilityReport;
};

// Helper to remove ^ or ~ from version string
function cleanVersion(version: string): string {
  return version.replace(/[\^~]/g, "");
}

function determineSeverity(current: string, latest: string): Severity {
  const currentClean = cleanVersion(current);
  const latestClean = cleanVersion(latest);

  if (currentClean === latestClean) return "none";

  const [cMajor, cMinor, cPatch] = currentClean.split(".").map(Number);
  const [lMajor, lMinor, lPatch] = latestClean.split(".").map(Number);

  if (lMajor > cMajor) return "major";
  if (lMinor > cMinor) return "minor";
  if (lPatch > cPatch) return "patch";

  // If current is somehow "newer" or parsing fails, return unknown or none
  if (isNaN(cMajor) || isNaN(lMajor)) return "unknown";

  return "none";
}

function getImpact(severity: Severity): string {
    switch (severity) {
        case "major":
            return "High Risk: Breaking changes likely. Read changelog carefully.";
        case "minor":
            return "Medium Risk: New features. Should be backward compatible.";
        case "patch":
            return "Low Risk: Bug fixes. Safe to update.";
        case "unknown":
            return "Unknown: Version mismatch or invalid format.";
        default:
            return "Up to date.";
    }
}

export async function auditDependencies(
  packageJsonContent: string,
  limits?: { maxDeps?: number; timeoutMs?: number }
): Promise<DependencyReport> {
  let pkg;
  try {
    pkg = JSON.parse(packageJsonContent);
  } catch (e) {
    console.error("Failed to parse package.json", e);
    return { audits: [], outdatedCount: 0, majorCount: 0, minorCount: 0, patchCount: 0, totalDeps: 0, vulnerabilities: emptyVulnerabilityReport() };
  }

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const audits: DependencyAudit[] = [];

  const maxDeps = limits?.maxDeps ?? 33;
  const entries = Object.entries(deps).slice(0, maxDeps);

  // Create an array of promises
  const promises = entries.map(async ([name, version]) => {
      const v = version as string;
      try {
          const timeoutMs = limits?.timeoutMs ?? 5000;
          const res = await fetch(`https://registry.npmjs.org/${name}/latest`, {
            signal: AbortSignal.timeout(timeoutMs)
          });
          if (!res.ok) {
               audits.push({
                  package: name,
                  currentVersion: v,
                  latestVersion: "unknown",
                  severity: "unknown",
                  impact: "Could not fetch latest version"
               });
               return;
          }
          const data = await res.json();
          const latest = data.version;
          const severity = determineSeverity(v, latest);

          audits.push({
              package: name,
              currentVersion: v,
              latestVersion: latest,
              severity,
              impact: getImpact(severity)
          });
      } catch (e) {
          audits.push({
              package: name,
              currentVersion: v,
              latestVersion: "error",
              severity: "unknown",
              impact: "Network error checking version"
          });
      }
  });

  await Promise.all(promises);

  const majorCount = audits.filter(a => a.severity === "major").length;
  const minorCount = audits.filter(a => a.severity === "minor").length;
  const patchCount = audits.filter(a => a.severity === "patch").length;
  const outdatedCount = majorCount + minorCount + patchCount;

  return {
      audits: audits.sort((a, b) => {
          // Sort by severity (Major -> Minor -> Patch -> None)
          const order = { major: 0, minor: 1, patch: 2, unknown: 3, none: 4 };
          return order[a.severity] - order[b.severity];
      }),
      outdatedCount,
      majorCount,
      minorCount,
      patchCount,
      totalDeps: Object.keys(deps).length,
      vulnerabilities: emptyVulnerabilityReport(),
  };
}

export function emptyVulnerabilityReport(): VulnerabilityReport {
  return { critical: 0, high: 0, moderate: 0, low: 0, info: 0, total: 0, advisories: [] };
}

export async function auditVulnerabilities(
  packageJsonContent: string,
  timeoutMs = 10000
): Promise<VulnerabilityReport> {
  const report = emptyVulnerabilityReport();

  let pkg;
  try {
    pkg = JSON.parse(packageJsonContent);
  } catch {
    return report;
  }

  const allDeps: Record<string, string[]> = {};
  for (const [name, version] of Object.entries({
    ...pkg.dependencies,
    ...pkg.devDependencies,
  })) {
    const cleaned = cleanVersion(version as string);
    if (cleaned) {
      allDeps[name] = [cleaned];
    }
  }

  if (Object.keys(allDeps).length === 0) return report;

  try {
    const res = await fetch(
      "https://registry.npmjs.org/-/npm/v1/security/advisories/bulk",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allDeps),
        signal: AbortSignal.timeout(timeoutMs),
      }
    );

    if (!res.ok) return report;

    const data = await res.json();

    for (const [, advisory] of Object.entries(data)) {
      const a = advisory as {
        id: number;
        title: string;
        severity: string;
        url: string;
        module_name: string;
        vulnerable_versions: string;
      };

      const severity = a.severity as VulnSeverity;
      if (severity in report && typeof report[severity] === "number") {
        report[severity]++;
      }
      report.total++;

      report.advisories.push({
        id: a.id,
        title: a.title,
        severity,
        url: a.url,
        moduleName: a.module_name,
        vulnerableVersions: a.vulnerable_versions,
      });
    }
  } catch {
    // Graceful degradation: return empty report on network/parse failure
  }

  return report;
}
