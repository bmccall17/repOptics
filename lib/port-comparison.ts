// Comparison logic: maps repOptics scoring categories to Port scorecard levels

export type FeatureRow = {
  capability: string;
  repOptics: string;
  port: string;
  verdict: string;
};

export type RepoComparison = {
  repo: string;
  repOptics: {
    decisions: number | null;
    architecture: number | null;
    governance: number | null;
    delivery: number | null;
    dependencies: number | null;
    overall: number | null;
    grade: string | null;
  };
  port: {
    decision_clarity: string | null;
    governance_standards: string | null;
    delivery_maturity: string | null;
    security_posture: string | null;
  };
  snyk: {
    critical: number | null;
    high: number | null;
    medium: number | null;
    low: number | null;
    total: number | null;
    monitored: boolean;
  };
};

export const FEATURE_MAP: FeatureRow[] = [
  {
    capability: "ADR Detection",
    repOptics: "Deep file-tree scan: counts ADRs, checks dates, parses status",
    port: "Property-based rule (has docs folder) — no file parsing",
    verdict: "repOptics: deeper single-repo insight",
  },
  {
    capability: "README Quality",
    repOptics: "Fetches content, scores by character length (>1000 = thorough)",
    port: "Boolean check: README exists or not",
    verdict: "repOptics: qualitative vs. binary",
  },
  {
    capability: "Dependency Audit",
    repOptics: "Fetches npm registry, compares versions, flags major/minor/vuln",
    port: "Snyk integration: vuln counts by severity pushed to catalog properties",
    verdict: "Complementary: repOptics for version drift, Snyk+Port for security enforcement",
  },
  {
    capability: "Security Scanning",
    repOptics: "Basic dependency version checks",
    port: "Snyk-powered Security Posture scorecard: Bronze (monitored) > Silver (no critical) > Gold (no high)",
    verdict: "Port+Snyk: enforced security gates across the org",
  },
  {
    capability: "Scorecard Enforcement",
    repOptics: "Read-only report with recommendations",
    port: "Scorecards with levels (Basic > Gold), automations, gates",
    verdict: "Port: actionable org-wide enforcement",
  },
  {
    capability: "Multi-Repo Catalog",
    repOptics: "Single-repo scanner",
    port: "Software Catalog: hundreds of services, teams, environments",
    verdict: "Port: built for org-scale orchestration",
  },
  {
    capability: "Self-Service Actions",
    repOptics: "Generate wizard (scaffolds new projects)",
    port: "Full self-service portal: scaffold, deploy, provision, day-2 ops",
    verdict: "Port: production-grade developer portal",
  },
  {
    capability: "Relations & Ownership",
    repOptics: "CODEOWNERS detection (file-level)",
    port: "Entity relations: service > team > system > environment",
    verdict: "Port: rich graph of ownership + dependencies",
  },
  {
    capability: "AI Agents",
    repOptics: "Not applicable",
    port: "Port AI Agents: natural-language catalog queries, automated actions",
    verdict: "Port: AI-native platform direction",
  },
  {
    capability: "Personality & UX",
    repOptics: "Dry-humor roasts, witty per-category messages, dark dev aesthetic",
    port: "Professional dashboard, clean UI, enterprise-ready",
    verdict: "Different audiences, both effective",
  },
  {
    capability: "Setup Complexity",
    repOptics: "Paste owner/repo, instant scan — zero config",
    port: "Ocean integration, blueprints, scorecards — powerful but intentional setup",
    verdict: "repOptics: faster to first value; Port: deeper long-term value",
  },
];

export const WHAT_I_LEARNED = {
  title: "What I Learned Building This Comparison",
  paragraphs: [
    `repOptics and Port.io solve related problems from opposite ends. repOptics goes deep on a single repo — parsing file trees, reading ADR content, auditing npm versions. It answers: "Is this one repo healthy?" Port answers: "Across my entire org, which services meet our standards, who owns what, and how do I enforce golden paths at scale?"`,
    `Building repOptics taught me the value of opinionated scoring — developers respond to personality-driven feedback more than dashboards full of green checkmarks. But repOptics hits a ceiling: it can't model relationships between services, enforce standards across 200 repos, or trigger automated remediation.`,
    `That's exactly where Port shines. Scorecards aren't just scores — they're enforceable gates. The Software Catalog isn't just a list — it's a living graph of services, teams, and infrastructure. Self-Service Actions turn "file a ticket and wait" into "click a button and ship."`,
    `The complementary nature is the insight: tools like repOptics could feed into Port as a custom integration — scanning repos deeply and pushing enriched properties back into the catalog. Port orchestrates; specialized tools provide depth. That's the ecosystem play.`,
  ],
};
