import { scanRepo } from "@/lib/scanner";
import { scoreRepo } from "@/lib/heuristics";
import { generateRecommendations } from "@/lib/recommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { ExportDialog } from "@/components/report/export-dialog";
import { InteractiveCategoryCards } from "@/components/report/interactive-category-cards";
import { ReportTabs } from "@/components/report/report-tabs";
import { HealthCheckPanel } from "@/components/report/health-check-panel";
import { InsightsPanel } from "@/components/report/insights-panel";
import { GovernancePanel } from "@/components/report/governance-panel";
import { DependenciesPanel } from "@/components/report/dependencies-panel";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function ReportPage(props: PageProps) {
  console.log("[ReportPage] Component started");

  let params: { slug: string[] };
  try {
    console.log("[ReportPage] Awaiting params...");
    params = await props.params;
    console.log("[ReportPage] Params resolved:", params);
  } catch (e) {
    console.error("[ReportPage] Failed to resolve params:", e);
    return <div>Error loading parameters</div>;
  }

  const [owner, repoName] = params.slug;
  const fullName = `${owner}/${repoName}`;

  let error: string | null = null;

  console.log(`[ReportPage] Rendering report for ${fullName}`);

  let report, evidence, recs;
  try {
    console.log(`[ReportPage] Calling scanRepo for ${owner}/${repoName}`);
    evidence = await scanRepo(owner, repoName, process.env.GITHUB_TOKEN);
    console.log(`[ReportPage] Scan completed`);

    report = scoreRepo(evidence);
    recs = generateRecommendations(evidence);
  } catch (e: unknown) {
    console.error("[ReportPage] Error generating report:", e);
    error = (e instanceof Error ? e.message : String(e)) || "Failed to scan repository. Is it public?";
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Scan Failed</h1>
        <p className="text-zinc-600">{error}</p>
        <Link href="/">
          <Button variant="outline">Try Another</Button>
        </Link>
      </div>
    );
  }

  if (!report || !evidence || !recs) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-12 text-zinc-50">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center text-sm text-zinc-400 hover:text-zinc-50">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Link>
          <div className="flex gap-2">
            <ExportDialog
              report={report}
              evidence={evidence}
              recommendations={recs}
              repoFullName={fullName}
            />
          </div>
        </div>

        {/* Repo Name + Tagline */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-50">{fullName}</h1>
          <p className="text-zinc-400">Scan completed. The truth hurts, doesn&apos;t it?</p>
        </div>

        {/* Overall Grade */}
        <Card className="bg-zinc-900 text-white border-zinc-800">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="text-sm font-medium text-zinc-400">Overall Grade</div>
              <div className="text-6xl font-black">{report.grade}</div>
              <p className="text-zinc-400 italic">&quot;{report.summary}&quot;</p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col items-center md:items-end">
              <div className="text-4xl font-bold">{report.totalScore}<span className="text-lg text-zinc-500">/100</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Category Cards */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        }>
          <InteractiveCategoryCards categories={report.categories} />
        </Suspense>

        {/* Tabbed Content */}
        <Suspense fallback={
          <div className="space-y-6">
            <div className="h-10 bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse" />
            <div className="h-96 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
          </div>
        }>
          <ReportTabs
            healthContent={<HealthCheckPanel categories={report.categories} />}
            insightsContent={
              <InsightsPanel
                adrs={evidence.adrs}
                prMetrics={evidence.prMetrics}
                recommendations={recs}
              />
            }
            governanceContent={<GovernancePanel evidence={evidence} />}
            dependenciesContent={<DependenciesPanel evidence={evidence} />}
          />
        </Suspense>
      </div>
    </div>
  );
}
