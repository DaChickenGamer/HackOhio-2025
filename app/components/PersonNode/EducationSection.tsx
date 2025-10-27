import React from "react";
import { Education } from "@/types/education";
import { SectionHeader } from "./SectionHeader";
import { ContentCard } from "./ContentCard";
import { Pager } from "./Pager";

interface EducationSectionProps {
  educations: Education[];
  currentPage: number;
  isEditing: boolean;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onDelete: () => void;
  onUpdate: (field: keyof Education, value: string) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  educations,
  currentPage,
  isEditing,
  onPageChange,
  onAdd,
  onDelete,
  onUpdate,
}) => {
  const current = educations[currentPage];

  return (
    <div>
      <SectionHeader title="Education">
        <Pager
          currentPage={currentPage}
          totalPages={educations.length}
          onPrevious={() => onPageChange(currentPage - 1)}
          onNext={() => onPageChange(currentPage + 1)}
          onAdd={isEditing ? onAdd : undefined}
          onDelete={isEditing ? onDelete : undefined}
          canDelete={educations.length > 0}
        />
      </SectionHeader>
      <ContentCard>
        {!isEditing ? (
          current ? (
            <>
              <div className="font-semibold text-base mb-1">{current.school}</div>
              <div className="text-sm mb-2 opacity-80">{current.degree}</div>
              {current.year && <div className="text-sm opacity-60">{current.year}</div>}
            </>
          ) : (
            <div className="opacity-60">No education</div>
          )
        ) : current ? (
          <div className="space-y-2">
            <input
              className="w-full px-3 py-2 rounded text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              value={current.school || ""}
              onChange={(e) => onUpdate("school", e.target.value)}
              placeholder="School"
            />
            <input
              className="w-full px-3 py-2 rounded text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              value={current.degree || ""}
              onChange={(e) => onUpdate("degree", e.target.value)}
              placeholder="Degree"
            />
            <input
              className="w-full px-3 py-2 rounded text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              value={current.year || ""}
              onChange={(e) => onUpdate("year", e.target.value)}
              placeholder="Year (e.g., 2020-2024)"
            />
          </div>
        ) : (
          <div className="opacity-60">Click + Add to create education</div>
        )}
      </ContentCard>
    </div>
  );
};
