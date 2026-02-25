"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ReactNode, useCallback } from "react";

const TAB_KEYS = ["health", "insights", "governance", "dependencies"] as const;
export type TabKey = (typeof TAB_KEYS)[number];

interface ReportTabsProps {
  healthContent: ReactNode;
  insightsContent: ReactNode;
  governanceContent: ReactNode;
  dependenciesContent: ReactNode;
}

export function ReportTabs({
  healthContent,
  insightsContent,
  governanceContent,
  dependenciesContent,
}: ReportTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = (searchParams.get("tab") as TabKey) || "health";
  const defaultTab = TAB_KEYS.includes(currentTab) ? currentTab : "health";

  const onTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  return (
    <Tabs defaultValue={defaultTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="health">Health Check</TabsTrigger>
        <TabsTrigger value="insights">Insights</TabsTrigger>
        <TabsTrigger value="governance">Governance</TabsTrigger>
        <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
      </TabsList>

      <TabsContent value="health">{healthContent}</TabsContent>
      <TabsContent value="insights">{insightsContent}</TabsContent>
      <TabsContent value="governance">{governanceContent}</TabsContent>
      <TabsContent value="dependencies">{dependenciesContent}</TabsContent>
    </Tabs>
  );
}
