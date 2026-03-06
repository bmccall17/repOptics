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
];
