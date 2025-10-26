"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  ConnectionLineType,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/* ===== Theme ===== */
const THEME = {
  bg: "#0b1220",
  panel: "#101826",
  surface: "#122031",
  text: "#e6eef6",
  muted: "#91a4b6",
  primary: "#22d3ee",
  primary700: "#0891b2",
  secondary: "#a78bfa",
  border: "#203243",
};

/* ===== Types ===== */
type PersonData = {
  id: string;
  firstName: string;
  lastName: string;

  education?: string[];
  experience?: string;
  skills?: string[];
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  tags?: string[];
  notes?: string;

  label?: string; // display fallback
};

// The node type React Flow manages
type PersonNode = Node<PersonData, "person">;

/* ===== Helpers ===== */
const NODE_DIAM = 96;
const CENTER = { x: 600, y: 360 };
const GAP = 48;
const RING_STEP = NODE_DIAM + GAP;

const fullName = (d?: Partial<PersonData>) =>
  `${d?.firstName ?? ""} ${d?.lastName ?? ""}`.trim() || d?.label || "Unnamed";

const initials = (d?: Partial<PersonData>) => {
  const fn = (d?.firstName ?? "").trim();
  const ln = (d?.lastName ?? "").trim();
  const i = (fn[0] || "") + (ln[0] || "");
  return i.toUpperCase() || "•";
};

function ringCapacity(r: number) {
  if (r <= 0) return 0;
  const radius = r * RING_STEP;
  const perSlot = NODE_DIAM + GAP;
  return Math.max(6, Math.floor((2 * Math.PI * radius) / perSlot));
}
function nextRingSlot(nonRootCount: number) {
  let ring = 1;
  let remaining = nonRootCount;
  while (true) {
    const cap = ringCapacity(ring);
    if (remaining < cap) {
      const angleStep = (2 * Math.PI) / cap;
      const angle = remaining * angleStep;
      const rad = ring * RING_STEP;
      return { x: CENTER.x + rad * Math.cos(angle), y: CENTER.y + rad * Math.sin(angle) };
    }
    remaining -= cap;
    ring += 1;
  }
}

/* ===== Node view (no headshot) ===== */
type PersonNodeProps = NodeProps<PersonNode>;
const PersonCircleNode: React.FC<PersonNodeProps> = ({ data }) => {
  const name = fullName(data);
  // compute gradient based on distance from root (data.distance, data.maxDistance)
  const distance = (data as any).distance ?? 0;
  const maxDistance = (data as any).maxDistance ?? 1;
  const ratio = maxDistance > 0 ? Math.min(1, distance / maxDistance) : 0;
  // hue from cyan (190) -> purple (270)
  const hueA = Math.round(190 + 80 * ratio);
  const hueB = Math.round(220 + 80 * ratio);
  const colorA = `hsl(${hueA} 90% 55%)`;
  const colorB = `hsl(${hueB} 70% 50%)`;
  return (
    <div
      className="node-anim relative flex flex-col items-center justify-center w-24 h-24 rounded-full select-none transition-transform duration-300 will-change-transform overflow-hidden"
        style={{
        background: `linear-gradient(145deg, ${colorA} 0%, ${colorB} 100%)`,
        border: `2px solid ${THEME.border}`,
        boxShadow: `0 8px 24px rgba(34, 211, 238, 0.12)`,
      }}
      title={name}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold"
        style={{ background: "#ffffffCC", color: "#0b0f14" }}
      >
        {initials(data)}
      </div>

      {/* single invisible center handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="center-source"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 12, height: 12, opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="center-target"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 12, height: 12, opacity: 0 }}
      />
    </div>
  );
};

/* ===== Initial graph ===== */
const initialNodes: PersonNode[] = [
  {
    id: "root",
    position: { x: CENTER.x - NODE_DIAM / 2, y: CENTER.y - NODE_DIAM / 2 },
    type: "person",
    draggable: false,
    data: { id: "root", firstName: "Root", lastName: "", notes: "Central node", label: "Root" },
  },
];
const initialEdges: Edge[] = [];

/* ===== Page ===== */
export default function GraphPage() {
  // Manage Node<PersonData>, not PersonData
  const [nodes, setNodes, onNodesChange] = useNodesState<PersonNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // education input + stacked educations
  const [educationInput, setEducationInput] = useState("");
  const [educations, setEducations] = useState<string[]>([]);
  
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  const [connectToId, setConnectToId] = useState<string>("root");
  const nonRootNodes = useMemo(() => nodes.filter((n) => n.id !== "root"), [nodes]);

  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((eds) =>
        addEdge({ ...c, type: "straight", animated: false, style: { stroke: THEME.primary, strokeWidth: 2 } }, eds)
      ),
    [setEdges]
  );

  const onAddNode = () => {
    const id = `${Date.now()}`;
    const label = `${firstName} ${lastName}`.trim() || `Person ${nonRootNodes.length + 1}`;
  // place new node on ring based on its parent distance to root
    const parent = nodes.find((n) => n.id === connectToId) || nodes.find((n) => n.id === "root");
    const parentDistance = parent ? ((parent.data as any).distance ?? 0) : 0;
    const newDistance = parentDistance + 1;
    // siblings are existing children of the parent at the next distance
    const siblings = nodes.filter((n) => {
      const d = (n.data as any).distance ?? 999;
      const connected = edges.some((e) => (String(e.source) === String(parent?.id) && String(e.target) === String(n.id)) || (String(e.target) === String(parent?.id) && String(e.source) === String(n.id)));
      return d === newDistance && connected;
    });
    const siblingIndex = siblings.length;
    const siblingCount = siblings.length + 1;
    const parentAngle = parent ? angleOfPos(parent.position) : 0;
    const pos = ringPosition(newDistance, siblingIndex, siblingCount, parentAngle);
    const newNode: PersonNode = {
      id,
      position: { x: pos.x - NODE_DIAM / 2, y: pos.y - NODE_DIAM / 2 },
      type: "person",
      draggable: false,
      data: {
        id,
        firstName,
        lastName,
        education: educations.length ? educations : undefined,
        experience: experience || undefined,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        contact: {
          email: email || undefined,
          phone: phone || undefined,
          website: website || undefined,
          linkedin: linkedin || undefined,
          github: github || undefined,
        },
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        notes: notes || undefined,
        label,
      },
    };

    setNodes((ns) => [...ns, newNode]);

    const target = connectToId || "root";
    setEdges((es) => [
      ...es,
      { id: `e-${id}-${target}`, source: id, target, type: "straight", animated: false, style: { stroke: THEME.primary, strokeWidth: 2 } },
    ]);

    setFirstName("");
    setLastName("");
  setEducationInput("");
  setEducations([]);
    setExperience("");
    setSkills("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setLinkedin("");
    setGithub("");
    setTags("");
    setNotes("");
  };

  // remove one education entry by index
  const removeEducation = (index: number) => {
    setEducations((s) => s.filter((_, i) => i !== index));
  };

  // compute distances from root and annotate node.data with distance and maxDistance
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

    // bucket nodes by distance so we can place them evenly around rings
    // Build parent relationships during BFS (parent of a node is the node that first discovered it)
    const parentOf = new Map<string, string>();
    // We already filled distances via BFS above; we need to recompute parents similarly
    // Re-run BFS to capture parents deterministically
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

    // bucket by distance and parent so children cluster near their parent
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

    // If any parent bucket exceeds the ring capacity, spill nodes to outer rings.
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
      const cur = (n.data as any).distance ?? null;
      const curMax = (n.data as any).maxDistance ?? null;

  const assignedRing = assignedRingOf.get(n.id) ?? finiteD;
  const parentId = parentOf.get(n.id) ?? "root";
  const parentNode = nodes.find((x) => x.id === parentId) || nodes.find((x) => x.id === "root");
  const parentAngle = parentNode ? angleOfPos(parentNode.position) : 0;

  const parentMap = assignedBuckets.get(assignedRing) || new Map();
  const bucket = parentMap.get(parentId) || [];
  const index = bucket.indexOf(n.id);
  const count = bucket.length || 1;
  const pos = ringPosition(assignedRing, Math.max(0, index), Math.max(1, count), parentAngle);
      const newPos = { x: pos.x - NODE_DIAM / 2, y: pos.y - NODE_DIAM / 2 };

      const posChanged = n.position.x !== newPos.x || n.position.y !== newPos.y;

      if (cur !== finiteD || curMax !== maxDistance || posChanged) {
        changed = true;
        return { ...n, position: newPos, data: { ...n.data, distance: finiteD, maxDistance } };
      }
      return n;
    });

    if (changed) setNodes(updated);
  }, [nodes, edges, setNodes]);

  // Upcast once so XYFlow accepts the typed component
  const nodeTypes = {
    person: PersonCircleNode as unknown as React.ComponentType<NodeProps>,
  };

  return (
    <main className="min-h-screen w-full" style={{ background: THEME.bg, color: THEME.text }}>
      <div className="flex h-[100vh]">
        {/* Sidebar */}
        <aside
          className="w-[360px] shrink-0 border-r p-4 h-full flex flex-col gap-3 overflow-y-auto"
          style={{ background: THEME.panel, color: THEME.text, borderColor: THEME.border }}
        >
          <h1 className="text-2xl font-bold">Add Person</h1>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs" style={{ color: THEME.muted }}>First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ada"
                className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: THEME.muted }}>Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Lovelace"
                className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs" style={{ color: THEME.muted }}>Connect to</label>
              <select
              value={connectToId}
              onChange={(e) => setConnectToId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
              style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
            >
              {nodes
                .slice()
                .sort((a, b) => (a.id === "root" ? -1 : b.id === "root" ? 1 : 0))
                .map((n) => (
                  <option key={n.id} value={n.id} style={{ color: "#0b0f14" }}>
                    {fullName(n.data)}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs" style={{ color: THEME.muted }}>Education</label>
              <input
                value={educationInput}
                onChange={(e) => setEducationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = educationInput.trim();
                    if (v) {
                      setEducations((s) => [...s, v]);
                      setEducationInput("");
                    }
                  }
                }}
                placeholder="B.S. CSE, Ohio State"
                className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
              />

              {/* stacked educations */}
              {educations.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {educations.map((e, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 bg-gray-800/40 rounded text-sm flex items-center justify-between"
                    >
                      <div className="truncate pr-2">{e}</div>
                      <button
                        type="button"
                        onClick={() => removeEducation(i)}
                        className="ml-2 text-xs px-2 py-0.5 rounded hover:bg-gray-700/30 delete-btn"
                        style={{ background: "transparent", color: THEME.text }}
                        aria-label={`Remove education ${i + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="col-span-2">
              <label className="text-xs" style={{ color: THEME.muted }}>Experience</label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={3}
                placeholder="Intern @ …; RA …"
                className="w-full rounded-lg border px-3 py-2 outline-none resize-y glow-focus"
                style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs" style={{ color: THEME.muted }}>Skills (comma-separated)</label>
              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, GraphQL"
                className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: THEME.muted }}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@domain.com"
                className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: THEME.muted }}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: THEME.muted }}>Website</label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://me.dev"
                className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: THEME.muted }}>LinkedIn</label>
              <input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/…"
                className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs" style={{ color: THEME.muted }}>GitHub</label>
              <input
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/…"
                className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs" style={{ color: THEME.muted }}>Tags (comma-separated)</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="backend, ml, mentor"
                className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs" style={{ color: THEME.muted }}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any extra details…"
                className="w-full rounded-lg border px-3 py-2 outline-none resize-y glow-focus"
                style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
              />
            </div>
          </div>

          <button
            className="mt-2 w-full rounded-xl px-3 py-2 font-semibold transition-colors"
            onClick={onAddNode}
            style={{ background: THEME.primary, color: "#001018", border: `1px solid ${THEME.border}` }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = THEME.primary700;
              e.currentTarget.style.color = THEME.text;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = THEME.primary;
              e.currentTarget.style.color = "#001018";
            }}
          >
            Add Person & Connect
          </button>
        </aside>

        {/* Canvas */}
        <section className="flex-1 h-full">
          <div className="h-full w-full">
            <ReactFlow<PersonNode, Edge>
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              proOptions={{ hideAttribution: true }}
              // upcast once; keeps our component strongly typed internally
              nodeTypes={{ person: PersonCircleNode as unknown as React.ComponentType<NodeProps> }}
              defaultEdgeOptions={{ type: "straight" }}
              connectionLineType={ConnectionLineType.Straight}
            >
              {/* MiniMap removed per request */}
              {/* Controls removed per request (view controls in bottom-right) */}
            </ReactFlow>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .node-anim {
          animation: node-float 6s ease-in-out infinite, gradient-shift 8s ease-in-out infinite;
          background-size: 200% 200%;
        }
        .node-anim:hover {
          transform: translateZ(0) scale(1.04);
          box-shadow: 0 12px 32px rgba(167, 139, 250, 0.25),
            0 0 0 2px rgba(34, 211, 238, 0.25) inset;
        }
        @keyframes node-float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Input glow on focus */
        input.glow-focus, textarea.glow-focus, select.glow-focus {
          transition: all 180ms ease-out;
        }
        input.glow-focus:focus, textarea.glow-focus:focus, select.glow-focus:focus {
          outline: none;
          border-color: rgba(203, 213, 225, 0.6);
          box-shadow: 0 0 0 3px rgba(203, 213, 225, 0.25),
                      0 1px 2px 0 rgba(203, 213, 225, 0.05);
        }

        /* delete-button hover: shake + red outline */
        .delete-btn {
          transition: transform 120ms ease, box-shadow 120ms ease, outline-color 120ms ease;
          will-change: transform;
        }
        .delete-btn:focus-visible {
          outline: 2px solid rgba(220,38,38,0.9);
          outline-offset: 2px;
        }
        .delete-btn:hover {
          animation: shake 360ms ease-in-out;
          outline: 2px solid rgba(220,38,38,0.9);
          outline-offset: 2px;
          box-shadow: 0 0 0 6px rgba(220,38,38,0.08);
        }

        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </main>
  );
}

// compute a position on ring `r` (1..n). index is 0-based within the ring, count is total in ring
// compute a position on ring `r` (1..n). index is 0-based within the cluster, count is total in cluster.
// centerAngle (radians) allows clustering children around their parent angle.
function ringPosition(r: number, index: number, count: number, centerAngle = 0) {
  if (r <= 0) return { x: CENTER.x, y: CENTER.y };
  const rad = r * RING_STEP;
  const capacity = Math.max(1, ringCapacity(r));
  // use capacity as max spacing to avoid overlap when many children
  const angleStep = (2 * Math.PI) / Math.max(capacity, count);
  const totalSpan = angleStep * (count - 1);
  const startAngle = centerAngle - totalSpan / 2;
  const angle = startAngle + index * angleStep;
  return { x: CENTER.x + rad * Math.cos(angle), y: CENTER.y + rad * Math.sin(angle) };
}

function angleOfPos(pos: { x: number; y: number }) {
  return Math.atan2(pos.y - CENTER.y, pos.x - CENTER.x);
}