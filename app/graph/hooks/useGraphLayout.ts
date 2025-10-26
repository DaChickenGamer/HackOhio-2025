import { useEffect } from "react";
import type { PersonNode } from "../types";
import type { Edge } from "@xyflow/react";
import { ringCapacity, ringPosition, angleOfPos } from "../utils/graphHelpers";

export function useGraphLayout(
  nodes: PersonNode[],
  edges: Edge[],
  setNodes: (nodes: PersonNode[] | ((nodes: PersonNode[]) => PersonNode[])) => void
) {
  useEffect(() => {
    const adj = new Map<string, Set<string>>();
    for (const n of nodes) adj.set(n.id, new Set<string>());
    for (const e of edges) {
      const s = String(e.source);
      const t = String(e.target);
      adj.get(s)?.add(t);
      adj.get(t)?.add(s);
    }

    const distances = new Map<string, number>();
    if (!adj.has("root")) return;
    const q: string[] = ["root"];
    distances.set("root", 0);
    let i = 0;
    while (i < q.length) {
      const id = q[i++];
      const d = distances.get(id)!;
      for (const nb of adj.get(id) ?? []) {
        if (!distances.has(nb)) {
          distances.set(nb, d + 1);
          q.push(nb);
        }
      }
    }

    const allDistances = Array.from(distances.values());
    const maxDistance = allDistances.length ? Math.max(...allDistances) : 0;

    const parentOf = new Map<string, string>();
    const q2: string[] = ["root"];
    const seen = new Set<string>(["root"]);
    let qi = 0;
    while (qi < q2.length) {
      const id = q2[qi++];
      for (const nb of adj.get(id) ?? []) {
        if (!seen.has(nb)) {
          seen.add(nb);
          parentOf.set(nb, id);
          q2.push(nb);
        }
      }
    }

    const bucketsByParent = new Map<number, Map<string, string[]>>();
    for (const n of nodes) {
      const d = distances.has(n.id) ? distances.get(n.id)! : Infinity;
      const finiteD = Number.isFinite(d) ? d : 999;
      const parentId = parentOf.get(n.id) ?? "root";
      if (!bucketsByParent.has(finiteD)) bucketsByParent.set(finiteD, new Map());
      const parentMap = bucketsByParent.get(finiteD)!;
      if (!parentMap.has(parentId)) parentMap.set(parentId, []);
      parentMap.get(parentId)!.push(n.id);
    }

    const assignedBuckets = new Map<number, Map<string, string[]>>();
    const assignedRingOf = new Map<string, number>();
    for (const [finiteD, parentMap] of bucketsByParent.entries()) {
      for (const [parentId, arr] of parentMap.entries()) {
        const capacity = Math.max(1, ringCapacity(finiteD));
        for (let j = 0; j < arr.length; j++) {
          const id = arr[j];
          const layer = Math.floor(j / capacity);
          const rAssigned = finiteD + layer;
          if (!assignedBuckets.has(rAssigned)) assignedBuckets.set(rAssigned, new Map());
          const map = assignedBuckets.get(rAssigned)!;
          if (!map.has(parentId)) map.set(parentId, []);
          map.get(parentId)!.push(id);
          assignedRingOf.set(id, rAssigned);
        }
      }
    }

    let changed = false;
    const updated = nodes.map((n) => {
      const d = distances.has(n.id) ? distances.get(n.id)! : Infinity;
      const finiteD = Number.isFinite(d) ? d : 999;
      const cur = n.data.distance ?? null;
      const curMax = n.data.maxDistance ?? null;

      const assignedRing = assignedRingOf.get(n.id) ?? finiteD;
      const parentId = parentOf.get(n.id) ?? "root";
      const parentNode = nodes.find((x) => x.id === parentId) || nodes.find((x) => x.id === "root");
      const parentAngle = parentNode ? angleOfPos(parentNode.position) : 0;

      const parentMap = assignedBuckets.get(assignedRing) || new Map();
      const bucket = parentMap.get(parentId) || [];
      const index = bucket.indexOf(n.id);
      const count = bucket.length || 1;
      const pos = ringPosition(assignedRing, Math.max(0, index), Math.max(1, count), parentAngle);
      const newPos = { x: pos.x - 48, y: pos.y - 48 }; // NODE_DIAM / 2

      const posChanged = n.position.x !== newPos.x || n.position.y !== newPos.y;

      if (cur !== finiteD || curMax !== maxDistance || posChanged) {
        changed = true;
        return { ...n, position: newPos, data: { ...n.data, distance: finiteD, maxDistance } };
      }
      return n;
    });

    if (changed) setNodes(updated);
  }, [nodes, edges, setNodes]);
}