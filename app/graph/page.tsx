"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useNodesState, useEdgesState, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { THEME } from "./utils/theme";
import { PersonCircleNode } from "./components/PersonNode";
import { useGraphData } from "./hooks/useGraphData";
import { useGraphLayout } from "./hooks/useGraphLayout";
import { PersonForm } from "./components/PersonForm";
import { GraphCanvas } from "./components/GraphCanvas";
import { PersonNode } from "./types";

export default function GraphPage() {
  const { isLoaded } = useUser();
  const { nodes: initialNodes, edges: initialEdges, dataLoaded } = useGraphData(isLoaded);

  const [nodes, setNodes, onNodesChange] = useNodesState<PersonNode>(initialNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);

  // Sync nodes & edges once data is loaded
  useEffect(() => {
    if (dataLoaded) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [dataLoaded, initialNodes, initialEdges, setNodes, setEdges]);

  // Apply layout only when nodes and edges exist
  useGraphLayout(nodes, edges, setNodes);

  const nodeTypes = {
    person: PersonCircleNode as unknown as React.ComponentType<NodeProps>,
  };

  if (!isLoaded || !dataLoaded || !nodes.length) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: THEME.bg, color: THEME.text }}
      >
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full" style={{ background: THEME.bg, color: THEME.text }}>
      <div className="flex h-[100vh]">
        <PersonForm nodes={nodes} setNodes={setNodes} setEdges={setEdges} />
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          setEdges={setEdges}
          nodeTypes={nodeTypes}
        />
      </div>
    </main>
  );
}
