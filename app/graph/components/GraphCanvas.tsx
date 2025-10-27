"use client";

import { useCallback } from "react";
import { ReactFlow, addEdge, ConnectionLineType, type NodeProps, type Connection } from "@xyflow/react";
import type { PersonNode } from "../types";
import type { Edge, OnNodesChange, OnEdgesChange } from "@xyflow/react";
import { THEME } from "../utils/theme";


interface GraphCanvasProps {
  nodes: PersonNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<PersonNode>;
  onEdgesChange: OnEdgesChange;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  nodeTypes: Record<string, React.ComponentType<NodeProps>>;
}

export function GraphCanvas({ nodes, edges, onNodesChange, onEdgesChange, setEdges, nodeTypes }: GraphCanvasProps) {
  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((eds) =>
        addEdge({ ...c, type: "straight", animated: false, style: { stroke: THEME.primary, strokeWidth: 2 } }, eds)
      ),
    [setEdges]
  );

  return (
    <section className="flex-1 h-full w-full">
      <div className="h-full w-full touch-pan-x touch-pan-y">
        <ReactFlow<PersonNode, Edge>
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          proOptions={{ hideAttribution: true }}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{ type: "straight" }}
          connectionLineType={ConnectionLineType.Straight}
          panOnScroll
          panOnDrag={[1, 2]}
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick={false}
          minZoom={0.1}
          maxZoom={4}
          nodesDraggable={false}
          selectNodesOnDrag={false}
        />
      </div>

      <style jsx global>{`
        .node-anim {
          animation: node-float 6s ease-in-out infinite, gradient-shift 8s ease-in-out infinite;
          background-size: 200% 200%;
        }
        .node-anim:hover {
          transform: translateZ(0) scale(1.04);
          box-shadow: 0 12px 32px rgba(167, 139, 250, 0.25), 0 0 0 2px rgba(34, 211, 238, 0.25) inset;
        }
        @keyframes node-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
}