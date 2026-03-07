import { NextResponse } from "next/server";
import { getPortEntities } from "@/lib/port";
import { STATIC_ENTITIES } from "@/lib/port-static-data";

export type PortSummary = {
  live: boolean;
  repoCount: number;
  languages: Record<string, number>;
  scorecards: Record<string, Record<string, number>>;
  vulns: { critical: number; high: number; medium: number; low: number; total: number };
  repos: { name: string; grade: string | null; language: string | null; securityLevel: string | null }[];
  fetchedAt: string;
};

export async function GET() {
  const clientId = process.env.PORT_CLIENT_ID;
  const clientSecret = process.env.PORT_CLIENT_SECRET;

  let entities = STATIC_ENTITIES;
  let live = false;

  if (clientId && clientSecret) {
    try {
      entities = await getPortEntities(clientId, clientSecret);
      live = true;
    } catch {
      // fall back to static
    }
  }

  const languages: Record<string, number> = {};
  const scorecards: Record<string, Record<string, number>> = {};
  const vulns = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };

  const repos = entities.map((e) => {
    const lang = (e.properties?.language as string) || "Unknown";
    languages[lang] = (languages[lang] || 0) + 1;

    for (const [key, sc] of Object.entries(e.scorecards ?? {})) {
      if (!scorecards[key]) scorecards[key] = {};
      const level = sc.level || "Basic";
      scorecards[key][level] = (scorecards[key][level] || 0) + 1;
    }

    vulns.critical += (e.properties?.snykVulnCritical as number) || 0;
    vulns.high += (e.properties?.snykVulnHigh as number) || 0;
    vulns.medium += (e.properties?.snykVulnMedium as number) || 0;
    vulns.low += (e.properties?.snykVulnLow as number) || 0;
    vulns.total += (e.properties?.snykVulnTotal as number) || 0;

    return {
      name: e.title,
      grade: (e.properties?.repOpticsGrade as string) || null,
      language: (e.properties?.language as string) || null,
      securityLevel: e.scorecards?.security_posture?.level || null,
    };
  });

  const summary: PortSummary = {
    live,
    repoCount: entities.length,
    languages,
    scorecards,
    vulns,
    repos,
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(summary, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
  });
}
