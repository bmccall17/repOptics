"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALL_SECTIONS,
  ExportSection,
  exportReportAsJson,
  exportReportAsMarkdown,
} from "@/lib/report-export";
import type { Report } from "@/lib/heuristics";
import type { RepoEvidence } from "@/lib/scanner";
import type { Recommendation } from "@/lib/recommendations";

interface ExportDialogProps {
  report: Report;
  evidence: RepoEvidence;
  recommendations: Recommendation[];
  repoFullName: string;
}

export function ExportDialog({ report, evidence, recommendations, repoFullName }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<ExportSection>>(
    () => new Set(ALL_SECTIONS.map((s) => s.key))
  );
  const [format, setFormat] = useState<"json" | "markdown">("json");

  function toggleSection(key: ExportSection) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === ALL_SECTIONS.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ALL_SECTIONS.map((s) => s.key)));
    }
  }

  function handleDownload() {
    const data = { report, evidence, recommendations };
    const content =
      format === "json"
        ? exportReportAsJson(data, selected)
        : exportReportAsMarkdown(data, selected);

    const ext = format === "json" ? "json" : "md";
    const mimeType = format === "json" ? "application/json" : "text/markdown";
    const slug = repoFullName.replace("/", "_");
    const filename = `repoptics-report-${slug}.${ext}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
        onClick={() => setOpen(true)}
      >
        <Download className="mr-2 h-4 w-4" /> Export Report
      </Button>
    );
  }

  return (
    <>
      {/* Trigger button (hidden when open, but keep the layout) */}
      <Button
        variant="outline"
        size="sm"
        className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
        onClick={() => setOpen(true)}
      >
        <Download className="mr-2 h-4 w-4" /> Export Report
      </Button>

      {/* Modal overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
        <div
          className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-50">Export Report</h2>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-300">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Section checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Sections</span>
              <button
                onClick={toggleAll}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline"
              >
                {selected.size === ALL_SECTIONS.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-56 overflow-y-auto">
              {ALL_SECTIONS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(key)}
                    onChange={() => toggleSection(key)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
                  />
                  <span className="text-sm text-zinc-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format toggle */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-zinc-400">Format</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat("json")}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  format === "json"
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                )}
              >
                JSON (AI Agents)
              </button>
              <button
                onClick={() => setFormat("markdown")}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  format === "markdown"
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                )}
              >
                Markdown
              </button>
            </div>
          </div>

          {/* Download */}
          <Button
            className="w-full"
            onClick={handleDownload}
            disabled={selected.size === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download {format === "json" ? ".json" : ".md"}
          </Button>
        </div>
      </div>
    </>
  );
}
