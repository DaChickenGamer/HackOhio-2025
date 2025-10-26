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
}

export function PersonForm({ nodes, setNodes, setEdges }: PersonFormProps) {
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

      <div className="grid grid-cols-2 gap-3">
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
            placeholder="linkedin.com/in/..."
            className="w-full rounded-lg border px-3 py-2 outline-none glow-focus"
            style={{ borderColor: THEME.border, background: THEME.surface, color: THEME.text }}
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs" style={{ color: THEME.muted }}>GitHub</label>
          <input
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="github.com/..."
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