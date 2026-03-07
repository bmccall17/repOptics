"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ExternalLink, X, Minus, Pin, GripHorizontal } from "lucide-react";

const PORT_LINKS = [
  { label: "Home", href: "https://app.getport.io/organization/home" },
  { label: "Software Catalog", href: "https://app.getport.io/services" },
  { label: "Scorecard Overview", href: "https://app.getport.io/dashboard/scorecard_overview" },
  { label: "PR Metrics", href: "https://app.getport.io/dashboard/pr_metrics" },
  { label: "Home Overview", href: "https://app.getport.io/dashboard/home_overview" },
  { label: "Self-Service Actions", href: "https://app.getport.io/self-serve" },
];

export function PortFloatingWidget() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasPositioned, setHasPositioned] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  useEffect(() => {
    if (open && !hasPositioned) {
      setPosition({
        x: window.innerWidth - 300,
        y: 80,
      });
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
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 9999,
        width: collapsed ? "auto" : 260,
      }}
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
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPinned(!pinned)}
            className={`rounded p-1 transition-colors hover:bg-zinc-700 ${
              pinned ? "text-violet-400" : "text-zinc-400 hover:text-zinc-200"
            }`}
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
            onClick={() => {
              if (!pinned) {
                setOpen(false);
                setCollapsed(false);
              }
            }}
            className={`rounded p-1 transition-colors hover:bg-zinc-700 ${
              pinned
                ? "text-zinc-600 cursor-not-allowed"
                : "text-zinc-400 hover:text-red-400"
            }`}
            title={pinned ? "Unpin to close" : "Close"}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Quick links */}
      {!collapsed && (
        <div className="flex flex-col p-2">
          {PORT_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              {link.label}
              <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
