"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = React.useState<string>("");

  useEffect(() => {
    if (ref.current && chart) {
      mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart).then(({ svg }) => {
        setSvg(svg);
      });
    }
  }, [chart]);

  return (
    <div className="w-full overflow-x-auto p-4 bg-zinc-950 rounded border border-zinc-800" ref={ref}>
       <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
