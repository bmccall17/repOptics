"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { GitFork, FileImage } from "lucide-react";
import type { RepoEvidence } from "@/lib/scanner";

interface DiagramsPanelProps {
  evidence: RepoEvidence;
}

export function DiagramsPanel({ evidence }: DiagramsPanelProps) {
  const { diagrams, diagramCount } = evidence;
  const mermaidDiagrams = diagrams.filter((d) => d.format === "mermaid" && d.content);
  const otherDiagrams = diagrams.filter((d) => d.format !== "mermaid" || !d.content);

  if (diagrams.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
        <CardContent className="p-8 text-center">
          <FileImage className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">
            {diagramCount > 0
              ? `${diagramCount} diagram file${diagramCount !== 1 ? "s" : ""} detected but none are in renderable Mermaid format.`
              : "No architecture diagrams detected in this repository."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {mermaidDiagrams.map((diagram) => (
        <Card key={diagram.path} className="bg-zinc-900 border-zinc-800 text-zinc-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitFork className="h-4 w-4" />
              {diagram.path}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MermaidDiagram chart={diagram.content!} />
          </CardContent>
        </Card>
      ))}

      {otherDiagrams.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileImage className="h-4 w-4" /> Other Diagram Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {otherDiagrams.map((diagram) => (
                <div
                  key={diagram.path}
                  className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded"
                >
                  <span className="text-sm font-mono text-zinc-400">{diagram.path}</span>
                  <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs font-mono text-zinc-500 uppercase">
                    {diagram.format}
                  </span>
                  <span className="text-xs text-zinc-600 ml-auto">Preview not available</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
