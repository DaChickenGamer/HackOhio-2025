"use client";

import { useState } from "react";
import type { PersonNode } from "../types";
import type { Edge } from "@xyflow/react";
import { THEME } from "../utils/theme";
import { fullName, NODE_DIAM, ringPosition, angleOfPos } from "../utils/graphHelpers";

interface PersonFormProps {
    nodes: PersonNode[];
    setNodes: (nodes: PersonNode[] | ((nodes: PersonNode[]) => PersonNode[])) => void;
    setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
    isGuest?: boolean;
}

export function PersonForm({ nodes, setNodes, setEdges, isGuest = false }: PersonFormProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [educations, setEducations] = useState<Array<{ degree: string; school: string; year: string }>>([]);
    const [degree, setDegree] = useState("");
    const [school, setSchool] = useState("");
    const [year, setYear] = useState("");
    const [experiences, setExperiences] = useState<Array<{ role: string; company: string; duration: string }>>([]);
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [duration, setDuration] = useState("");
    const [skills, setSkills] = useState("");
    const [contacts, setContacts] = useState<Array<{ name: string; link: string }>>([]);
    const [contactName, setContactName] = useState("");
    const [contactLink, setContactLink] = useState("");
    const [tags, setTags] = useState("");
    const [notes, setNotes] = useState("");
    const [connectToId, setConnectToId] = useState<string>("root");

    const onAddNode = async () => {
        const connectionData = {
            firstName,
            lastName,
            education: educations,
            experience: experiences,
            skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
            contacts: contacts.map((c) => ({ type: c.name, value: c.link })),
            tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            notes: notes || undefined,
            parentId: connectToId,
        };

        try {
            let nodeId: string;

            if (isGuest) {
                nodeId = `guest-${Date.now()}`;
            } else {
                const response = await fetch("/api/connections", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(connectionData),
                });
                if (!response.ok) throw new Error("Failed to add connection");
                const result = await response.json();
                nodeId = result.connection?.connectionId || `temp-${Date.now()}`;
            }

            const parent = nodes.find((n) => n.id === connectToId) || nodes.find((n) => n.id === "root");
            const parentAngle = parent ? angleOfPos(parent.position) : 0;
            const pos = ringPosition(1, nodes.length - 1, nodes.length, parentAngle);

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
                    skills: connectionData.skills,
                    contacts: connectionData.contacts,
                    tags: connectionData.tags,
                    notes: notes || undefined,
                    parentId: connectToId,
                },
            };

            setNodes((ns) => [...ns, newNode]);
            const target = connectToId || "root";
            setEdges((es) => [
                ...es,
                {
                    id: `e-${nodeId}-${target}`,
                    source: nodeId,
                    target,
                    type: "straight",
                    animated: false,
                    style: { stroke: THEME.primary, strokeWidth: 2 },
                },
            ]);

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
            setContacts([]);
            setContactName("");
            setContactLink("");
            setTags("");
            setNotes("");
        } catch (error) {
            console.error("Failed to add node:", error);
            alert("Failed to add connection. Please try again.");
        }
    };

    return (
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

            {/* Education section */}
            <div className="col-span-2">
                <label className="text-xs mb-2 block" style={{ color: THEME.muted }}>Education</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                    <input
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        placeholder="B.S. CS"
                        className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                        style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
                    />
                    <input
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="OSU"
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
                    Add Education
                </button>

                {educations.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                        {educations.map((e, i) => (
                            <div key={i} className="px-2 py-1 bg-gray-800/40 rounded text-sm flex items-center justify-between">
                                <div className="truncate pr-2">{e.degree} • {e.school} {e.year ? `(${e.year})` : ""}</div>
                                <button
                                    onClick={() => setEducations(eds => eds.filter((_, idx) => idx !== i))}
                                    className="ml-2 text-xs px-2 py-0.5 rounded hover:bg-gray-700/30 delete-btn"
                                    style={{ background: "transparent", color: THEME.text }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Experience section */}
            <div className="col-span-2">
                <label className="text-xs mb-2 block" style={{ color: THEME.muted }}>Experience</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                    <input
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Engineer"
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
                    Add Experience
                </button>

                {experiences.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                        {experiences.map((exp, i) => (
                            <div key={i} className="px-2 py-1 bg-gray-800/40 rounded text-sm flex items-center justify-between">
                                <div className="truncate pr-2">{exp.role} @ {exp.company} {exp.duration ? `(${exp.duration})` : ""}</div>
                                <button
                                    onClick={() => setExperiences(exps => exps.filter((_, idx) => idx !== i))}
                                    className="ml-2 text-xs px-2 py-0.5 rounded hover:bg-gray-700/30 delete-btn"
                                    style={{ background: "transparent", color: THEME.text }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Contact section */}
            <div className="col-span-2">
                <label className="text-xs mb-2 block" style={{ color: THEME.muted }}>Contacts</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Type (e.g., Email, Portfolio)"
                        className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                        style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
                    />
                    <input
                        value={contactLink}
                        onChange={(e) => setContactLink(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                        style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
                    />
                </div>
                <button
                    onClick={() => {
                        if (contactName.trim() && contactLink.trim()) {
                            setContacts(cs => [...cs, { name: contactName.trim(), link: contactLink.trim() }]);
                            setContactName("");
                            setContactLink("");
                        }
                    }}
                    className="w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    style={{ background: THEME.surface, borderColor: THEME.border, color: THEME.text }}
                >
                    Add Contact
                </button>

                {contacts.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1">
                        {contacts.map((c, i) => (
                            <div key={i} className="px-2 py-1 bg-gray-800/40 rounded text-sm flex items-center justify-between">
                                <div className="truncate pr-2">{c.name}: {c.link}</div>
                                <button
                                    onClick={() => setContacts(cs => cs.filter((_, idx) => idx !== i))}
                                    className="ml-2 text-xs px-2 py-0.5 rounded hover:bg-gray-700/30 delete-btn"
                                    style={{ background: "transparent", color: THEME.text }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Skills, Tags, Notes remain unchanged */}
            <div className="col-span-2">
                <label className="text-xs" style={{ color: THEME.muted }}>Skills (comma-separated)</label>
                <input
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, TypeScript"
                    className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
                    style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
                />
            </div>

            <div className="col-span-2">
                <label className="text-xs" style={{ color: THEME.muted }}>Tags (comma-separated)</label>
                <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="backend, ml"
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
                    placeholder="Extra details…"
                    className="w-full rounded-lg border px-3 py-2 outline-none resize-y glow-focus"
                    style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
                />
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

            <style jsx>{`
        .glow-focus {
          transition: all 180ms ease-out;
        }
        .glow-focus:focus {
          outline: none;
          border-color: rgba(203, 213, 225, 0.6);
          box-shadow: 0 0 0 3px rgba(203, 213, 225, 0.25);
        }
        .delete-btn {
          transition: transform 120ms ease;
        }
        .delete-btn:hover {
          animation: shake 360ms ease-in-out;
          outline: 2px solid rgba(220,38,38,0.9);
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-3px); }
          40%, 80% { transform: translateX(3px); }
        }
      `}</style>
        </aside>
    );
}
