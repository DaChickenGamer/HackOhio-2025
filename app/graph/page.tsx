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
import { GuestAlert } from "../components/GuestAlert";

export default function GraphPage() {
    const { isLoaded, user } = useUser();
    const isGuest = !user;
    const { nodes: initialNodes, edges: initialEdges, dataLoaded, guestWarning } = useGraphData(isLoaded);
    const [nodes, setNodes, onNodesChange] = useNodesState<PersonNode>(initialNodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);

    useEffect(() => {
        if (dataLoaded) {
            setNodes(initialNodes);
            setEdges(initialEdges);
        }
    }, [dataLoaded, initialNodes, initialEdges, setNodes, setEdges]);

    useGraphLayout(nodes, edges, setNodes);

    const nodeTypes = { person: PersonCircleNode as unknown as React.ComponentType<NodeProps> };

    if (!isLoaded || !dataLoaded) {
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
        <main className="relative min-h-screen w-full overflow-hidden" style={{ background: THEME.bg, color: THEME.text }}>
            {guestWarning && <GuestAlert message={guestWarning} />}
            <div className="flex h-[100vh]">
                {/* Sidebar Form */}
                <PersonForm nodes={nodes} setNodes={setNodes} setEdges={setEdges} isGuest={isGuest} />

                {/* Graph Canvas */}
                {nodes.length > 0 ? (
                    <GraphCanvas
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        setEdges={setEdges}
                        nodeTypes={nodeTypes}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center" style={{ color: THEME.text }}>
                        No connections yet
                    </div>
                )}
            </div>
        </main>
    );
}
