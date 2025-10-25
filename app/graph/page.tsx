"use client";

import { useState, useCallback } from "react";
import { ReactFlow, Controls, MiniMap, type Node, type NodeProps, type Edge, Handle, Position } from "@xyflow/react";
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
  education?: string;
  experience?: string;
  skills?: string[];
  contact?: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
  };
};

const fullName = (d: PersonData) => `${d.firstName} ${d.lastName}`.trim() || d.label || "Unnamed";
const initials = (d: PersonData) => {
  const fn = d.firstName.trim();
  const ln = d.lastName.trim();
  return ((fn[0] || "") + (ln[0] || "")).toUpperCase() || "•";
};

const PersonCircleNode: React.FC<NodeProps<Node<PersonData>>> = ({ data }) => {
  const name = fullName(data);
  return (
    <div
      className="relative flex items-center justify-center w-24 h-24 rounded-full"
      style={{
        background: `linear-gradient(145deg, ${THEME.primary} 0%, ${THEME.secondary} 100%)`,
        border: `2px solid ${THEME.border}`,
        boxShadow: `0 8px 24px rgba(34, 211, 238, 0.18)`,
      }}
      title={name}
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold bg-white/80 text-black">
        {initials(data)}
      </div>
      <div className="absolute bottom-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/35 text-white backdrop-blur-sm">
        {name}
      </div>
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
    data: { 
      id: "root", 
      firstName: "Root", 
      lastName: "", 
      label: "Root",
      skills: ["Leadership"],
    },
  },
];

const initialEdges: Edge<PersonData>[] = [];

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