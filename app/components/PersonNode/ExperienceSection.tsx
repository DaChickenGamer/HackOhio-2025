import React from "react";
import { Experience } from "@/types/experience";
import { SectionHeader } from "./SectionHeader";
import { ContentCard } from "./ContentCard";
import { Pager } from "./Pager";

interface ExperienceSectionProps {
  experiences: Experience[];
  currentPage: number;
  isEditing: boolean;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onDelete: () => void;
  onUpdate: (field: keyof Experience, value: string) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experiences,
  currentPage,
  isEditing,
  onPageChange,
  onAdd,
  onDelete,
  onUpdate,
}) => {
  const current = experiences[currentPage];

  return (
    <div>
      <SectionHeader title="Experience">
        <Pager
          currentPage={currentPage}
          totalPages={experiences.length}
          onPrevious={() => onPageChange(currentPage - 1)}
          onNext={() => onPageChange(currentPage + 1)}
          onAdd={isEditing ? onAdd : undefined}
          onDelete={isEditing ? onDelete : undefined}
          canDelete={experiences.length > 0}
        />
      </SectionHeader>
      <ContentCard>
        {!isEditing ? (
          current ? (
            <>
              <div className="font-semibold text-base mb-1">{current.role}</div>
              <div className="text-sm mb-2 opacity-80">{current.company}</div>
              {current.duration && <div className="text-sm opacity-60">{current.duration}</div>}
            </>
          ) : (
            <div className="opacity-60">No experience</div>
          )
        ) : current ? (
          <div className="space-y-2">
            <input
              className="w-full px-3 py-2 rounded text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              value={current.role || ""}
              onChange={(e) => onUpdate("role", e.target.value)}
              placeholder="Job Title"
            />
            <input
              className="w-full px-3 py-2 rounded text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              value={current.company || ""}
              onChange={(e) => onUpdate("company", e.target.value)}
              placeholder="Company"
            />
            <input
              className="w-full px-3 py-2 rounded text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              value={current.duration || ""}
              onChange={(e) => onUpdate("duration", e.target.value)}
              placeholder="Duration (e.g., 2020-2023)"
            />
          </div>
        ) : (
          <div className="opacity-60">Click + Add to create experience</div>
        )}
      </ContentCard>
    </div>
  );
};
