import type { FeatureRow } from "@/lib/port-comparison";

export function FeatureMapTable({ features }: { features: FeatureRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/80 text-left">
            <th className="px-4 py-3 font-medium text-zinc-300">Capability</th>
            <th className="px-4 py-3 font-medium text-zinc-300">repOptics</th>
            <th className="px-4 py-3 font-medium text-zinc-300">Port.io</th>
            <th className="px-4 py-3 font-medium text-zinc-300">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {features.map((row) => (
            <tr
              key={row.capability}
              className="border-b border-zinc-800/50 hover:bg-zinc-900/40"
            >
              <td className="px-4 py-3 font-medium text-zinc-200">
                {row.capability}
              </td>
              <td className="px-4 py-3 text-zinc-400">{row.repOptics}</td>
              <td className="px-4 py-3 text-zinc-400">{row.port}</td>
              <td className="px-4 py-3 text-zinc-300 italic">{row.verdict}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
