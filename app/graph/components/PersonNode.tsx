"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { THEME } from "../utils/theme";
import { fullName, initials } from "../utils/graphHelpers";
import type { PersonNode } from "../types";

export function PersonCircleNode({ data }: NodeProps<PersonNode>) {
  const [showTooltip, setShowTooltip] = useState(false);
  const name = fullName(data);
  const distance = data.distance ?? 0;
  const maxDistance = data.maxDistance ?? 1;
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
}