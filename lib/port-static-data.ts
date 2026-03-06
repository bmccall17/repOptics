// Static fallback data for the Port comparison page.
// Replace with real data after Port account setup + Ocean sync.

import type { PortEntity, PortScorecard } from "./port";

export const STATIC_ENTITIES: PortEntity[] = [
  {
    identifier: "bmccall17/repOptics",
    title: "repOptics",
    blueprint: "githubRepository",
    properties: {
      readme: true,
      url: "https://github.com/bmccall17/repOptics",
      defaultBranch: "main",
      language: "TypeScript",
      snykVulnCritical: 0,
      snykVulnHigh: 1,
      snykVulnMedium: 3,
      snykVulnLow: 5,
      snykVulnTotal: 9,
      snykMonitored: true,
      snykLastTested: "2026-03-05T12:00:00Z",
    },
    relations: {},
    scorecards: {
      decision_clarity: {
        level: "Bronze",
        rules: [
          { identifier: "hasReadme", status: "SUCCESS" },
          { identifier: "hasAdrDirectory", status: "FAILURE" },
        ],
      },
      governance_standards: {
        level: "Silver",
        rules: [
          { identifier: "hasCodeowners", status: "FAILURE" },
          { identifier: "hasContributing", status: "SUCCESS" },
          { identifier: "hasLicense", status: "SUCCESS" },
        ],
      },
      delivery_maturity: {
        level: "Gold",
        rules: [
          { identifier: "hasCiWorkflow", status: "SUCCESS" },
          { identifier: "hasPrTemplate", status: "SUCCESS" },
        ],
      },
      security_posture: {
        level: "Silver",
        rules: [
          { identifier: "snykMonitored", status: "SUCCESS" },
          { identifier: "noCriticalVulns", status: "SUCCESS" },
          { identifier: "noHighVulns", status: "FAILURE" },
        ],
      },
    },
  },
  {
    identifier: "bmccall17/TarotTALKS",
    title: "TarotTALKS",
    blueprint: "githubRepository",
    properties: {
      readme: true,
      url: "https://github.com/bmccall17/TarotTALKS",
      defaultBranch: "main",
      language: "JavaScript",
      snykVulnCritical: 2,
      snykVulnHigh: 5,
      snykVulnMedium: 8,
      snykVulnLow: 12,
      snykVulnTotal: 27,
      snykMonitored: true,
      snykLastTested: "2026-03-04T10:30:00Z",
    },
    relations: {},
    scorecards: {
      decision_clarity: {
        level: "Basic",
        rules: [
          { identifier: "hasReadme", status: "SUCCESS" },
          { identifier: "hasAdrDirectory", status: "FAILURE" },
        ],
      },
      governance_standards: {
        level: "Basic",
        rules: [
          { identifier: "hasCodeowners", status: "FAILURE" },
          { identifier: "hasContributing", status: "FAILURE" },
          { identifier: "hasLicense", status: "FAILURE" },
        ],
      },
      delivery_maturity: {
        level: "Basic",
        rules: [
          { identifier: "hasCiWorkflow", status: "FAILURE" },
          { identifier: "hasPrTemplate", status: "FAILURE" },
        ],
      },
      security_posture: {
        level: "Basic",
        rules: [
          { identifier: "snykMonitored", status: "SUCCESS" },
          { identifier: "noCriticalVulns", status: "FAILURE" },
          { identifier: "noHighVulns", status: "FAILURE" },
        ],
      },
    },
  },
  {
    identifier: "bmccall17/morethanone",
    title: "morethanone",
    blueprint: "githubRepository",
    properties: {
      readme: true,
      url: "https://github.com/bmccall17/morethanone",
      defaultBranch: "main",
      language: "TypeScript",
      snykMonitored: false,
    },
    relations: {},
    scorecards: {
      decision_clarity: {
        level: "Basic",
        rules: [
          { identifier: "hasReadme", status: "SUCCESS" },
          { identifier: "hasAdrDirectory", status: "FAILURE" },
        ],
      },
      governance_standards: {
        level: "Bronze",
        rules: [
          { identifier: "hasCodeowners", status: "FAILURE" },
          { identifier: "hasContributing", status: "FAILURE" },
          { identifier: "hasLicense", status: "SUCCESS" },
        ],
      },
      delivery_maturity: {
        level: "Basic",
        rules: [
          { identifier: "hasCiWorkflow", status: "FAILURE" },
          { identifier: "hasPrTemplate", status: "FAILURE" },
        ],
      },
      security_posture: {
        level: "Basic",
        rules: [
          { identifier: "snykMonitored", status: "FAILURE" },
          { identifier: "noCriticalVulns", status: "FAILURE" },
          { identifier: "noHighVulns", status: "FAILURE" },
        ],
      },
    },
  },
  {
    identifier: "bmccall17/fd_demo",
    title: "fd_demo",
    blueprint: "githubRepository",
    properties: {
      readme: true,
      url: "https://github.com/bmccall17/fd_demo",
      defaultBranch: "main",
      language: "Python",
      snykVulnCritical: 0,
      snykVulnHigh: 0,
      snykVulnMedium: 2,
      snykVulnLow: 1,
      snykVulnTotal: 3,
      snykMonitored: true,
      snykLastTested: "2026-03-05T08:15:00Z",
    },
    relations: {},
    scorecards: {
      decision_clarity: {
        level: "Basic",
        rules: [
          { identifier: "hasReadme", status: "SUCCESS" },
          { identifier: "hasAdrDirectory", status: "FAILURE" },
        ],
      },
      governance_standards: {
        level: "Basic",
        rules: [
          { identifier: "hasCodeowners", status: "FAILURE" },
          { identifier: "hasContributing", status: "FAILURE" },
          { identifier: "hasLicense", status: "FAILURE" },
        ],
      },
      delivery_maturity: {
        level: "Bronze",
        rules: [
          { identifier: "hasCiWorkflow", status: "SUCCESS" },
          { identifier: "hasPrTemplate", status: "FAILURE" },
        ],
      },
      security_posture: {
        level: "Gold",
        rules: [
          { identifier: "snykMonitored", status: "SUCCESS" },
          { identifier: "noCriticalVulns", status: "SUCCESS" },
          { identifier: "noHighVulns", status: "SUCCESS" },
        ],
      },
    },
  },
];

export const STATIC_SCORECARDS: PortScorecard[] = [
  {
    identifier: "decision_clarity",
    title: "Decision Clarity",
    blueprint: "githubRepository",
    levels: ["Basic", "Bronze", "Silver", "Gold"],
    rules: [
      {
        identifier: "hasReadme",
        title: "Has README",
        level: "Bronze",
        query: { combinator: "and", conditions: [{ property: "readme", operator: "isNotEmpty" }] },
      },
      {
        identifier: "hasAdrDirectory",
        title: "Has ADR Directory",
        level: "Silver",
        query: { combinator: "and", conditions: [{ property: "readme", operator: "contains", value: "adr" }] },
      },
    ],
  },
  {
    identifier: "governance_standards",
    title: "Governance Standards",
    blueprint: "githubRepository",
    levels: ["Basic", "Bronze", "Silver", "Gold"],
    rules: [
      {
        identifier: "hasCodeowners",
        title: "Has CODEOWNERS",
        level: "Silver",
        query: { combinator: "and", conditions: [] },
      },
      {
        identifier: "hasContributing",
        title: "Has CONTRIBUTING",
        level: "Bronze",
        query: { combinator: "and", conditions: [] },
      },
      {
        identifier: "hasLicense",
        title: "Has LICENSE",
        level: "Bronze",
        query: { combinator: "and", conditions: [] },
      },
    ],
  },
  {
    identifier: "delivery_maturity",
    title: "Delivery Maturity",
    blueprint: "githubRepository",
    levels: ["Basic", "Bronze", "Silver", "Gold"],
    rules: [
      {
        identifier: "hasCiWorkflow",
        title: "Has CI/CD Workflow",
        level: "Silver",
        query: { combinator: "and", conditions: [] },
      },
      {
        identifier: "hasPrTemplate",
        title: "Has PR Template",
        level: "Gold",
        query: { combinator: "and", conditions: [] },
      },
    ],
  },
  {
    identifier: "security_posture",
    title: "Security Posture",
    blueprint: "githubRepository",
    levels: ["Basic", "Bronze", "Silver", "Gold"],
    rules: [
      {
        identifier: "snykMonitored",
        title: "Monitored by Snyk",
        level: "Bronze",
        query: { combinator: "and", conditions: [{ property: "snykMonitored", operator: "=", value: true }] },
      },
      {
        identifier: "noCriticalVulns",
        title: "No Critical Vulnerabilities",
        level: "Silver",
        query: { combinator: "and", conditions: [{ property: "snykVulnCritical", operator: "=", value: 0 }] },
      },
      {
        identifier: "noHighVulns",
        title: "No High Vulnerabilities",
        level: "Gold",
        query: { combinator: "and", conditions: [{ property: "snykVulnHigh", operator: "=", value: 0 }] },
      },
    ],
  },
];
