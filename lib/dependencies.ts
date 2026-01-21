export type Severity = "none" | "patch" | "minor" | "major" | "unknown";

export type DependencyAudit = {
  package: string;
  currentVersion: string;
  latestVersion: string;
  severity: Severity;
  impact: string;
};

export type DependencyReport = {
  audits: DependencyAudit[];
  outdatedCount: number;
  majorCount: number;
  minorCount: number;
  patchCount: number;
  totalDeps: number;
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

export async function auditDependencies(packageJsonContent: string): Promise<DependencyReport> {
  let pkg;
  try {
    pkg = JSON.parse(packageJsonContent);
  } catch (e) {
    console.error("Failed to parse package.json", e);
    return { audits: [], outdatedCount: 0, majorCount: 0, minorCount: 0, patchCount: 0, totalDeps: 0 };
  }

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const audits: DependencyAudit[] = [];

  // Limit to top 33 to avoid timeouts/rate limits
  const entries = Object.entries(deps).slice(0, 33);

  // Create an array of promises
  const promises = entries.map(async ([name, version]) => {
      // @ts-ignore
      const v = version as string;
      try {
          const res = await fetch(`https://registry.npmjs.org/${name}/latest`);
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
      totalDeps: Object.keys(deps).length
  };
}
