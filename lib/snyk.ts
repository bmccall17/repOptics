// Snyk API client — fetches project vulnerability data for Port.io integration

export type SnykVulnCounts = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
};

export type SnykProjectSummary = {
  projectId: string;
  projectName: string;
  issueCountsBySeverity: SnykVulnCounts;
  lastTestedDate: string | null;
};

export type SnykRepoSummary = {
  repoName: string;
  projects: SnykProjectSummary[];
  aggregatedCounts: SnykVulnCounts;
  lastTested: string | null;
};

async function snykRequest(
  path: string,
  token: string,
  orgId: string,
  version: string = "2024-10-15"
): Promise<unknown> {
  const res = await fetch(
    `https://api.snyk.io/rest/orgs/${orgId}${path}${path.includes("?") ? "&" : "?"}version=${version}`,
    {
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/vnd.api+json",
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Snyk API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getSnykProjects(
  token: string,
  orgId: string
): Promise<SnykProjectSummary[]> {
  const data = (await snykRequest("/projects?limit=100", token, orgId)) as {
    data: {
      id: string;
      attributes: {
        name: string;
        issue_counts_by_severity: {
          critical: number;
          high: number;
          medium: number;
          low: number;
        };
        last_tested_date: string | null;
      };
    }[];
  };

  return data.data.map((p) => {
    const counts = p.attributes.issue_counts_by_severity;
    return {
      projectId: p.id,
      projectName: p.attributes.name,
      issueCountsBySeverity: {
        critical: counts.critical,
        high: counts.high,
        medium: counts.medium,
        low: counts.low,
        total: counts.critical + counts.high + counts.medium + counts.low,
      },
      lastTestedDate: p.attributes.last_tested_date,
    };
  });
}

export function aggregateByRepo(
  projects: SnykProjectSummary[]
): Map<string, SnykRepoSummary> {
  const byRepo = new Map<string, SnykRepoSummary>();

  for (const project of projects) {
    // Snyk project names are typically "org/repo:path/to/manifest"
    const repoName = project.projectName.split(":")[0];

    let summary = byRepo.get(repoName);
    if (!summary) {
      summary = {
        repoName,
        projects: [],
        aggregatedCounts: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
        lastTested: null,
      };
      byRepo.set(repoName, summary);
    }

    summary.projects.push(project);
    summary.aggregatedCounts.critical += project.issueCountsBySeverity.critical;
    summary.aggregatedCounts.high += project.issueCountsBySeverity.high;
    summary.aggregatedCounts.medium += project.issueCountsBySeverity.medium;
    summary.aggregatedCounts.low += project.issueCountsBySeverity.low;
    summary.aggregatedCounts.total += project.issueCountsBySeverity.total;

    if (
      project.lastTestedDate &&
      (!summary.lastTested || project.lastTestedDate > summary.lastTested)
    ) {
      summary.lastTested = project.lastTestedDate;
    }
  }

  return byRepo;
}
