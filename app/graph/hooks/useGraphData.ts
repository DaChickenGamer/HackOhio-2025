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

  useEffect(() => {
    if (!isLoaded) return;

    async function loadData() {
      try {
        const res = await fetch("/api/connections", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const text = await res.text();
        if (!res.ok) {
          console.error("API error:", text);
          throw new Error(`Failed to fetch connections: ${res.status}`);
        }

        const data = JSON.parse(text);
        console.log("Connections data received:", data);

        let rootPerson: Person = data?.root;
        if (!rootPerson) {
          console.warn("Root user not found, creating default root in DB...");
          const createRes = await fetch("/api/connections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: "root", firstName: "Root", lastName: "" }),
          });
          rootPerson = await createRes.json();
        }

        const rootNode: PersonNode = {
          id: "root",
          position: { x: CENTER.x - NODE_DIAM / 2, y: CENTER.y - NODE_DIAM / 2 },
          type: "person",
          draggable: false,
          data: {
            id: rootPerson.id || "root",
            firstName: rootPerson.firstName || "Root",
            lastName: rootPerson.lastName || "",
            skills: rootPerson.skills || [],
            tags: rootPerson.tags || [],
            notes: rootPerson.notes || "",
            education: rootPerson.education || [],
            experience: rootPerson.experience || [],
            contacts: rootPerson.contacts || [],
            headshot: rootPerson.headshot || "",
          },
        };

        const loadedNodes: PersonNode[] = [rootNode];
        const loadedEdges: Edge[] = [];

        const connections: Person[] = Array.isArray(data.connections) ? data.connections : [];

        connections.forEach((conn: Person, idx: number) => {
          const nodeId = conn.id || `conn-${idx}`;
          const pos = ringPosition(1, idx, connections.length, 0);

          loadedNodes.push({
            id: nodeId,
            position: { x: pos.x - NODE_DIAM / 2, y: pos.y - NODE_DIAM / 2 },
            type: "person",
            draggable: false,
            data: {
              id: nodeId,
              firstName: conn.firstName || "",
              lastName: conn.lastName || "",
              skills: conn.skills || [],
              tags: conn.tags || [],
              notes: conn.notes || "",
              education: conn.education || [],
              experience: conn.experience || [],
              contacts: conn.contacts || [],
              headshot: conn.headshot || "",
            },
          });

          loadedEdges.push({
            id: `e-root-${nodeId}`,
            source: "root",
            target: nodeId,
            type: "straight",
            animated: false,
            style: { stroke: THEME.primary, strokeWidth: 2 },
          });
        });

        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setDataLoaded(true);
      } catch (err) {
        console.error("Failed to load graph data:", err);

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
        setDataLoaded(true);
      }
    }

    loadData();
  }, [isLoaded]);

  return { nodes, edges, dataLoaded, setNodes, setEdges };
}
