"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const [svg, setSvg] = useState<string>("");
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    if (idRef.current === null) {
      idRef.current = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
    }
    const id = idRef.current;

    const renderChart = async () => {
      try {
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
      } catch (error) {
        console.error("Mermaid rendering failed:", error);
        setSvg('<div class="text-red-500 text-sm p-2">Failed to render diagram. Syntax error?</div>');
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart]);

  return (
    <div className="w-full overflow-x-auto p-4 bg-zinc-950 rounded border border-zinc-800">
       <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
