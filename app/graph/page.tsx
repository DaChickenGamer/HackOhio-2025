"use client";

import { useState, useCallback } from "react";
import { ReactFlow, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes = [
  {
    id: "root",
    position: { x: 600, y: 360 },
    data: { label: "Root" },
  },
];

const initialEdges: any[] = [];

export default function GraphPage() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}