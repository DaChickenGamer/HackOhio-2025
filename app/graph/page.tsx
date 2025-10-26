"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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

  education?: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  experience?: Array<{
    role: string;
    company: string;
    duration: string;
  }>;
  skills?: string[];
  contacts?: Array<{
    type: string;
    value: string;
  }>;
  tags?: string[];
  notes?: string;

  label?: string;
};

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

function ringPosition(r: number, index: number, count: number, centerAngle = 0) {
  if (r <= 0) return { x: CENTER.x, y: CENTER.y };
  const rad = r * RING_STEP;
  const capacity = Math.max(1, ringCapacity(r));
  const angleStep = (2 * Math.PI) / Math.max(capacity, count);
  const totalSpan = angleStep * (count - 1);
  const startAngle = centerAngle - totalSpan / 2;
  const angle = startAngle + index * angleStep;
  return { x: CENTER.x + rad * Math.cos(angle), y: CENTER.y + rad * Math.sin(angle) };
}

function angleOfPos(pos: { x: number; y: number }) {
  return Math.atan2(pos.y - CENTER.y, pos.x - CENTER.x);
}

/* ===== Node Component ===== */
type PersonNodeProps = NodeProps<PersonNode>;
const PersonCircleNode: React.FC<PersonNodeProps> = ({ data }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const name = fullName(data);
  const distance = (data as any).distance ?? 0;
  const maxDistance = (data as any).maxDistance ?? 1;
  const ratio = maxDistance > 0 ? Math.min(1, distance / maxDistance) : 0;
  const hueA = Math.round(190 + 80 * ratio);
  const hueB = Math.round(220 + 80 * ratio);
  const colorA = `hsl(${hueA} 90% 55%)`;
  const colorB = `hsl(${hueB} 70% 50%)`;
  
  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
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

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute z-50 p-3 rounded-lg shadow-xl text-xs pointer-events-none"
          style={{
            background: THEME.panel,
            border: `1px solid ${THEME.border}`,
            color: THEME.text,
            minWidth: "200px",
            left: "110%",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <div className="font-bold mb-2">{name}</div>
          
          {data.education && data.education.length > 0 && (
            <div className="mb-2">
              <div className="font-semibold" style={{ color: THEME.muted }}>Education:</div>
              {data.education.map((edu, i) => (
                <div key={i} className="text-xs">• {edu.degree} @ {edu.school}</div>
              ))}
            </div>
          )}
          
          {data.experience && data.experience.length > 0 && (
            <div className="mb-2">
              <div className="font-semibold" style={{ color: THEME.muted }}>Experience:</div>
              {data.experience.map((exp, i) => (
                <div key={i} className="text-xs">• {exp.role} @ {exp.company}</div>
              ))}
            </div>
          )}
          
          {data.skills && data.skills.length > 0 && (
            <div className="mb-2">
              <div className="font-semibold" style={{ color: THEME.muted }}>Skills:</div>
              <div className="text-xs">{data.skills.join(", ")}</div>
            </div>
          )}
          
          {data.contacts && data.contacts.length > 0 && (
            <div className="mb-2">
              <div className="font-semibold" style={{ color: THEME.muted }}>Contacts:</div>
              {data.contacts.map((contact, i) => (
                <div key={i} className="text-xs">• {contact.type}: {contact.value}</div>
              ))}
            </div>
          )}
          
          {data.tags && data.tags.length > 0 && (
            <div className="mb-2">
              <div className="font-semibold" style={{ color: THEME.muted }}>Tags:</div>
              <div className="text-xs">{data.tags.join(", ")}</div>
            </div>
          )}
          
          {data.notes && (
            <div>
              <div className="font-semibold" style={{ color: THEME.muted }}>Notes:</div>
              <div className="text-xs">{data.notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ===== Main Component ===== */
export default function GraphPage() {
  const { user, isLoaded } = useUser();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<PersonNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [degree, setDegree] = useState("");
  const [school, setSchool] = useState("");
  const [year, setYear] = useState("");
  const [educations, setEducations] = useState<Array<{ degree: string; school: string; year: string }>>([]);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [duration, setDuration] = useState("");
  const [experiences, setExperiences] = useState<Array<{ role: string; company: string; duration: string }>>([]);
  const [skills, setSkills] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [connectToId, setConnectToId] = useState<string>("root");

  // Load data from API on mount
  useEffect(() => {
    if (!isLoaded) return;

    async function loadData() {
      try {
        console.log('🔍 Fetching data from API...');
        const response = await fetch('/api/connections');
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok?:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error:', errorText);
          throw new Error(`Failed to fetch: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Data received:', data);
        
        // Handle case where data might be null or no connections exist
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
    
        // Create root node from returned data
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
    
        // Add connections if they exist
        const connections = data.connections || [];
        console.log('📊 Found connections:', connections.length);
        
        if (connections.length > 0) {
          connections.forEach((conn: any, idx: number) => {
            const nodeId = conn.connectionId || `conn-${idx}`;
            const pos = ringPosition(1, idx, connections.length, 0);
            
            console.log('➕ Adding connection:', conn.firstName, conn.lastName, nodeId);
            
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
    
        console.log('🎨 Final nodes:', loadedNodes.length);
        console.log('🔗 Final edges:', loadedEdges.length);
    
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setDataLoaded(true);
      } catch (error) {
        console.error('❌ Failed to load data:', error);
        // Fallback to default root node
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
  }, [isLoaded, setNodes, setEdges]);

  const nonRootNodes = useMemo(() => nodes.filter((n) => n.id !== "root"), [nodes]);

  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((eds) =>
        addEdge({ ...c, type: "straight", animated: false, style: { stroke: THEME.primary, strokeWidth: 2 } }, eds)
      ),
    [setEdges]
  );

  const onAddNode = async () => {
    const connectionData = {
      firstName,
      lastName,
      education: educations,
      experience: experiences,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      contacts: [
        ...(email ? [{ type: "Email", value: email }] : []),
        ...(phone ? [{ type: "Phone", value: phone }] : []),
        ...(website ? [{ type: "Website", value: website }] : []),
        ...(linkedin ? [{ type: "LinkedIn", value: linkedin }] : []),
        ...(github ? [{ type: "GitHub", value: github }] : []),
      ],
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      notes: notes || undefined,
    };

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectionData),
      });

      if (!response.ok) throw new Error('Failed to add connection');

      const result = await response.json();
      const nodeId = result.connection.connectionId;

      // Add to graph
      const parent = nodes.find((n) => n.id === connectToId) || nodes.find((n) => n.id === "root");
      const parentDistance = parent ? ((parent.data as any).distance ?? 0) : 0;
      const newDistance = parentDistance + 1;
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
        id: nodeId,
        position: { x: pos.x - NODE_DIAM / 2, y: pos.y - NODE_DIAM / 2 },
        type: "person",
        draggable: false,
        data: {
          id: nodeId,
          firstName,
          lastName,
          education: educations,
          experience: experiences,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          contacts: connectionData.contacts,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          notes: notes || undefined,
        },
      };

      setNodes((ns) => [...ns, newNode]);

      const target = connectToId || "root";
      setEdges((es) => [
        ...es,
        { id: `e-${nodeId}-${target}`, source: nodeId, target, type: "straight", animated: false, style: { stroke: THEME.primary, strokeWidth: 2 } },
      ]);

      // Reset form
      setFirstName("");
      setLastName("");
      setDegree("");
      setSchool("");
      setYear("");
      setEducations([]);
      setRole("");
      setCompany("");
      setDuration("");
      setExperiences([]);
      setSkills("");
      setEmail("");
      setPhone("");
      setWebsite("");
      setLinkedin("");
      setGithub("");
      setTags("");
      setNotes("");
    } catch (error) {
      console.error('Failed to add node:', error);
      alert('Failed to add connection. Please try again.');
    }
  };

  const removeEducation = (index: number) => {
    setEducations((s) => s.filter((_, i) => i !== index));
  };

  // Distance calculation effect
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

  const nodeTypes = {
    person: PersonCircleNode as unknown as React.ComponentType<NodeProps>,
  };

  if (!isLoaded || !dataLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: THEME.bg, color: THEME.text }}>
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

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
              <label className="text-xs mb-2 block" style={{ color: THEME.muted }}>Education</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="B.S. Computer Science"
                  className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                  style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
                />
                <input
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Ohio State University"
                  className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                  style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
                />
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2025"
                  className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                  style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
                />
              </div>
              <button
                onClick={() => {
                  if (degree.trim() && school.trim()) {
                    setEducations(eds => [...eds, { degree: degree.trim(), school: school.trim(), year: year.trim() }]);
                    setDegree("");
                    setSchool("");
                    setYear("");
                  }
                }}
                className="w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{ background: THEME.surface, borderColor: THEME.border, color: THEME.text }}
              >
                Add Education Entry
              </button>

              {educations.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {educations.map((e, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 bg-gray-800/40 rounded text-sm flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        {e.degree} • {e.school} {e.year ? `(${e.year})` : ""}
                      </div>
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
              <label className="text-xs mb-2 block" style={{ color: THEME.muted }}>Experience</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Software Engineer"
                  className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                  style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
                />
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Tech Corp"
                  className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                  style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
                />
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="2 years"
                  className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                  style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
                />
              </div>
              <button
                onClick={() => {
                  if (role.trim() && company.trim()) {
                    setExperiences(exps => [...exps, { role: role.trim(), company: company.trim(), duration: duration.trim() }]);
                    setRole("");
                    setCompany("");
                    setDuration("");
                  }
                }}
                className="w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{ background: THEME.surface, borderColor: THEME.border, color: THEME.text }}
              >
                Add Experience Entry
              </button>

              {experiences.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {experiences.map((exp, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 bg-gray-800/40 rounded text-sm flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        {exp.role} @ {exp.company} {exp.duration ? `(${exp.duration})` : ""}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExperiences(exps => exps.filter((_, idx) => idx !== i))}
                        className="ml-2 text-xs px-2 py-0.5 rounded hover:bg-gray-700/30 delete-btn"
                        style={{ background: "transparent", color: THEME.text }}
                        aria-label={`Remove experience ${i + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{ type: "straight" }}
              connectionLineType={ConnectionLineType.Straight}
            />
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

        input.glow-focus, textarea.glow-focus, select.glow-focus {
          transition: all 180ms ease-out;
        }
        input.glow-focus:focus, textarea.glow-focus:focus, select.glow-focus:focus {
          outline: none;
          border-color: rgba(203, 213, 225, 0.6);
          box-shadow: 0 0 0 3px rgba(203, 213, 225, 0.25),
                      0 1px 2px 0 rgba(203, 213, 225, 0.05);
        }

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