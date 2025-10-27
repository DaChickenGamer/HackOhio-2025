"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useNodesState, useEdgesState, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { THEME } from "./utils/theme";
import { PersonCircleNode } from "../components/PersonNode";
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
    const [openNodeId, setOpenNodeId] = useState<string | null>(null);

    useEffect(() => {
        if (dataLoaded) {
            setNodes(initialNodes);
            setEdges(initialEdges);
        }
    }, [dataLoaded, initialNodes, initialEdges, setNodes, setEdges]);

    useGraphLayout(nodes, edges, setNodes);

    const handleDeleteNode = useCallback((nodeId: string) => {
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    }, [setNodes, setEdges]);

    const handleUpdateNode = useCallback((nodeId: string, data: PersonNode["data"]) => {
        setNodes((nds) =>
            nds.map((n) => (n.id === nodeId ? { ...n, data } : n))
        );
    }, [setNodes]);

    const nodeTypes = useMemo(
        () => ({
            person: ((props: NodeProps<PersonNode>) => (
                <PersonCircleNode
                    {...props}
                    openNodeId={openNodeId}
                    setOpenNodeId={setOpenNodeId}
                    onDelete={handleDeleteNode}
                    onUpdate={handleUpdateNode}
                />
            )) as unknown as React.ComponentType<NodeProps>,
        }),
        [handleDeleteNode, handleUpdateNode, openNodeId]
    );

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
            <div className="flex h-screen relative">
                {/* Sidebar Form */}
                <PersonForm nodes={nodes} setNodes={setNodes} setEdges={setEdges} isGuest={isGuest} />

                {/* Graph Canvas */}
                <div className="flex-1 w-full md:w-auto touch-none">
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
                        <div className="flex h-full items-center justify-center" style={{ color: THEME.text }}>
                            <div className="text-center px-4">
                                <p className="text-lg">No connections yet</p>
                                <p className="text-sm mt-2 opacity-70">Click the + button to add your first person</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
