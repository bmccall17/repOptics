import { createOctokit } from "./github";

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
  hasWorkflows: boolean;
  hasLicense: boolean;
  hasContributing: boolean;
  hasPrTemplate: boolean;
  adrCount: number;
  adrs: AdrFile[];
  diagramCount: number;
  prMetrics: PrMetrics;
};

export async function scanRepo(
  owner: string,
  repo: string,
  token?: string
): Promise<RepoEvidence> {
  console.log(`[Scanner] Starting scan for ${owner}/${repo}`);
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
  const hasCodeowners = files.some((f) =>
    /^(CODEOWNERS|\.github\/CODEOWNERS)$/i.test(f.path)
  );
  
  const hasLicense = files.some((f) => /^LICENSE/i.test(f.path));
  
  const hasContributing = files.some((f) => 
    /^(CONTRIBUTING\.md|\.github\/CONTRIBUTING\.md)$/i.test(f.path)
  );

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

  // 5. Deep Scan: Parse ADRs (Top 5)
  const parsedAdrs: AdrFile[] = [];
  // For MVP, we'll try to fetch content of the first few to check for "Status"
  const adrsToScan = adrFiles.slice(0, 5); 
  
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
        const statusMatch = text.match(/Status:\s*(\w+)/i);
        const dateMatch = text.match(/Date:\s*(\d{4}-\d{2}-\d{2})/);

        parsedAdrs.push({
          path: file.path,
          title: titleMatch ? titleMatch[1] : file.path.split("/").pop(),
          status: statusMatch ? statusMatch[1] : "Unknown",
          date: dateMatch ? dateMatch[1] : undefined,
        });
      }
    } catch (e) {
      console.error(`[Scanner] Failed to parse ADR ${file.path}`, e);
    }
  }));

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
    hasPrTemplate,
    adrCount,
    adrs: parsedAdrs,
    diagramCount,
    prMetrics: {
        avgLeadTimeHours,
        mergedCount
    }
  };
}
