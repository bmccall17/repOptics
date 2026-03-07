"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ExternalLink, X, Minus, Pin, GripHorizontal, RefreshCw, ChevronRight } from "lucide-react";
import type { PortSummary } from "@/app/api/port/summary/route";

const LEVEL_COLORS: Record<string, string> = {
  Gold: "text-yellow-400",
  Silver: "text-zinc-300",
  Bronze: "text-orange-400",
  Basic: "text-zinc-500",
};

const SCORECARD_LABELS: Record<string, string> = {
  decision_clarity: "Decisions",
  governance_standards: "Governance",
  delivery_maturity: "Delivery",
  security_posture: "Security",
};

export function PortFloatingWidget() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasPositioned, setHasPositioned] = useState(false);
  const [summary, setSummary] = useState<PortSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragState = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/port/summary");
      if (!res.ok) throw new Error(`${res.status}`);
      setSummary(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !summary && !loading) {
      fetchSummary();
    }
  }, [open, summary, loading, fetchSummary]);

  useEffect(() => {
    if (open && !hasPositioned) {
      setPosition({ x: window.innerWidth - 340, y: 60 });
      setHasPositioned(true);
    }
  }, [open, hasPositioned]);

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: position.x,
        startPosY: position.y,
      };
      const onMouseMove = (ev: MouseEvent) => {
        if (!dragState.current) return;
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 100, dragState.current.startPosX + (ev.clientX - dragState.current.startX))),
          y: Math.max(0, Math.min(window.innerHeight - 50, dragState.current.startPosY + (ev.clientY - dragState.current.startY))),
        });
      };
      const onMouseUp = () => {
        dragState.current = null;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [position]
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-violet-500 hover:shadow-xl hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Port.io
      </button>
    );
  }

  return (
    <div
      style={{ position: "fixed", left: position.x, top: position.y, zIndex: 9999, width: collapsed ? "auto" : 310 }}
      className="flex flex-col rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl"
    >
      {/* Title bar */}
      <div
        onMouseDown={onDragStart}
        className="flex cursor-grab items-center justify-between gap-2 rounded-t-lg border-b border-zinc-700 bg-zinc-800 px-3 py-2 select-none active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-200">Port.io</span>
          {summary && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${summary.live ? "bg-green-900/50 text-green-400" : "bg-zinc-700 text-zinc-400"}`}>
              {summary.live ? "LIVE" : "STATIC"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-40"
            title="Refresh data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setPinned(!pinned)}
            className={`rounded p-1 transition-colors hover:bg-zinc-700 ${pinned ? "text-violet-400" : "text-zinc-400 hover:text-zinc-200"}`}
            title={pinned ? "Unpin" : "Pin on top"}
          >
            <Pin className={`h-3.5 w-3.5 ${pinned ? "fill-violet-400" : ""}`} />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
            title={collapsed ? "Expand" : "Collapse"}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { if (!pinned) { setOpen(false); setCollapsed(false); } }}
            className={`rounded p-1 transition-colors hover:bg-zinc-700 ${pinned ? "text-zinc-600 cursor-not-allowed" : "text-zinc-400 hover:text-red-400"}`}
            title={pinned ? "Unpin to close" : "Close"}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-red-400">Failed to load: {error}</div>
          )}

          {loading && !summary && (
            <div className="flex items-center justify-center p-6">
              <RefreshCw className="h-5 w-5 animate-spin text-zinc-500" />
            </div>
          )}

          {summary && (
            <div className="flex flex-col divide-y divide-zinc-800">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-px bg-zinc-800">
                <Stat label="Repos" value={summary.repoCount} />
                <Stat label="Critical" value={summary.vulns.critical} alert={summary.vulns.critical > 0} />
                <Stat label="High" value={summary.vulns.high} warn={summary.vulns.high > 0} />
              </div>

              {/* Scorecards */}
              <div className="p-3 space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Scorecards</div>
                {Object.entries(summary.scorecards).map(([key, levels]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">{SCORECARD_LABELS[key] || key}</span>
                    <div className="flex gap-1.5">
                      {["Gold", "Silver", "Bronze", "Basic"].map((level) =>
                        levels[level] ? (
                          <span key={level} className={`${LEVEL_COLORS[level]} tabular-nums`}>
                            {levels[level]}{level[0]}
                          </span>
                        ) : null
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Languages */}
              <div className="p-3 space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Languages</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(summary.languages)
                    .sort(([, a], [, b]) => b - a)
                    .map(([lang, count]) => (
                      <span key={lang} className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                        {lang} <span className="text-zinc-500">{count}</span>
                      </span>
                    ))}
                </div>
              </div>

              {/* Repos mini-list */}
              <div className="p-3 space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Repositories</div>
                {summary.repos.map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 truncate max-w-[140px]">{r.name}</span>
                    <div className="flex items-center gap-2">
                      {r.grade && (
                        <span className={`font-mono font-bold ${r.grade === "A" ? "text-green-400" : r.grade === "B" ? "text-blue-400" : r.grade === "C" ? "text-orange-400" : "text-red-400"}`}>
                          {r.grade}
                        </span>
                      )}
                      {r.securityLevel && (
                        <span className={`text-[10px] ${LEVEL_COLORS[r.securityLevel]}`}>
                          {r.securityLevel}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div className="p-2 space-y-0.5">
                <PortLink href="https://app.getport.io/organization/home" label="Port.io Home" />
                <PortLink href="https://app.getport.io/services" label="Software Catalog" />
                <PortLink href="https://app.getport.io/self-serve" label="Self-Service Actions" />
              </div>

              {/* Footer */}
              <div className="px-3 py-2 text-[10px] text-zinc-600">
                {summary.live ? "Live from Port API" : "Static fallback data"} &middot; {new Date(summary.fetchedAt).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, alert, warn }: { label: string; value: number; alert?: boolean; warn?: boolean }) {
  return (
    <div className="flex flex-col items-center bg-zinc-900 px-2 py-2.5">
      <span className={`text-lg font-bold tabular-nums ${alert ? "text-red-400" : warn ? "text-orange-400" : "text-zinc-100"}`}>
        {value}
      </span>
      <span className="text-[10px] text-zinc-500">{label}</span>
    </div>
  );
}

function PortLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
    >
      {label}
      <div className="flex items-center gap-1 text-zinc-600">
        <ExternalLink className="h-3 w-3" />
        <ChevronRight className="h-3 w-3" />
      </div>
    </a>
  );
}
