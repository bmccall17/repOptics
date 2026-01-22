import { createOctokit } from "./github";
import { auditDependencies, DependencyReport } from "./dependencies";

export type FileNode = {
  path: string;
  type: "file" | "dir";
  size?: number;
};

export type AdrFile = {
  path: string;
  title?: string;
  status?: string;
  date?: string;
};

export type PrMetrics = {
  avgLeadTimeHours: number; // merged_at - created_at
  mergedCount: number;
};

export type RepoEvidence = {
  owner: string;
  repo: string;
  tree: FileNode[];
  hasReadme: boolean;
  readmeContent?: string;
  hasCodeowners: boolean;
  codeownersContent?: string;
  hasWorkflows: boolean;
  hasLicense: boolean;
  hasContributing: boolean;
  contributingContent?: string;
  hasPrTemplate: boolean;
  hasGovernance: boolean;
  governanceContent?: string;
  hasAgents: boolean;
  agentsContent?: string;
  adrCount: number;
  adrs: AdrFile[];
  diagramCount: number;
  prMetrics: PrMetrics;
  dependencies: DependencyReport;
};

export async function scanRepo(
  owner: string,
  repo: string,
  token?: string
): Promise<RepoEvidence> {
  console.log(`[Scanner] Starting scan for ${owner}/${repo}`);
  if (token) {
    console.log("[Scanner] Using provided GITHUB_TOKEN");
  } else {
    console.log("[Scanner] No GITHUB_TOKEN provided, running unauthenticated (rate limits apply)");
  }

  const octokit = createOctokit(token);

  // 1. Get the repository metadata
  console.log(`[Scanner] Fetching metadata for ${owner}/${repo}`);
  const { data: repoData } = await octokit.rest.repos.get({
    owner,
    repo,
  });

  const defaultBranch = repoData.default_branch;
  console.log(`[Scanner] Default branch: ${defaultBranch}`);

  // 2. Get the full file tree (recursive)
  console.log(`[Scanner] Fetching file tree...`);
  const { data: treeData } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: defaultBranch,
    recursive: "true",
  });
  console.log(`[Scanner] File tree fetched. Items: ${treeData.tree.length}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const files: FileNode[] = treeData.tree.map((node: any) => ({
    path: node.path,
    type: node.type === "blob" ? "file" : "dir",
    size: node.size,
  }));

  // 3. Analyze README
  let readmeContent = "";
  const readmePath = files.find((f) => /^readme/i.test(f.path))?.path;

  if (readmePath) {
    try {
      console.log(`[Scanner] Fetching README content from ${readmePath}`);
      const { data: readmeData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: readmePath,
      });

      if ("content" in readmeData) {
        readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
      }
    } catch (e) {
      console.error("[Scanner] Failed to fetch README content", e);
    }
  }

  // 4. Basic File Heuristics
  const codeownersPath = files.find((f) =>
    /^(CODEOWNERS|\.github\/CODEOWNERS)$/i.test(f.path)
  )?.path;
  const hasCodeowners = !!codeownersPath;
  
  const hasLicense = files.some((f) => /^LICENSE/i.test(f.path));
  
  const contributingPath = files.find((f) =>
    /^(CONTRIBUTING\.md|\.github\/CONTRIBUTING\.md)$/i.test(f.path)
  )?.path;
  const hasContributing = !!contributingPath;

  const governancePath = files.find((f) =>
    /^(GOVERNANCE\.md|\.github\/GOVERNANCE\.md)$/i.test(f.path)
  )?.path;
  const hasGovernance = !!governancePath;

  const agentsPath = files.find((f) =>
    /^(AGENTS\.md)$/i.test(f.path)
  )?.path;
  const hasAgents = !!agentsPath;

  const hasWorkflows = files.some((f) =>
    f.path.startsWith(".github/workflows/") && (f.path.endsWith(".yml") || f.path.endsWith(".yaml"))
  );
  
  const hasPrTemplate = files.some((f) =>
    /pull_request_template/i.test(f.path)
  );

  const adrFiles = files.filter((f) =>
    /docs\/adr\//i.test(f.path) || /doc\/adr\//i.test(f.path) || /docs\/architecture\/decisions\//i.test(f.path)
  );
  const adrCount = adrFiles.length;

  const diagramCount = files.filter((f) =>
    /\.(puml|mermaid|drawio|excalidraw)$/i.test(f.path) || /docs\/diagrams\//i.test(f.path)
  ).length;

  // 4.1 Fetch additional content (Codeowners, Contributing, etc)
  let codeownersContent, contributingContent, governanceContent, agentsContent;

  const contentFetches = [
    { path: codeownersPath, setter: (c: string) => codeownersContent = c },
    { path: contributingPath, setter: (c: string) => contributingContent = c },
    { path: governancePath, setter: (c: string) => governanceContent = c },
    { path: agentsPath, setter: (c: string) => agentsContent = c },
  ];

  await Promise.all(contentFetches.map(async ({ path, setter }) => {
    if (!path) return;
    try {
      const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
      if ("content" in data) {
        setter(Buffer.from(data.content, "base64").toString("utf-8"));
      }
    } catch (e) {
      console.error(`[Scanner] Failed to fetch ${path}`, e);
    }
  }));

  // 5. Deep Scan: Parse ADRs (Top 20)
  const parsedAdrs: AdrFile[] = [];
  const adrsToScan = adrFiles.slice(0, 20);
  
  if (adrsToScan.length > 0) {
    console.log(`[Scanner] Parsing ${adrsToScan.length} ADRs...`);
  }

  // Parallel fetch for speed
  await Promise.all(adrsToScan.map(async (file) => {
    try {
      const { data: contentData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: file.path,
      });

      if ("content" in contentData) {
        const text = Buffer.from(contentData.content, "base64").toString("utf-8");
        // Simple heuristic parsing
        const titleMatch = text.match(/^#\s+(.+)$/m);
        const statusMatch = text.match(/Status:\s*([\w\s-]+)/i);
        const dateMatch = text.match(/Date:\s*(\d{4}-\d{2}-\d{2})/);

        parsedAdrs.push({
          path: file.path,
          title: titleMatch ? titleMatch[1].trim() : file.path.split("/").pop(),
          status: statusMatch ? statusMatch[1].trim() : "Unknown",
          date: dateMatch ? dateMatch[1] : undefined,
        });
      }
    } catch (e) {
      console.error(`[Scanner] Failed to parse ADR ${file.path}`, e);
    }
  }));

  // Sort ADRs by path or date to keep them in order
  parsedAdrs.sort((a, b) => a.path.localeCompare(b.path));

  // 6. Deep Scan: PR Metrics
  console.log(`[Scanner] Fetching PR metrics...`);
  let avgLeadTimeHours = 0;
  let mergedCount = 0;
  try {
    const { data: pulls } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "closed",
      per_page: 20,
      sort: "updated",
      direction: "desc",
    });

    const mergedPulls = pulls.filter(p => p.merged_at);
    mergedCount = mergedPulls.length;
    console.log(`[Scanner] Found ${mergedCount} merged PRs in last 20.`);

    if (mergedCount > 0) {
      const totalDurationMs = mergedPulls.reduce((acc, p) => {
        if (!p.merged_at || !p.created_at) return acc;
        const created = new Date(p.created_at).getTime();
        const merged = new Date(p.merged_at).getTime();
        return acc + (merged - created);
      }, 0);
      
      avgLeadTimeHours = Math.round((totalDurationMs / mergedCount) / (1000 * 60 * 60));
    }

  } catch (e) {
     console.error("[Scanner] Failed to fetch PRs", e);
  }

  // 7. Dependency Audit
  console.log(`[Scanner] Auditing dependencies...`);
  let dependencyAudit: DependencyReport = { audits: [], outdatedCount: 0, majorCount: 0, minorCount: 0, patchCount: 0, totalDeps: 0 };
  const packageJsonPath = files.find((f) => f.path === "package.json")?.path;

  if (packageJsonPath) {
    try {
      const { data: packageData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: packageJsonPath,
      });

      if ("content" in packageData) {
        const content = Buffer.from(packageData.content, "base64").toString("utf-8");
        dependencyAudit = await auditDependencies(content);
      }
    } catch (e) {
      console.error("[Scanner] Failed to audit dependencies", e);
    }
  }

  console.log(`[Scanner] Scan complete.`);

  return {
    owner,
    repo,
    tree: files,
    hasReadme: !!readmePath,
    readmeContent,
    hasCodeowners,
    hasWorkflows,
    hasLicense,
    hasContributing,
    contributingContent,
    hasPrTemplate,
    hasGovernance,
    governanceContent,
    hasAgents,
    agentsContent,
    codeownersContent,
    adrCount,
    adrs: parsedAdrs,
    diagramCount,
    prMetrics: {
        avgLeadTimeHours,
        mergedCount
    },
    dependencies: dependencyAudit
  };
}
