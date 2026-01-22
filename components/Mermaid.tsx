"use client";

import React, { useEffect, useState, useId } from "react";
import mermaid from "mermaid";

export default function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "dark" });
    const renderChart = async () => {
      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        setSvg(svg);
      } catch (e) {
         console.error("Mermaid failed to render", e);
         const errorMessage = e instanceof Error ? e.message : "Invalid Mermaid syntax";
         setSvg(`<pre class="text-red-500 text-xs overflow-auto p-2 border border-red-800 rounded bg-red-950/20">${errorMessage}</pre>`);
      }
    };
    renderChart();
  }, [chart, id]);

  return <div className="mermaid-wrapper p-4 bg-zinc-950 rounded border border-zinc-800 overflow-auto" dangerouslySetInnerHTML={{ __html: svg }} />;
}
