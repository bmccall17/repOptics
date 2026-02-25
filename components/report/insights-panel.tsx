import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, GitMerge, CheckCircle } from "lucide-react";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { Button } from "@/components/ui/button";
import type { AdrFile, PrMetrics } from "@/lib/scanner";
import type { Recommendation } from "@/lib/recommendations";

interface InsightsPanelProps {
  adrs: AdrFile[];
  prMetrics: PrMetrics;
  recommendations: Recommendation[];
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <Card className="border-l-4 border-l-blue-500 bg-zinc-900 border-y-zinc-800 border-r-zinc-800 text-zinc-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{rec.title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-zinc-700 text-zinc-400">{rec.effort} effort</Badge>
            <Badge variant={rec.priority === "high" ? "destructive" : "secondary"}>{rec.priority}</Badge>
          </div>
        </div>
        <CardDescription className="text-zinc-400">{rec.rationale}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded text-sm font-mono text-zinc-400 mt-2 flex justify-between items-center">
          <span>{rec.filePath}</span>
          <Button size="sm" variant="ghost" disabled className="text-zinc-500 hover:text-zinc-300">
            Create (Dry Run)
          </Button>
        </div>
        <p className="text-sm text-zinc-500 mt-2">Action: {rec.action}</p>
      </CardContent>
    </Card>
  );
}

export function InsightsPanel({ adrs, prMetrics, recommendations }: InsightsPanelProps) {
  const quickWins = recommendations.filter(r => r.type === "quick_win");
  const strategic = recommendations.filter(r => r.type !== "quick_win");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Decision Optics */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Decision Optics</span>
              {adrs.length > 0 && (
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                  {adrs.length} Records
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adrs.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No decisions recorded.</p>
            ) : (
              <div className="space-y-4">
                {adrs.length > 0 && (
                  <div className="rounded border border-zinc-800 bg-zinc-950 p-2 overflow-hidden">
                    <MermaidDiagram chart={`
                      graph TD
                        ${adrs.map((adr, i) => {
                          const safeTitle = (adr.title || `ADR-${i}`).replace(/["()]/g, '');
                          const status = adr.status?.toLowerCase() || 'unknown';
                          const color = status.includes('accept') ? 'fill:#10b981,stroke:#059669' :
                                        status.includes('reject') ? 'fill:#ef4444,stroke:#dc2626' :
                                        status.includes('propos') ? 'fill:#f59e0b,stroke:#d97706' : 'fill:#3f3f46,stroke:#27272a';
                          return `node${i}["${safeTitle}"]:::${status.replace(/\s+/g, '')}
                          style node${i} ${color},color:#fff`;
                        }).join('\n                        ')}
                        ${adrs.map((_, i) => i > 0 ? `node${i-1} --> node${i}` : '').join('\n                        ')}
                    `} />
                  </div>
                )}
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {adrs.map((adr, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 rounded hover:bg-zinc-800/50">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-300">{adr.title || adr.path}</span>
                        {adr.date && <span className="text-xs text-zinc-500">{adr.date}</span>}
                      </div>
                      <Badge variant="outline" className={cn(
                        "border-zinc-700",
                        (adr.status?.toLowerCase().includes("accept") || adr.status?.toLowerCase().includes("implement")) ? "text-green-500 border-green-900" :
                        (adr.status?.toLowerCase().includes("reject") || adr.status?.toLowerCase().includes("deprecate")) ? "text-red-500 border-red-900" :
                        "text-zinc-400"
                      )}>{adr.status || "Unknown"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Velocity */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
          <CardHeader>
            <CardTitle className="text-base">Delivery Velocity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Avg PR Lead Time
              </span>
              <span className="font-mono font-bold text-zinc-100">
                {prMetrics.mergedCount > 0 ? `${prMetrics.avgLeadTimeHours}h` : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400 flex items-center gap-2">
                <GitMerge className="h-4 w-4" /> Merged PRs (Last 20)
              </span>
              <span className="font-mono font-bold text-zinc-100">{prMetrics.mergedCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-zinc-50">Recommendations Engine</h2>

        {recommendations.length === 0 && (
          <div className="p-8 text-center bg-zinc-900 rounded-lg border border-dashed border-zinc-800">
            <p className="text-zinc-500">Incredible. Nothing to recommend. Are you sure this is a real repo?</p>
          </div>
        )}

        {quickWins.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Quick Wins</h3>
            <div className="grid gap-4">
              {quickWins.map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
            </div>
          </div>
        )}

        {strategic.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Strategic Improvements</h3>
            <div className="grid gap-4">
              {strategic.map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
