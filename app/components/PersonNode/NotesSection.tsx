import React from "react";
import { THEME } from "@/app/graph/utils/theme";

interface NotesSectionProps {
  notes: string;
  isEditing: boolean;
  onUpdate: (value: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ notes, isEditing, onUpdate }) => {
  return (
    <div>
      <div className="text-lg font-semibold mb-2" style={{ color: THEME.muted }}>
        Notes
      </div>
      {!isEditing ? (
        <div className="text-base leading-relaxed max-h-32 overflow-y-auto" style={{ wordBreak: "break-word" }}>
          {notes || "—"}
        </div>
      ) : (
        <textarea
          className="w-full px-3 py-2 rounded resize-none"
          rows={6}
          style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, maxHeight: "150px" }}
          value={notes || ""}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Enter notes"
        />
      )}
    </div>
  );
};
