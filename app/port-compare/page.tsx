import { getPortEntities } from "@/lib/port";
import { STATIC_ENTITIES } from "@/lib/port-static-data";
import {
  FEATURE_MAP,
  WHAT_I_LEARNED,
  type RepoComparison,
} from "@/lib/port-comparison";
import type { PortEntity } from "@/lib/port";
import { RepoComparisonCard } from "@/components/compare/repo-comparison-card";
import { FeatureMapTable } from "@/components/compare/feature-map-table";
import Link from "next/link";

function entitiesToComparisons(entities: PortEntity[]): RepoComparison[] {
  return entities.map((e) => ({
    repo: e.title,
    repOptics: {
      decisions: null,
      architecture: null,
      governance: null,
      delivery: null,
      dependencies: null,
      overall: null,
      grade: null,
    },
    port: {
      decisionClarity: e.scorecards?.decisionClarity?.level ?? null,
      governanceStandards: e.scorecards?.governanceStandards?.level ?? null,
      deliveryMaturity: e.scorecards?.deliveryMaturity?.level ?? null,
    },
  }));
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

  const comparisons = entitiesToComparisons(entities);

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
            Same repos, two lenses. repOptics scans deep into a single repo's
            hygiene. Port.io catalogs services across an org with scorecards,
            relations, and self-service actions. This page shows both side by
            side.
          </p>
          <p className="text-xs text-zinc-600">
            {isLive
              ? "Connected to Port.io — showing live data"
              : "Using static data — add PORT_CLIENT_ID and PORT_CLIENT_SECRET to .env.local for live data"}
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
