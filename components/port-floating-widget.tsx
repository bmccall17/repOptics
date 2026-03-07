"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ExternalLink, X, Minus, Pin, GripHorizontal } from "lucide-react";

const PORT_URL = "https://app.getport.io";

export function PortFloatingWidget() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasPositioned, setHasPositioned] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  // Set initial position on first open
  useEffect(() => {
    if (open && !hasPositioned) {
      setPosition({
        x: window.innerWidth - 520,
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
        const dx = ev.clientX - dragState.current.startX;
        const dy = ev.clientY - dragState.current.startY;
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 100, dragState.current.startPosX + dx)),
          y: Math.max(0, Math.min(window.innerHeight - 50, dragState.current.startPosY + dy)),
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

  // Floating trigger button (bottom-right corner)
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-violet-500 hover:shadow-xl"
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
      ref={panelRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 9999,
        width: collapsed ? "auto" : 480,
      }}
      className="flex flex-col rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl"
    >
      {/* Title bar — draggable */}
      <div
        onMouseDown={onDragStart}
        className="flex cursor-grab items-center justify-between gap-2 rounded-t-lg border-b border-zinc-700 bg-zinc-800 px-3 py-2 active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-200">Port.io Dashboard</span>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={PORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
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
              setOpen(false);
              setCollapsed(false);
            }}
            className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-red-400"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="relative" style={{ height: 520 }}>
          {iframeError ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <p className="text-sm text-zinc-400">
                Port.io cannot be embedded in an iframe due to security restrictions.
              </p>
              <a
                href={PORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
              >
                Open Port.io Dashboard
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <iframe
              src={PORT_URL}
              className="h-full w-full rounded-b-lg"
              title="Port.io Dashboard"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onError={() => setIframeError(true)}
              onLoad={(e) => {
                // Detect if iframe was blocked (content will be empty/error)
                try {
                  const frame = e.currentTarget;
                  // If we can't access contentDocument due to CORS, that's actually fine
                  // The iframe loaded something — Port may show a login screen
                  if (frame.contentDocument?.title === "") {
                    setIframeError(true);
                  }
                } catch {
                  // Cross-origin — iframe loaded, which is good
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
