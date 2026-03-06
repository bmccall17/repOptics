// Scan a repo and output the report as JSON to stdout
// Usage: npx tsx scripts/scan-for-port.ts <owner> <repo>
// Requires GITHUB_TOKEN env var

// Redirect console.log to stderr so stdout is clean JSON
const origLog = console.log;
console.log = (...args: unknown[]) => console.error(...args);

import { scanRepo } from "../lib/scanner.ts";
import { scoreRepo } from "../lib/heuristics.ts";

async function main() {
  const owner = process.argv[2];
  const repo = process.argv[3];

  if (!owner || !repo) {
    console.error("Usage: npx tsx scripts/scan-for-port.ts <owner> <repo>");
    process.exit(1);
  }

  const evidence = await scanRepo(owner, repo, process.env.GITHUB_TOKEN);
  const report = scoreRepo(evidence);

  // Write clean JSON report to stdout
  process.stdout.write(JSON.stringify(report));
}

main().catch((err) => {
  console.error("Scan failed:", err.message);
  process.exit(1);
});
