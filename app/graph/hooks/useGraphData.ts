import { useState, useEffect } from "react";
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
        console.log('🔍 Fetching data from API...');
        const response = await fetch('/api/connections');

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error:', errorText);
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Data received:', data);

        if (!data) {
          console.log('⚠️ No data returned, using default root node');
          setNodes([{
            id: "root",
            position: { x: CENTER.x - NODE_DIAM / 2, y: CENTER.y - NODE_DIAM / 2 },
            type: "person",
            draggable: false,
            data: { id: "root", firstName: "Root", lastName: "", label: "Root" },
          }]);
          setDataLoaded(true);
          return;
        }

        const rootNode: PersonNode = {
          id: "root",
          position: { x: CENTER.x - NODE_DIAM / 2, y: CENTER.y - NODE_DIAM / 2 },
          type: "person",
          draggable: false,
          data: {
            id: "root",
            firstName: data.firstName || "Root",
            lastName: data.lastName || "",
            skills: data.skills || [],
            tags: data.tags || [],
            notes: data.notes || "",
            education: data.education || [],
            experience: data.experience || [],
            contacts: data.contacts || [],
          },
        };

        const loadedNodes: PersonNode[] = [rootNode];
        const loadedEdges: Edge[] = [];

        const connections = data.connections || [];
        console.log('📊 Found connections:', connections.length);

        if (connections.length > 0) {
          connections.forEach((conn: any, idx: number) => {
            const nodeId = conn.connectionId || `conn-${idx}`;
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
                experience: conn.jobs || [],
                contacts: conn.contacts || [],
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
        }

        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setDataLoaded(true);
      } catch (error) {
        console.error('❌ Failed to load data:', error);
        setNodes([{
          id: "root",
          position: { x: CENTER.x - NODE_DIAM / 2, y: CENTER.y - NODE_DIAM / 2 },
          type: "person",
          draggable: false,
          data: { id: "root", firstName: "Root", lastName: "", label: "Root" },
        }]);
        setDataLoaded(true);
      }
    }

    loadData();
  }, [isLoaded]);

  return { nodes, edges, dataLoaded, setNodes, setEdges };
}