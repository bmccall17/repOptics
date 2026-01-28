/**
 * Question Bank for the Decision-Clarity System
 *
 * Based on Max's insight: "Your MVP isn't starter kit templates.
 * It's the decision system that produces clarity + next actions."
 *
 * These questions help capture intent before jumping into code scaffolding.
 */

export type QuestionOption = {
  id: string;
  label: string;
  description: string;
  consequences: string[];
  recommendations?: string[];
};

export type Question = {
  id: string;
  category: QuestionCategory;
  text: string;
  whyItMatters: string;
  options: QuestionOption[];
  allowMultiple?: boolean;
};

export type QuestionCategory =
  | "intent"
  | "runtime"
  | "data"
  | "deploy"
  | "cost"
  | "guardrails";

export type DecisionAnswer = {
  questionId: string;
  selectedOptionIds: string[];
  customNote?: string;
};

export type DecisionSnapshot = {
  answers: DecisionAnswer[];
  timestamp: string;
  projectName: string;
};

// ============================================
// CATEGORY 1: INTENT
// ============================================

const intentQuestions: Question[] = [
  {
    id: "intent-purpose",
    category: "intent",
    text: "What is the primary purpose of this project?",
    whyItMatters: "Your intent shapes everything from architecture to test coverage. A throwaway prototype needs different guardrails than production software.",
    options: [
      {
        id: "prototype",
        label: "Prototype / Spike",
        description: "Exploring an idea, proving feasibility, or learning a new technology.",
        consequences: [
          "Minimal structure needed - speed over polish",
          "Tests optional, documentation minimal",
          "May be thrown away entirely"
        ],
        recommendations: ["Skip CI/CD", "Skip ADRs", "Consider a single file or notebook"]
      },
      {
        id: "internal-tool",
        label: "Internal Tool",
        description: "A utility for your team that won't face external users.",
        consequences: [
          "Can iterate quickly with direct user feedback",
          "Lower polish requirements but still needs maintainability",
          "Security still matters for internal data"
        ],
        recommendations: ["Basic CI", "Simple ADR for key decisions", "CODEOWNERS for accountability"]
      },
      {
        id: "client-demo",
        label: "Client Demo / Proof of Concept",
        description: "Demonstrating capabilities to stakeholders or customers.",
        consequences: [
          "Visual polish matters more than deep functionality",
          "May evolve into production or be discarded",
          "Document assumptions clearly"
        ],
        recommendations: ["Focus on UX", "Document scope boundaries", "Prepare 'next steps' if approved"]
      },
      {
        id: "production",
        label: "Production Software",
        description: "Software intended for real users in a production environment.",
        consequences: [
          "Full engineering discipline required",
          "Security, testing, monitoring are mandatory",
          "Long-term maintenance cost is real"
        ],
        recommendations: ["Full CI/CD", "Comprehensive ADRs", "CODEOWNERS", "Monitoring setup"]
      }
    ]
  },
  {
    id: "intent-lifespan",
    category: "intent",
    text: "What is the expected lifespan of this project?",
    whyItMatters: "Short-lived projects can cut corners. Long-lived projects pay the price of every shortcut.",
    options: [
      {
        id: "days",
        label: "Days to Weeks",
        description: "A quick experiment or one-time task.",
        consequences: [
          "Minimal investment in structure",
          "Documentation is 'nice to have'",
          "Can use the simplest tools"
        ]
      },
      {
        id: "months",
        label: "Months",
        description: "A project with a defined end date or milestone.",
        consequences: [
          "Some structure helps onboarding if team changes",
          "Worth documenting key decisions",
          "Basic tests prevent regression during development"
        ]
      },
      {
        id: "years",
        label: "Years / Indefinite",
        description: "Long-term software that will be maintained over time.",
        consequences: [
          "Every shortcut becomes tech debt",
          "Documentation is essential for future maintainers",
          "Invest in automation (tests, CI, deployments)"
        ]
      }
    ]
  }
];

// ============================================
// CATEGORY 2: RUNTIME
// ============================================

const runtimeQuestions: Question[] = [
  {
    id: "runtime-type",
    category: "runtime",
    text: "What type of runtime does your application need?",
    whyItMatters: "Runtime choice affects hosting costs, deployment complexity, and feature possibilities.",
    options: [
      {
        id: "static",
        label: "Static Site",
        description: "HTML/CSS/JS only, no server-side code execution.",
        consequences: [
          "Cheapest to host (often free)",
          "Fastest page loads (CDN-cached)",
          "No server-side secrets or computation"
        ],
        recommendations: ["GitHub Pages", "Netlify", "Cloudflare Pages"]
      },
      {
        id: "server",
        label: "Server-Rendered",
        description: "Server generates HTML on each request (Node.js, Python, etc.).",
        consequences: [
          "Can use server-side secrets",
          "SEO-friendly out of the box",
          "Requires always-on server (costs more)"
        ],
        recommendations: ["Render", "Railway", "Fly.io", "Vercel"]
      },
      {
        id: "serverless",
        label: "Serverless Functions",
        description: "Code runs on-demand, scales to zero when idle.",
        consequences: [
          "Pay only for what you use",
          "Cold starts can affect latency",
          "Stateless by design"
        ],
        recommendations: ["Vercel Functions", "AWS Lambda", "Cloudflare Workers"]
      },
      {
        id: "hybrid",
        label: "Hybrid (SSR + Static)",
        description: "Mix of static pages and server-rendered routes.",
        consequences: [
          "Best of both worlds",
          "More complex deployment",
          "Framework-specific (Next.js, Nuxt, etc.)"
        ],
        recommendations: ["Next.js on Vercel", "Nuxt on Netlify"]
      }
    ]
  }
];

// ============================================
// CATEGORY 3: DATA
// ============================================

const dataQuestions: Question[] = [
  {
    id: "data-storage",
    category: "data",
    text: "What are your data storage needs?",
    whyItMatters: "Data persistence decisions affect complexity, cost, and compliance requirements.",
    options: [
      {
        id: "none",
        label: "No Persistence",
        description: "Stateless application, data lives only in memory or client.",
        consequences: [
          "Simplest architecture",
          "No database costs or management",
          "Data lost on refresh/restart"
        ]
      },
      {
        id: "local",
        label: "Local Storage / IndexedDB",
        description: "Data stored in the user's browser.",
        consequences: [
          "No server costs for storage",
          "Data is device-specific",
          "Limited storage (typically 5-50MB)"
        ]
      },
      {
        id: "file",
        label: "File-Based",
        description: "JSON, SQLite, or flat files on disk.",
        consequences: [
          "Simple for small datasets",
          "No database server to manage",
          "Limited concurrent access"
        ]
      },
      {
        id: "database",
        label: "Hosted Database",
        description: "PostgreSQL, MySQL, MongoDB, or similar managed service.",
        consequences: [
          "Proper persistence and querying",
          "Adds operational complexity",
          "Recurring cost (even for small instances)"
        ],
        recommendations: ["Supabase (Postgres)", "PlanetScale (MySQL)", "MongoDB Atlas"]
      }
    ]
  },
  {
    id: "data-auth",
    category: "data",
    text: "Do you need user authentication?",
    whyItMatters: "Authentication adds significant complexity but is essential for personalized or protected features.",
    options: [
      {
        id: "none",
        label: "No Authentication",
        description: "Public access, no user accounts.",
        consequences: [
          "Simplest to build and maintain",
          "No user data to protect",
          "No personalization possible"
        ]
      },
      {
        id: "simple",
        label: "Simple Auth (Magic Link / API Key)",
        description: "Lightweight authentication without passwords.",
        consequences: [
          "Lower friction for users",
          "Simpler to implement than OAuth",
          "May not meet enterprise requirements"
        ]
      },
      {
        id: "oauth",
        label: "OAuth / Social Login",
        description: "Login via Google, GitHub, Microsoft, etc.",
        consequences: [
          "Trusted login flow for users",
          "Adds OAuth provider dependency",
          "Need to handle token refresh"
        ],
        recommendations: ["NextAuth.js", "Clerk", "Auth0"]
      },
      {
        id: "full",
        label: "Full Auth System",
        description: "Username/password, MFA, session management.",
        consequences: [
          "Maximum control over auth flow",
          "Significant security responsibility",
          "Compliance considerations (password storage, etc.)"
        ]
      }
    ]
  }
];

// ============================================
// CATEGORY 4: DEPLOYMENT
// ============================================

const deployQuestions: Question[] = [
  {
    id: "deploy-platform",
    category: "deploy",
    text: "Where will this application be deployed?",
    whyItMatters: "Deployment platform affects CI/CD setup, environment variables, and scaling options.",
    options: [
      {
        id: "github-pages",
        label: "GitHub Pages",
        description: "Free static hosting directly from your repo.",
        consequences: [
          "Zero cost, easy setup",
          "Static sites only",
          "Limited to public repos (free tier)"
        ]
      },
      {
        id: "vercel",
        label: "Vercel",
        description: "Optimized for Next.js, automatic deployments.",
        consequences: [
          "Excellent DX with preview deployments",
          "Generous free tier",
          "Vendor lock-in for some features"
        ]
      },
      {
        id: "render",
        label: "Render",
        description: "General-purpose cloud platform with Blueprints.",
        consequences: [
          "Supports multiple service types",
          "Infrastructure as code via render.yaml",
          "Predictable pricing"
        ]
      },
      {
        id: "self-hosted",
        label: "Self-Hosted / VPS",
        description: "Your own server (DigitalOcean, AWS EC2, etc.).",
        consequences: [
          "Maximum control",
          "Operational overhead (updates, security)",
          "Need to handle scaling manually"
        ]
      }
    ]
  }
];

// ============================================
// CATEGORY 5: COST
// ============================================

const costQuestions: Question[] = [
  {
    id: "cost-budget",
    category: "cost",
    text: "What is your budget for infrastructure?",
    whyItMatters: "Budget constraints shape technology choices. Free tiers have limits; paid services remove friction.",
    options: [
      {
        id: "zero",
        label: "Hard $0",
        description: "Must stay within free tiers, no exceptions.",
        consequences: [
          "Limited to free tier services",
          "May hit usage caps",
          "Manual scaling only"
        ],
        recommendations: ["GitHub Pages", "Vercel (hobby)", "Supabase free tier", "Cloudflare"]
      },
      {
        id: "hobby",
        label: "Hobby Budget ($5-20/month)",
        description: "Small budget for personal or side projects.",
        consequences: [
          "Access to entry-level paid tiers",
          "Usually enough for low-traffic apps",
          "Can upgrade if needed"
        ]
      },
      {
        id: "startup",
        label: "Startup Budget ($50-200/month)",
        description: "Budget for a real product with real users.",
        consequences: [
          "Professional-grade infrastructure",
          "Proper database instances",
          "Can handle moderate traffic"
        ]
      },
      {
        id: "enterprise",
        label: "Enterprise / Flexible",
        description: "Budget is not the primary constraint.",
        consequences: [
          "Choose best tools for the job",
          "Focus on reliability and support",
          "Consider managed services"
        ]
      }
    ]
  }
];

// ============================================
// CATEGORY 6: GUARDRAILS
// ============================================

const guardrailsQuestions: Question[] = [
  {
    id: "guardrails-testing",
    category: "guardrails",
    text: "What level of testing do you need?",
    whyItMatters: "Tests prevent regressions and enable confident refactoring. But they also slow initial development.",
    options: [
      {
        id: "none",
        label: "None (Move Fast)",
        description: "No automated tests, rely on manual testing.",
        consequences: [
          "Fastest initial development",
          "High risk of regressions",
          "Harder to refactor later"
        ]
      },
      {
        id: "smoke",
        label: "Smoke Tests Only",
        description: "Basic tests that verify the app starts and key flows work.",
        consequences: [
          "Catches obvious breaks",
          "Low maintenance overhead",
          "Won't catch edge cases"
        ]
      },
      {
        id: "unit",
        label: "Unit Tests",
        description: "Test individual functions and components in isolation.",
        consequences: [
          "Good coverage of business logic",
          "Fast to run, easy to write",
          "May miss integration issues"
        ]
      },
      {
        id: "full",
        label: "Full Test Suite",
        description: "Unit, integration, and end-to-end tests.",
        consequences: [
          "High confidence in changes",
          "Significant initial investment",
          "Slower development velocity initially"
        ]
      }
    ]
  },
  {
    id: "guardrails-ci",
    category: "guardrails",
    text: "What CI/CD automation do you need?",
    whyItMatters: "CI catches issues before merge. CD automates deployments. Both add setup time but reduce manual work.",
    options: [
      {
        id: "none",
        label: "None (Manual Deploys)",
        description: "Push to main, deploy manually.",
        consequences: [
          "Zero setup time",
          "Error-prone deployments",
          "No automated quality gates"
        ]
      },
      {
        id: "lint-only",
        label: "Lint Only",
        description: "Automated linting and type checking on PR.",
        consequences: [
          "Catches obvious code issues",
          "Quick to set up",
          "No test coverage"
        ]
      },
      {
        id: "ci",
        label: "CI (Lint + Test)",
        description: "Full CI pipeline with lint, types, and tests.",
        consequences: [
          "PRs are validated before merge",
          "Catches regressions automatically",
          "Adds merge latency"
        ]
      },
      {
        id: "ci-cd",
        label: "CI + CD",
        description: "Automated testing and deployment on merge.",
        consequences: [
          "Fully automated pipeline",
          "Consistent deployments",
          "More moving parts to maintain"
        ]
      }
    ]
  },
  {
    id: "guardrails-branch",
    category: "guardrails",
    text: "What branch protection rules do you need?",
    whyItMatters: "Branch protection prevents accidental pushes to main and enforces review workflows.",
    options: [
      {
        id: "none",
        label: "None",
        description: "Anyone can push directly to main.",
        consequences: [
          "Maximum velocity for solo developers",
          "Risk of breaking production",
          "No review requirement"
        ]
      },
      {
        id: "pr-required",
        label: "PRs Required",
        description: "All changes must go through a pull request.",
        consequences: [
          "Creates audit trail",
          "Enables code review",
          "Slight slowdown for solo work"
        ]
      },
      {
        id: "review-required",
        label: "Review Required",
        description: "PRs need at least one approval before merge.",
        consequences: [
          "Enforces code review",
          "Catches issues before merge",
          "Requires another reviewer"
        ]
      },
      {
        id: "ci-required",
        label: "CI + Review Required",
        description: "PRs need passing CI and approval.",
        consequences: [
          "Highest quality gate",
          "Can't merge broken code",
          "Slowest merge velocity"
        ]
      }
    ]
  }
];

// ============================================
// EXPORTED QUESTION BANK
// ============================================

export const QUESTION_BANK: Question[] = [
  ...intentQuestions,
  ...runtimeQuestions,
  ...dataQuestions,
  ...deployQuestions,
  ...costQuestions,
  ...guardrailsQuestions,
];

export const QUESTION_CATEGORIES: { id: QuestionCategory; label: string; description: string }[] = [
  { id: "intent", label: "Intent", description: "What are you building and why?" },
  { id: "runtime", label: "Runtime", description: "How will your code execute?" },
  { id: "data", label: "Data", description: "What are your storage and auth needs?" },
  { id: "deploy", label: "Deploy", description: "Where will it run?" },
  { id: "cost", label: "Cost", description: "What's your budget?" },
  { id: "guardrails", label: "Guardrails", description: "What quality gates do you need?" },
];

export function getQuestionsByCategory(category: QuestionCategory): Question[] {
  return QUESTION_BANK.filter(q => q.category === category);
}

export function getQuestionById(id: string): Question | undefined {
  return QUESTION_BANK.find(q => q.id === id);
}

export function summarizeDecisions(snapshot: DecisionSnapshot): {
  knowns: string[];
  unknowns: string[];
  nextActions: string[];
} {
  const knowns: string[] = [];
  const unknowns: string[] = [];
  const nextActions: string[] = [];

  for (const answer of snapshot.answers) {
    const question = getQuestionById(answer.questionId);
    if (!question) continue;

    for (const optionId of answer.selectedOptionIds) {
      const option = question.options.find(o => o.id === optionId);
      if (!option) continue;

      knowns.push(`${question.text} → ${option.label}`);

      if (option.recommendations) {
        nextActions.push(...option.recommendations.map(r => `Consider: ${r}`));
      }
    }

    if (answer.selectedOptionIds.length === 0) {
      unknowns.push(`Still deciding: ${question.text}`);
    }
  }

  // Check for unanswered questions
  for (const question of QUESTION_BANK) {
    const answered = snapshot.answers.some(a => a.questionId === question.id);
    if (!answered) {
      unknowns.push(`Not yet answered: ${question.text}`);
    }
  }

  return { knowns, unknowns, nextActions };
}
