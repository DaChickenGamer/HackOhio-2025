"use client";

import { useState, useCallback } from "react";
import { ReactFlow, Controls, MiniMap, type Node, type NodeProps, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const THEME = {
  bg: "#0b1220",
  panel: "#101826",
  text: "#e6eef6",
  primary: "#22d3ee",
  secondary: "#a78bfa",
  border: "#203243",
};

type PersonData = {
  id: string;
  firstName: string;
  lastName: string;
  label?: string;
};

const fullName = (d: PersonData) => `${d.firstName} ${d.lastName}`.trim() || d.label || "Unnamed";

const PersonCircleNode = ({ data }: NodeProps) => {
  const personData = data as PersonData;
  const name = fullName(personData);
  return (
    <div
      className="relative flex items-center justify-center w-24 h-24 rounded-full"
      style={{
        background: `linear-gradient(145deg, ${THEME.primary} 0%, ${THEME.secondary} 100%)`,
        border: `2px solid ${THEME.border}`,
      }}
      title={name}
    >
      {name}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

const nodeTypes = {
  person: PersonCircleNode,
};

const initialNodes: Node<PersonData>[] = [
  {
    id: "root",
    position: { x: 600, y: 360 },
    type: "person",
    data: { id: "root", firstName: "Root", lastName: "", label: "Root" },
  },
];

import type { Edge } from "@xyflow/react";

const initialEdges: Edge[] = [];

export default function GraphPage() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  return (
    <div style={{ width: "100vw", height: "100vh", background: THEME.bg }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes}>
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}