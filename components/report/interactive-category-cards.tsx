"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FileText, CheckCircle, Shield, GitBranch, Package } from "lucide-react";
import type { Report } from "@/lib/heuristics";
import type { TabKey } from "./report-tabs";

const CATEGORY_CONFIG: {
  key: keyof Report["categories"];
  label: string;
  icon: React.ReactNode;
  tab: TabKey;
}[] = [
  { key: "decisions", label: "Decisions", icon: <FileText className="h-5 w-5" />, tab: "insights" },
  { key: "architecture", label: "Architecture", icon: <CheckCircle className="h-5 w-5" />, tab: "health" },
  { key: "governance", label: "Governance", icon: <Shield className="h-5 w-5" />, tab: "governance" },
  { key: "delivery", label: "Delivery", icon: <GitBranch className="h-5 w-5" />, tab: "insights" },
  { key: "dependencies", label: "Dependencies", icon: <Package className="h-5 w-5" />, tab: "dependencies" },
];

interface InteractiveCategoryCardsProps {
  categories: Report["categories"];
}

export function InteractiveCategoryCards({ categories }: InteractiveCategoryCardsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") || "health";

  function navigateToTab(tab: TabKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {CATEGORY_CONFIG.map(({ key, label, icon, tab }) => {
        const data = categories[key];
        const isActive = activeTab === tab;
        const color = data.status === "green" ? "text-green-500" : data.status === "yellow" ? "text-yellow-500" : "text-red-500";

        return (
          <Card
            key={key}
            onClick={() => navigateToTab(tab)}
            className={cn(
              "bg-zinc-900 border-zinc-800 text-zinc-50 cursor-pointer transition-all hover:bg-zinc-800/70",
              isActive && "ring-2 ring-zinc-600"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <div className="text-zinc-500">{icon}</div>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", color)}>{data.score}</div>
              <p className="text-xs text-zinc-500 mt-1">{data.message}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
