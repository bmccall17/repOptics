import { scanRepo, RepoEvidence } from "@/lib/scanner";
import { scoreRepo, Report } from "@/lib/heuristics";
import { generateRecommendations, Recommendation } from "@/lib/recommendations";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, FileText, Shield, GitBranch, ArrowLeft, Download, Clock, GitMerge, Folder, Package, AlertTriangle, AlertCircle, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { FileNode } from "@/lib/scanner";
import Mermaid from "@/components/Mermaid";

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
  let report: Report | null = null;
  let recs: Recommendation[] = [];
  let evidence: RepoEvidence | null = null;

  console.log(`[ReportPage] Rendering report for ${fullName}`);

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

  if (!report || !evidence) return <div>Loading...</div>;

  const quickWins = recs.filter(r => r.type === "quick_win");
  const strategic = recs.filter(r => r.type !== "quick_win");

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-12 text-zinc-50">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center text-sm text-zinc-400 hover:text-zinc-50">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Link>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800">
                <Download className="mr-2 h-4 w-4" /> Export Report
             </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-50">{fullName}</h1>
          <p className="text-zinc-400">Scan completed. The truth hurts, doesn&apos;t it?</p>
        </div>

        {/* Top Level Score */}
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

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CategoryCard 
            title="Decisions" 
            icon={<FileText className="h-5 w-5" />} 
            data={report.categories.decisions} 
          />
          <CategoryCard 
            title="Architecture" 
            icon={<CheckCircle className="h-5 w-5" />} 
            data={report.categories.architecture} 
          />
          <CategoryCard 
            title="Governance" 
            icon={<Shield className="h-5 w-5" />} 
            data={report.categories.governance} 
          />
          <CategoryCard 
            title="Delivery" 
            icon={<GitBranch className="h-5 w-5" />} 
            data={report.categories.delivery} 
          />
          <CategoryCard
            title="Dependencies"
            icon={<Package className="h-5 w-5" />}
            data={report.categories.dependencies}
          />
        </div>

        {/* Deep Dive Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Decision Log */}
           <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
             <CardHeader>
               <CardTitle className="text-base">Decision Optics</CardTitle>
             </CardHeader>
             <CardContent>
                {evidence.adrs.length === 0 ? (
                  <p className="text-sm text-zinc-500 italic">No decisions recorded.</p>
                ) : (
                  <ul className="space-y-2">
                    {evidence.adrs.slice(0, 5).map((adr, i) => (
                      <li key={i} className="flex items-center justify-between text-sm">
                         <span className="truncate max-w-[200px] text-zinc-300">{adr.title || adr.path}</span>
                         <Badge variant="outline" className="text-zinc-400 border-zinc-700">{adr.status || "Unknown"}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
             </CardContent>
           </Card>

           {/* PR Metrics */}
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
                       {evidence.prMetrics.mergedCount > 0 
                         ? `${evidence.prMetrics.avgLeadTimeHours}h` 
                         : "N/A"}
                    </span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400 flex items-center gap-2">
                       <GitMerge className="h-4 w-4" /> Merged PRs (Last 20)
                    </span>
                    <span className="font-mono font-bold text-zinc-100">{evidence.prMetrics.mergedCount}</span>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Dependency Audit */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
           <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" /> Dependency Health Check
              </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950 text-center">
                    <div className="text-2xl font-bold">{evidence.dependencies.audits.length}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Scanned</div>
                 </div>
                 <div className="p-4 rounded-lg border border-red-900/50 bg-red-950/20 text-center">
                    <div className="text-2xl font-bold text-red-500">{evidence.dependencies.majorCount}</div>
                    <div className="text-xs text-red-400 uppercase tracking-wider">Major Updates</div>
                 </div>
                 <div className="p-4 rounded-lg border border-yellow-900/50 bg-yellow-950/20 text-center">
                    <div className="text-2xl font-bold text-yellow-500">{evidence.dependencies.minorCount}</div>
                    <div className="text-xs text-yellow-400 uppercase tracking-wider">Minor Updates</div>
                 </div>
                 <div className="p-4 rounded-lg border border-green-900/50 bg-green-950/20 text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {evidence.dependencies.audits.length - evidence.dependencies.outdatedCount}
                    </div>
                    <div className="text-xs text-green-400 uppercase tracking-wider">Up to Date</div>
                 </div>
               </div>

               {evidence.dependencies.outdatedCount > 0 ? (
                 <div className="rounded-md border border-zinc-800 overflow-hidden">
                   <table className="w-full text-sm">
                     <thead className="bg-zinc-950 border-b border-zinc-800 text-left">
                       <tr>
                         <th className="p-3 font-medium text-zinc-400">Package</th>
                         <th className="p-3 font-medium text-zinc-400">Current</th>
                         <th className="p-3 font-medium text-zinc-400">Latest</th>
                         <th className="p-3 font-medium text-zinc-400">Impact</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-800">
                       {evidence.dependencies.audits.filter(a => a.severity !== "none").map((audit, i) => (
                         <tr key={i} className="hover:bg-zinc-800/50">
                           <td className="p-3 font-mono text-zinc-300">{audit.package}</td>
                           <td className="p-3 font-mono text-zinc-500">{audit.currentVersion}</td>
                           <td className="p-3 font-mono text-zinc-300">{audit.latestVersion}</td>
                           <td className="p-3">
                              <div className="flex items-center gap-2">
                                {audit.severity === "major" ? (
                                  <Badge variant="destructive" className="bg-red-900/50 text-red-200 hover:bg-red-900/70 border-red-800">Major</Badge>
                                ) : audit.severity === "minor" ? (
                                  <Badge variant="outline" className="border-yellow-700 text-yellow-500">Minor</Badge>
                                ) : (
                                  <Badge variant="outline" className="border-blue-700 text-blue-500">Patch</Badge>
                                )}
                                <span className="text-xs text-zinc-500 hidden md:inline">{audit.impact}</span>
                              </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                  <div className="p-8 text-center text-zinc-500 bg-zinc-950 rounded border border-zinc-800 border-dashed">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>All scanned dependencies are up to date. Nice work!</p>
                  </div>
               )}
             </div>
           </CardContent>
        </Card>

        {/* Diagrams */}
        {evidence.diagrams.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> Architecture Diagrams
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6">
                        {evidence.diagrams.map((d, i) => (
                            <div key={i} className="space-y-2">
                                <h4 className="text-sm font-medium text-zinc-400">{d.path}</h4>
                                <Mermaid chart={d.content} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}

        {/* File Tree */}
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Folder className="h-4 w-4" /> Repository Map ({evidence.tree.length} files)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-400">
               {evidence.tree.slice(0, 100).map((node, i) => (
                  <div key={i} className="truncate">
                    {node.path}
                  </div>
               ))}
               {evidence.tree.length > 100 && (
                 <div className="pt-2 text-zinc-600 italic">... and {evidence.tree.length - 100} more</div>
               )}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-zinc-50">Recommendations Engine</h2>
          
          {recs.length === 0 && (
             <div className="p-8 text-center bg-zinc-900 rounded-lg border border-dashed border-zinc-800">
               <p className="text-zinc-500">Incredible. Nothing to recommend. Are you sure this is a real repo?</p>
             </div>
          )}

          {/* Quick Wins */}
          {quickWins.length > 0 && (
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Quick Wins</h3>
               <div className="grid gap-4">
                  {quickWins.map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
               </div>
            </div>
          )}

          {/* Deep Work */}
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
    </div>
  );
}

interface CategoryData {
  score: number;
  status: string;
  message: string;
}

function CategoryCard({ title, icon, data }: { title: string, icon: React.ReactNode, data: CategoryData }) {
  const color = data.status === "green" ? "text-green-500" : data.status === "yellow" ? "text-yellow-500" : "text-red-500";
  return (
    <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-zinc-500">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", color)}>{data.score}</div>
        <p className="text-xs text-zinc-500 mt-1">{data.message}</p>
      </CardContent>
    </Card>
  )
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
   )
}
