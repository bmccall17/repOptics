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
      decisionClarity: {
        level: "Bronze",
        rules: [
          { identifier: "hasReadme", status: "SUCCESS" },
          { identifier: "hasAdrDirectory", status: "FAILURE" },
        ],
      },
      governanceStandards: {
        level: "Silver",
        rules: [
          { identifier: "hasCodeowners", status: "FAILURE" },
          { identifier: "hasContributing", status: "SUCCESS" },
          { identifier: "hasLicense", status: "SUCCESS" },
        ],
      },
      deliveryMaturity: {
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
      decisionClarity: {
        level: "Basic",
        rules: [
          { identifier: "hasReadme", status: "SUCCESS" },
          { identifier: "hasAdrDirectory", status: "FAILURE" },
        ],
      },
      governanceStandards: {
        level: "Basic",
        rules: [
          { identifier: "hasCodeowners", status: "FAILURE" },
          { identifier: "hasContributing", status: "FAILURE" },
          { identifier: "hasLicense", status: "FAILURE" },
        ],
      },
      deliveryMaturity: {
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
      decisionClarity: {
        level: "Basic",
        rules: [
          { identifier: "hasReadme", status: "SUCCESS" },
          { identifier: "hasAdrDirectory", status: "FAILURE" },
        ],
      },
      governanceStandards: {
        level: "Bronze",
        rules: [
          { identifier: "hasCodeowners", status: "FAILURE" },
          { identifier: "hasContributing", status: "FAILURE" },
          { identifier: "hasLicense", status: "SUCCESS" },
        ],
      },
      deliveryMaturity: {
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
      decisionClarity: {
        level: "Basic",
        rules: [
          { identifier: "hasReadme", status: "SUCCESS" },
          { identifier: "hasAdrDirectory", status: "FAILURE" },
        ],
      },
      governanceStandards: {
        level: "Basic",
        rules: [
          { identifier: "hasCodeowners", status: "FAILURE" },
          { identifier: "hasContributing", status: "FAILURE" },
          { identifier: "hasLicense", status: "FAILURE" },
        ],
      },
      deliveryMaturity: {
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
    identifier: "decisionClarity",
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
    identifier: "governanceStandards",
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
    identifier: "deliveryMaturity",
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
