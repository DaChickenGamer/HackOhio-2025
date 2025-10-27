import React from "react";
import { SectionHeader } from "./SectionHeader";
import { ContentCard } from "./ContentCard";
import { Pager } from "./Pager";

interface SkillSectionProps {
  skills: string[];
  currentPage: number;
  isEditing: boolean;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onDelete: () => void;
  onUpdate: (value: string) => void;
}

export const SkillSection: React.FC<SkillSectionProps> = ({
  skills,
  currentPage,
  isEditing,
  onPageChange,
  onAdd,
  onDelete,
  onUpdate,
}) => {
  const current = skills[currentPage];

  return (
    <div>
      <SectionHeader title="Skills">
        <Pager
          currentPage={currentPage}
          totalPages={skills.length}
          onPrevious={() => onPageChange(currentPage - 1)}
          onNext={() => onPageChange(currentPage + 1)}
          onAdd={isEditing ? onAdd : undefined}
          onDelete={isEditing ? onDelete : undefined}
          canDelete={skills.length > 0}
        />
      </SectionHeader>
      <ContentCard>
        {!isEditing ? (
          skills.length ? (
            <div className="text-base">{current}</div>
          ) : (
            <div className="opacity-60">No skills</div>
          )
        ) : (
          <input
            className="w-full px-3 py-2 rounded"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            value={current || ""}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="Enter skill"
          />
        )}
      </ContentCard>
    </div>
  );
};
