"use client";

import { useState, useCallback } from "react";
import { ReactFlow, Controls, MiniMap, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const THEME = {
  bg: "#0b1220",
  panel: "#101826",
  text: "#e6eef6",
  primary: "#22d3ee",
};

type PersonData = {
  id: string;
  firstName: string;
  lastName: string;
};

const initialNodes: Node<PersonData>[] = [
  {
    id: "root",
    position: { x: 600, y: 360 },
    data: { id: "root", firstName: "Root", lastName: "" },
  },
];

const initialEdges: Edge[] = [];

export default function GraphPage() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  return (
    <div style={{ width: "100vw", height: "100vh", background: THEME.bg }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}