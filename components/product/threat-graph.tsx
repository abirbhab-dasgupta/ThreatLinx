"use client";
import { useMemo } from "react";
import { ReactFlow, Background, Controls, type Node, type Edge, MarkerType } from "@xyflow/react";
import type { EvidenceRow } from "@/types/product";

const categories: Record<string,string> = { url: "URL SIGNALS", reputation: "REPUTATION", tls: "TLS IDENTITY", security: "WEB SECURITY", browser: "BROWSER BEHAVIOR" };
export function ThreatGraph({ hostname, evidence, selected, onSelect }: {
  hostname: string; evidence: EvidenceRow[]; selected: string | null; onSelect: (id: string) => void;
}) {
  const { nodes, edges } = useMemo(() => {
    const subject: Node = { id: "subject", position: { x: 0, y: 0 }, data: { label: <span className="tlx-node-text"><small>INVESTIGATED SUBJECT</small><b>{hostname}</b></span> }, className: "tlx-flow-subject", selectable: false, draggable: false };
    const present = Object.keys(categories).filter(category => evidence.some(item => item.category === category));
    const nodes: Node[] = [subject];
    const edges: Edge[] = [];
    present.forEach((category, i) => {
      const items = evidence.filter(e => e.category === category);
      const critical = items.some(e => e.level === "critical");
      const warning = !critical && items.some(e => e.level === "warning");
      const highlighted = items.some(e => e.id === selected);
      const x = i % 2 === 0 ? -270 : 310;
      const y = 175 + Math.floor(i / 2) * 153;
      nodes.push({ id: category, position: { x, y }, draggable: false,
        className: `tlx-flow-module ${critical ? "critical" : warning ? "warning" : ""} ${highlighted ? "selected" : ""}`,
        data: { label: <span className="tlx-node-text"><small>PROVIDER / {String(i+1).padStart(2,"0")}</small><b>{categories[category]}</b><em>{items.length} EVIDENCE ITEM{items.length===1?"":"S"}</em></span> } });
      edges.push({ id: `subject-${category}`, source: "subject", target: category,
        style: { stroke: critical ? "#e57b65" : "#8e7baf", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: critical ? "#e57b65" : "#8e7baf" } });
    });
    return { nodes, edges };
  }, [hostname, evidence, selected]);
  if (!evidence.length) return <div className="tlx-graph-empty"><span className="tlx-graph-radar">✳</span><strong>ASSEMBLING THE EVIDENCE GRAPH</strong><p>Verified provider results will appear here as they are collected.</p></div>;
  return <div className="tlx-graph-canvas" role="group" aria-label="Evidence relationship graph">
    <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: .28 }} minZoom={.35} maxZoom={1.5}
      nodesConnectable={false} nodesDraggable={false} elementsSelectable onNodeClick={(_, node) => {
        if (node.id === "subject") return;
        const item = evidence.find(e => e.category === node.id);
        if (item) onSelect(item.id);
      }} proOptions={{ hideAttribution: true }}>
      <Background color="#343532" gap={22} size={1}/><Controls showInteractive={false} position="bottom-right"/>
    </ReactFlow>
    <div className="tlx-graph-key"><span>● VERIFIED RELATIONSHIP</span><span>SELECT A NODE TO INSPECT</span></div>
  </div>;
}
