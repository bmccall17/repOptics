"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CollapsibleSection } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, CircleDashed, Info, AlertCircle, Wrench } from "lucide-react";
import type { CheckResult, CheckStatus, CategoryScore } from "@/lib/heuristics";

type CategoryKey = "decisions" | "architecture" | "governance" | "delivery" | "dependencies";

interface HealthCheckPanelProps {
  categories: Record<CategoryKey, CategoryScore>;
}

function statusCounts(checks: CheckResult[]) {
  let passed = 0, warning = 0, failing = 0;
  for (const c of checks) {
    if (c.status === "done") passed++;
    else if (c.status === "partial") warning++;
    else failing++;
  }
  return { passed, warning, failing };
}

function StatusBadges({ checks }: { checks: CheckResult[] }) {
  const { passed, warning, failing } = statusCounts(checks);
  return (
    <div className="flex gap-2">
      {passed > 0 && (
        <Badge className="bg-green-950/30 text-green-400 border-green-900/30 hover:bg-green-950/40">
          {passed} passed
        </Badge>
      )}
      {warning > 0 && (
        <Badge className="bg-yellow-950/30 text-yellow-400 border-yellow-900/30 hover:bg-yellow-950/40">
          {warning} warning
        </Badge>
      )}
      {failing > 0 && (
        <Badge className="bg-red-950/30 text-red-400 border-red-900/30 hover:bg-red-950/40">
          {failing} failing
        </Badge>
      )}
    </div>
  );
}

const statusConfig: Record<CheckStatus, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  done: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: "text-green-400",
    bg: "bg-green-950/20",
    border: "border-green-900/30",
  },
  partial: {
    icon: <CircleDashed className="h-4 w-4" />,
    color: "text-yellow-400",
    bg: "bg-yellow-950/20",
    border: "border-yellow-900/30",
  },
  not_done: {
    icon: <XCircle className="h-4 w-4" />,
    color: "text-red-400",
    bg: "bg-red-950/20",
    border: "border-red-900/30",
  },
};

function CheckItem({ check }: { check: CheckResult }) {
  const [open, setOpen] = useState(check.status === "not_done");
  const config = statusConfig[check.status];

  return (
    <div className={cn("rounded-lg border p-3", config.bg, config.border)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 text-left"
      >
        <div className={cn("shrink-0", config.color)}>{config.icon}</div>
        <span className="flex-1 font-medium text-sm text-zinc-200">{check.name}</span>
        {check.details && (
          <span className="text-xs text-zinc-500 font-mono">{check.details}</span>
        )}
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mt-3 pl-7">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-zinc-500">
              <Info className="h-3 w-3" />
              <span className="text-xs font-medium uppercase">Why it matters</span>
            </div>
            <p className="text-zinc-400 text-xs">{check.whyItMatters}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-zinc-500">
              <AlertCircle className="h-3 w-3" />
              <span className="text-xs font-medium uppercase">Impact</span>
            </div>
            <p className="text-zinc-400 text-xs">{check.impact}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-zinc-500">
              <Wrench className="h-3 w-3" />
              <span className="text-xs font-medium uppercase">Fix</span>
            </div>
            <p className="text-zinc-400 text-xs">{check.fix}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const categoryLabels: Record<CategoryKey, string> = {
  decisions: "Decisions",
  architecture: "Architecture",
  governance: "Governance",
  delivery: "Delivery",
  dependencies: "Dependencies",
};

export function HealthCheckPanel({ categories }: HealthCheckPanelProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" /> Health Checklist
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Detailed breakdown of each check with context on why it matters and how to fix issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(Object.keys(categoryLabels) as CategoryKey[]).map((key) => {
          const cat = categories[key];
          const hasFailures = cat.checks.some((c) => c.status === "not_done");
          return (
            <CollapsibleSection
              key={key}
              defaultOpen={hasFailures}
              trigger={
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                    {categoryLabels[key]}
                  </span>
                  <StatusBadges checks={cat.checks} />
                </div>
              }
              className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4"
            >
              <div className="space-y-2">
                {cat.checks.map((check) => (
                  <CheckItem key={check.id} check={check} />
                ))}
              </div>
            </CollapsibleSection>
          );
        })}
      </CardContent>
    </Card>
  );
}
