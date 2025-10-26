"use client";

import { useState, useEffect } from "react";
import type { Person } from "@/types/person";
import type { PersonNode } from "../types";
import type { Edge } from "@xyflow/react";
import { NODE_DIAM, CENTER, ringPosition } from "../utils/graphHelpers";
import { THEME } from "../utils/theme";

export function useGraphData(isLoaded: boolean) {
    const [nodes, setNodes] = useState<PersonNode[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [guestWarning, setGuestWarning] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded) return;
        async function loadData() {
            try {
                const res = await fetch("/api/connections", { method: "GET", headers: { "Content-Type": "application/json" } });
                const text = await res.text();
                if (!res.ok) throw new Error(`Failed to fetch connections: ${res.status}`);
                const data = JSON.parse(text) as { root?: Person; connections?: Person[]; warning?: string };
                if (data.warning) setGuestWarning(data.warning);
                const rootPerson: Person = data.root || {
                    id: "root",
                    firstName: "Root",
                    lastName: "",
                    skills: [],
                    tags: [],
                    notes: "",
                    education: [],
                    experience: [],
                    contacts: [],
                    headshot: "",
                };
                const rootNode: PersonNode = {
                    id: "root",
                    position: { x: CENTER.x - NODE_DIAM / 2, y: CENTER.y - NODE_DIAM / 2 },
                    type: "person",
                    draggable: false,
                    data: rootPerson,
                };
                const loadedNodes: PersonNode[] = [rootNode];
                const loadedEdges: Edge[] = [];
                const connections: Person[] = Array.isArray(data.connections) ? data.connections : [];
                connections.forEach((conn, idx) => {
                    const nodeId = conn.id || `conn-${idx}`;
                    const pos = ringPosition(1, idx, connections.length, 0);
                    loadedNodes.push({
                        id: nodeId,
                        position: { x: pos.x - NODE_DIAM / 2, y: pos.y - NODE_DIAM / 2 },
                        type: "person",
                        draggable: false,
                        data: conn,
                    });
                    const parentId = conn.parentId || "root";
                    loadedEdges.push({
                        id: `e-${parentId}-${nodeId}`,
                        source: parentId,
                        target: nodeId,
                        type: "straight",
                        animated: false,
                        style: { stroke: THEME.primary, strokeWidth: 2 },
                    });
                });
                setNodes(loadedNodes);
                setEdges(loadedEdges);
            } catch {
                setNodes([
                    {
                        id: "root",
                        position: { x: CENTER.x - NODE_DIAM / 2, y: CENTER.y - NODE_DIAM / 2 },
                        type: "person",
                        draggable: false,
                        data: { id: "root", firstName: "Root", lastName: "" },
                    },
                ]);
                setEdges([]);
            } finally {
                setDataLoaded(true);
            }
        }
        loadData();
    }, [isLoaded]);

    return { nodes, edges, dataLoaded, setNodes, setEdges, guestWarning };
}
