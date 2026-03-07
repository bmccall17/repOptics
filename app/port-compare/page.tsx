export const dynamic = "force-dynamic";

import { getPortEntities } from "@/lib/port";
import { STATIC_ENTITIES } from "@/lib/port-static-data";
import {
  FEATURE_MAP,
  WHAT_I_LEARNED,
  type RepoComparison,
} from "@/lib/port-comparison";
import type { PortEntity } from "@/lib/port";
import { scanRepo } from "@/lib/scanner";
import { scoreRepo } from "@/lib/heuristics";
import { RepoComparisonCard } from "@/components/compare/repo-comparison-card";
import { FeatureMapTable } from "@/components/compare/feature-map-table";
import Link from "next/link";

async function scanRepoSafe(owner: string, repo: string, token?: string) {
  try {
    const evidence = await scanRepo(owner, repo, token);
    return scoreRepo(evidence);
  } catch {
    return null;
  }
}

async function buildComparisons(entities: PortEntity[]): Promise<RepoComparison[]> {
  const ghToken = process.env.GH_PAT || process.env.GITHUB_TOKEN;

  const results = await Promise.all(
    entities.map(async (e) => {
      // Entity identifier is "owner/repoName" (e.g. "bmccall17/repOptics")
      const url = e.properties?.url as string | undefined;
      let owner = "bmccall17";
      let repoName = e.title;

      // Extract owner/repo from identifier if in owner/repo format
      if (e.identifier.includes("/")) {
        const parts = e.identifier.split("/");
        owner = parts[0];
        repoName = parts.slice(1).join("/");
      }

      if (url) {
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
          owner = match[1];
          repoName = match[2];
        }
      }

      const report = await scanRepoSafe(owner, repoName, ghToken);

      return {
        repo: e.title,
        repOptics: report
          ? {
              decisions: report.categories.decisions.score,
              architecture: report.categories.architecture.score,
              governance: report.categories.governance.score,
              delivery: report.categories.delivery.score,
              dependencies: report.categories.dependencies.score,
              overall: report.totalScore,
              grade: report.grade,
            }
          : {
              decisions: null,
              architecture: null,
              governance: null,
              delivery: null,
              dependencies: null,
              overall: null,
              grade: null,
            },
        port: {
          decision_clarity: e.scorecards?.decision_clarity?.level ?? null,
          governance_standards: e.scorecards?.governance_standards?.level ?? null,
          delivery_maturity: e.scorecards?.delivery_maturity?.level ?? null,
          security_posture: e.scorecards?.security_posture?.level ?? null,
        },
        snyk: {
          critical: (e.properties?.snykVulnCritical as number) ?? null,
          high: (e.properties?.snykVulnHigh as number) ?? null,
          medium: (e.properties?.snykVulnMedium as number) ?? null,
          low: (e.properties?.snykVulnLow as number) ?? null,
          total: (e.properties?.snykVulnTotal as number) ?? null,
          monitored: (e.properties?.snykMonitored as boolean) ?? false,
        },
      } satisfies RepoComparison;
    })
  );

  return results;
}

export default async function PortComparePage() {
  let entities: PortEntity[] = STATIC_ENTITIES;
  let isLive = false;

  const clientId = process.env.PORT_CLIENT_ID;
  const clientSecret = process.env.PORT_CLIENT_SECRET;

  if (clientId && clientSecret) {
    try {
      entities = await getPortEntities(clientId, clientSecret);
      isLive = true;
    } catch {
      // Fall back to static data
    }
  }

  const comparisons = await buildComparisons(entities);

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-50">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            &larr; Back to repOptics
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            repOptics vs Port.io
          </h1>
          <p className="max-w-2xl text-zinc-400">
            Same repos, two lenses. repOptics scans deep into a single repo&apos;s
            hygiene. Port.io catalogs services across an org with scorecards,
            relations, and self-service actions. This page shows both side by
            side.
          </p>
          <p className="text-xs text-zinc-600">
            {isLive
              ? `Connected to Port.io — showing live data for ${entities.length} repos`
              : `Using static data (${entities.length} repos) — add PORT_CLIENT_ID and PORT_CLIENT_SECRET to .env.local for live data`}
          </p>
        </div>

        {/* Per-Repo Comparison Cards */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Repo-by-Repo Comparison
          </h2>
          <p className="text-sm text-zinc-500">
            repOptics scores are numeric (0-100 per category). Port Scorecard
            levels are tiered (Basic / Bronze / Silver / Gold). Both measure
            hygiene — just differently.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {comparisons.map((c) => (
              <RepoComparisonCard key={c.repo} data={c} />
            ))}
          </div>
        </section>

        {/* Feature Map */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Capability Comparison
          </h2>
          <p className="text-sm text-zinc-500">
            Where each tool excels — and where they complement each other.
          </p>
          <FeatureMapTable features={FEATURE_MAP} />
        </section>

        {/* What I Learned */}
        <section className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="text-xl font-semibold text-zinc-200">
            {WHAT_I_LEARNED.title}
          </h2>
          {WHAT_I_LEARNED.paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-zinc-400">
              {p}
            </p>
          ))}
        </section>
      </div>
    </main>
  );
}
