import type { Report } from "./heuristics";
import type { RepoEvidence } from "./scanner";
import type { Recommendation } from "./recommendations";

export type ExportSection =
  | "summary"
  | "health"
  | "decisions"
  | "delivery"
  | "governance"
  | "guardrails"
  | "dependencies"
  | "repoMap"
  | "recommendations";

export const ALL_SECTIONS: { key: ExportSection; label: string }[] = [
  { key: "summary", label: "Overall Summary" },
  { key: "health", label: "Health Checklist" },
  { key: "decisions", label: "Decision Optics" },
  { key: "delivery", label: "Delivery Metrics" },
  { key: "governance", label: "Governance" },
  { key: "guardrails", label: "Guardrails & Security" },
  { key: "dependencies", label: "Dependency Health" },
  { key: "repoMap", label: "Repository Map" },
  { key: "recommendations", label: "Recommendations" },
];

interface ExportData {
  report: Report;
  evidence: RepoEvidence;
  recommendations: Recommendation[];
}

// ── JSON Export ────────────────────────────────────────────────

export function exportReportAsJson(
  data: ExportData,
  selected: Set<ExportSection>
): string {
  const { report, evidence, recommendations } = data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: Record<string, any> = {
    metadata: {
      repo: `${evidence.owner}/${evidence.repo}`,
      exportedAt: new Date().toISOString(),
      sectionsIncluded: Array.from(selected),
    },
  };

  if (selected.has("summary")) {
    out.summary = {
      grade: report.grade,
      score: report.totalScore,
      text: report.summary,
      categories: Object.fromEntries(
        Object.entries(report.categories).map(([k, v]) => [
          k,
          { score: v.score, status: v.status, message: v.message },
        ])
      ),
    };
  }

  if (selected.has("health")) {
    out.healthChecklist = Object.fromEntries(
      Object.entries(report.categories).map(([k, v]) => [
        k,
        v.checks.map((c) => ({
          id: c.id,
          name: c.name,
          status: c.status,
          whyItMatters: c.whyItMatters,
          impact: c.impact,
          fix: c.fix,
          details: c.details ?? null,
        })),
      ])
    );
  }

  if (selected.has("decisions")) {
    out.decisions = evidence.adrs.map((a) => ({
      title: a.title ?? a.path,
      status: a.status ?? "Unknown",
      date: a.date ?? null,
      path: a.path,
    }));
  }

  if (selected.has("delivery")) {
    out.delivery = {
      avgLeadTimeHours: evidence.prMetrics.avgLeadTimeHours,
      mergedCount: evidence.prMetrics.mergedCount,
    };
  }

  if (selected.has("governance")) {
    out.governance = {
      hasCodeowners: evidence.hasCodeowners,
      hasContributing: evidence.hasContributing,
      hasGovernance: evidence.hasGovernance,
      hasAgents: evidence.hasAgents,
      hasLicense: evidence.hasLicense,
    };
  }

  if (selected.has("guardrails")) {
    out.guardrails = { ...evidence.guardrails };
  }

  if (selected.has("dependencies")) {
    out.dependencies = {
      totalScanned: evidence.dependencies.audits.length,
      outdatedCount: evidence.dependencies.outdatedCount,
      majorCount: evidence.dependencies.majorCount,
      minorCount: evidence.dependencies.minorCount,
      patchCount: evidence.dependencies.patchCount,
      audits: evidence.dependencies.audits
        .filter((a) => a.severity !== "none")
        .map((a) => ({
          package: a.package,
          currentVersion: a.currentVersion,
          latestVersion: a.latestVersion,
          severity: a.severity,
          impact: a.impact,
        })),
    };
  }

  if (selected.has("repoMap")) {
    out.repoMap = evidence.tree.map((n) => n.path);
  }

  if (selected.has("recommendations")) {
    out.recommendations = recommendations.map((r) => ({
      id: r.id,
      category: r.category,
      priority: r.priority,
      type: r.type,
      effort: r.effort,
      title: r.title,
      rationale: r.rationale,
      action: r.action,
      filePath: r.filePath,
    }));
  }

  return JSON.stringify(out, null, 2);
}

// ── Markdown Export ────────────────────────────────────────────

export function exportReportAsMarkdown(
  data: ExportData,
  selected: Set<ExportSection>
): string {
  const { report, evidence, recommendations } = data;
  const lines: string[] = [];

  lines.push(`# repOptics Report: ${evidence.owner}/${evidence.repo}`);
  lines.push("");

  if (selected.has("summary")) {
    lines.push(`## Overall: ${report.grade} (${report.totalScore}/100)`);
    lines.push("");
    lines.push(`> ${report.summary}`);
    lines.push("");
    lines.push("| Category | Score | Status |");
    lines.push("|----------|-------|--------|");
    for (const [k, v] of Object.entries(report.categories)) {
      lines.push(`| ${k} | ${v.score} | ${v.status} |`);
    }
    lines.push("");
  }

  if (selected.has("health")) {
    lines.push("## Health Checklist");
    lines.push("");
    for (const [cat, v] of Object.entries(report.categories)) {
      lines.push(`### ${cat}`);
      lines.push("");
      for (const c of v.checks) {
        const icon = c.status === "done" ? "+" : c.status === "partial" ? "~" : "-";
        lines.push(`- [${icon}] **${c.name}**${c.details ? ` (${c.details})` : ""}`);
        lines.push(`  - Why: ${c.whyItMatters}`);
        lines.push(`  - Impact: ${c.impact}`);
        lines.push(`  - Fix: ${c.fix}`);
      }
      lines.push("");
    }
  }

  if (selected.has("decisions")) {
    lines.push("## Decision Optics");
    lines.push("");
    if (evidence.adrs.length === 0) {
      lines.push("_No decisions recorded._");
    } else {
      lines.push("| Title | Status | Date |");
      lines.push("|-------|--------|------|");
      for (const a of evidence.adrs) {
        lines.push(`| ${a.title ?? a.path} | ${a.status ?? "Unknown"} | ${a.date ?? "—"} |`);
      }
    }
    lines.push("");
  }

  if (selected.has("delivery")) {
    lines.push("## Delivery Metrics");
    lines.push("");
    lines.push(`- **Avg PR Lead Time**: ${evidence.prMetrics.mergedCount > 0 ? `${evidence.prMetrics.avgLeadTimeHours}h` : "N/A"}`);
    lines.push(`- **Merged PRs (sampled)**: ${evidence.prMetrics.mergedCount}`);
    lines.push("");
  }

  if (selected.has("governance")) {
    lines.push("## Governance");
    lines.push("");
    lines.push(`- CODEOWNERS: ${evidence.hasCodeowners ? "Present" : "Missing"}`);
    lines.push(`- CONTRIBUTING.md: ${evidence.hasContributing ? "Present" : "Missing"}`);
    lines.push(`- GOVERNANCE.md: ${evidence.hasGovernance ? "Present" : "Missing"}`);
    lines.push(`- AGENTS.md: ${evidence.hasAgents ? "Present" : "Missing"}`);
    lines.push(`- LICENSE: ${evidence.hasLicense ? "Present" : "Missing"}`);
    lines.push("");
  }

  if (selected.has("guardrails")) {
    lines.push("## Guardrails & Security");
    lines.push("");
    const g = evidence.guardrails;
    lines.push(`- Branch Protection: ${g.hasBranchProtection ? "Enabled" : "Not detected"}`);
    lines.push(`- Required Reviews: ${g.requiresReviews ? `${g.requiredReviewers} reviewer(s)` : "Not required"}`);
    lines.push(`- CI Status Checks: ${g.requiresStatusChecks ? g.statusChecks.join(", ") : "Not required"}`);
    lines.push(`- Dependabot: ${g.hasDependabot ? "Configured" : "Not found"}`);
    lines.push(`- Secret Scanning: ${g.hasSecretScanning ? "Enabled" : "Not detected"}`);
    lines.push(`- Code Scanning: ${g.hasCodeScanning ? "Workflow found" : "Not found"}`);
    lines.push("");
  }

  if (selected.has("dependencies")) {
    lines.push("## Dependency Health");
    lines.push("");
    const d = evidence.dependencies;
    lines.push(`Total: ${d.audits.length} | Outdated: ${d.outdatedCount} (${d.majorCount} major, ${d.minorCount} minor, ${d.patchCount} patch)`);
    lines.push("");
    const outdated = d.audits.filter((a) => a.severity !== "none");
    if (outdated.length > 0) {
      lines.push("| Package | Current | Latest | Severity |");
      lines.push("|---------|---------|--------|----------|");
      for (const a of outdated) {
        lines.push(`| ${a.package} | ${a.currentVersion} | ${a.latestVersion} | ${a.severity} |`);
      }
      lines.push("");
    }
  }

  if (selected.has("repoMap")) {
    lines.push("## Repository Map");
    lines.push("");
    lines.push("```");
    for (const n of evidence.tree.slice(0, 100)) {
      lines.push(n.path);
    }
    if (evidence.tree.length > 100) {
      lines.push(`... and ${evidence.tree.length - 100} more`);
    }
    lines.push("```");
    lines.push("");
  }

  if (selected.has("recommendations")) {
    lines.push("## Recommendations");
    lines.push("");
    if (recommendations.length === 0) {
      lines.push("_No recommendations._");
    } else {
      for (const r of recommendations) {
        lines.push(`### ${r.title}`);
        lines.push("");
        lines.push(`- **Priority**: ${r.priority} | **Effort**: ${r.effort} | **Type**: ${r.type}`);
        lines.push(`- **Rationale**: ${r.rationale}`);
        lines.push(`- **Action**: ${r.action}`);
        lines.push(`- **File**: \`${r.filePath}\``);
        lines.push("");
      }
    }
  }

  lines.push("---");
  lines.push("_Generated by [repOptics](https://github.com/bmccall17/repOptics)_");

  return lines.join("\n");
}
