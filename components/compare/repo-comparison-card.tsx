import type { RepoComparison } from "@/lib/port-comparison";

const levelColor: Record<string, string> = {
  Basic: "text-zinc-500",
  Bronze: "text-amber-600",
  Silver: "text-zinc-300",
  Gold: "text-yellow-400",
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-zinc-600">--</span>;
  const color =
    score >= 80
      ? "text-emerald-400"
      : score >= 50
        ? "text-yellow-400"
        : "text-red-400";
  return <span className={`font-mono font-bold ${color}`}>{score}</span>;
}

function LevelBadge({ level }: { level: string | null }) {
  if (!level) return <span className="text-zinc-600">--</span>;
  return (
    <span className={`font-semibold ${levelColor[level] ?? "text-zinc-400"}`}>
      {level}
    </span>
  );
}

function VulnCount({ label, count, color }: { label: string; count: number | null; color: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-zinc-500">{label}:</span>
      <span className={`font-mono font-bold ${count && count > 0 ? color : "text-zinc-600"}`}>
        {count ?? "--"}
      </span>
    </span>
  );
}

export function RepoComparisonCard({ data }: { data: RepoComparison }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-100">{data.repo}</h3>
        {data.repOptics.grade && (
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-sm font-mono text-zinc-300">
            repOptics: {data.repOptics.grade} ({data.repOptics.overall})
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* repOptics side */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            repOptics Scores
          </p>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between">
              <span className="text-zinc-400">Decisions</span>
              <ScoreBadge score={data.repOptics.decisions} />
            </li>
            <li className="flex justify-between">
              <span className="text-zinc-400">Architecture</span>
              <ScoreBadge score={data.repOptics.architecture} />
            </li>
            <li className="flex justify-between">
              <span className="text-zinc-400">Governance</span>
              <ScoreBadge score={data.repOptics.governance} />
            </li>
            <li className="flex justify-between">
              <span className="text-zinc-400">Delivery</span>
              <ScoreBadge score={data.repOptics.delivery} />
            </li>
            <li className="flex justify-between">
              <span className="text-zinc-400">Dependencies</span>
              <ScoreBadge score={data.repOptics.dependencies} />
            </li>
          </ul>
        </div>

        {/* Port side */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Port Scorecard Levels
          </p>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between">
              <span className="text-zinc-400">Decision Clarity</span>
              <LevelBadge level={data.port.decision_clarity} />
            </li>
            <li className="flex justify-between">
              <span className="text-zinc-400">Governance Standards</span>
              <LevelBadge level={data.port.governance_standards} />
            </li>
            <li className="flex justify-between">
              <span className="text-zinc-400">Delivery Maturity</span>
              <LevelBadge level={data.port.delivery_maturity} />
            </li>
            <li className="flex justify-between">
              <span className="text-zinc-400">Security Posture</span>
              <LevelBadge level={data.port.security_posture} />
            </li>
          </ul>
        </div>
      </div>

      {/* Snyk vulnerability summary */}
      {data.snyk.monitored && (
        <div className="mt-4 border-t border-zinc-800 pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Snyk Vulnerabilities
          </p>
          <div className="flex gap-3 text-sm">
            <VulnCount label="Critical" count={data.snyk.critical} color="text-red-400" />
            <VulnCount label="High" count={data.snyk.high} color="text-orange-400" />
            <VulnCount label="Medium" count={data.snyk.medium} color="text-yellow-400" />
            <VulnCount label="Low" count={data.snyk.low} color="text-zinc-400" />
          </div>
        </div>
      )}
      {!data.snyk.monitored && (
        <div className="mt-4 border-t border-zinc-800 pt-3">
          <p className="text-xs text-zinc-600">Not monitored by Snyk</p>
        </div>
      )}
    </div>
  );
}
