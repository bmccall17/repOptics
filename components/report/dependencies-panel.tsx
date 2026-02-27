import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Folder, CheckCircle, ShieldAlert } from "lucide-react";
import type { RepoEvidence } from "@/lib/scanner";

interface DependenciesPanelProps {
  evidence: RepoEvidence;
}

export function DependenciesPanel({ evidence }: DependenciesPanelProps) {
  return (
    <div className="space-y-6">
      {/* Dependency Health */}
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

            {/* Vulnerability Summary */}
            {evidence.dependencies.vulnerabilities.total > 0 ? (
              <div className="p-4 rounded-lg border border-red-900/50 bg-red-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="h-5 w-5 text-red-400" />
                  <h3 className="text-sm font-medium text-red-400">
                    {evidence.dependencies.vulnerabilities.total} Known Vulnerabilit{evidence.dependencies.vulnerabilities.total !== 1 ? "ies" : "y"}
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {evidence.dependencies.vulnerabilities.critical > 0 && (
                    <div className="text-center p-2 rounded bg-red-950/40 border border-red-900/30">
                      <div className="text-lg font-bold text-red-400">{evidence.dependencies.vulnerabilities.critical}</div>
                      <div className="text-xs text-red-500 uppercase">Critical</div>
                    </div>
                  )}
                  {evidence.dependencies.vulnerabilities.high > 0 && (
                    <div className="text-center p-2 rounded bg-orange-950/40 border border-orange-900/30">
                      <div className="text-lg font-bold text-orange-400">{evidence.dependencies.vulnerabilities.high}</div>
                      <div className="text-xs text-orange-500 uppercase">High</div>
                    </div>
                  )}
                  {evidence.dependencies.vulnerabilities.moderate > 0 && (
                    <div className="text-center p-2 rounded bg-yellow-950/40 border border-yellow-900/30">
                      <div className="text-lg font-bold text-yellow-400">{evidence.dependencies.vulnerabilities.moderate}</div>
                      <div className="text-xs text-yellow-500 uppercase">Moderate</div>
                    </div>
                  )}
                  {evidence.dependencies.vulnerabilities.low > 0 && (
                    <div className="text-center p-2 rounded bg-zinc-800/40 border border-zinc-700/30">
                      <div className="text-lg font-bold text-zinc-300">{evidence.dependencies.vulnerabilities.low}</div>
                      <div className="text-xs text-zinc-500 uppercase">Low</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-green-900/50 bg-green-950/20 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-400">No known vulnerabilities detected.</span>
              </div>
            )}

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

      {/* Repository Map */}
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
    </div>
  );
}
