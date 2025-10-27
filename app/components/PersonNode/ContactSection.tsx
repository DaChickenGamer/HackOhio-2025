import React from "react";
import { Contact } from "@/types/contact";
import { SectionHeader } from "./SectionHeader";
import { ContentCard } from "./ContentCard";
import { Pager } from "./Pager";

interface ContactSectionProps {
  contacts: Contact[];
  currentPage: number;
  isEditing: boolean;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onDelete: () => void;
  onUpdate: (field: keyof Contact, value: string) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contacts,
  currentPage,
  isEditing,
  onPageChange,
  onAdd,
  onDelete,
  onUpdate,
}) => {
  const current = contacts[currentPage];

  return (
    <div>
      <SectionHeader title="Contacts">
        <Pager
          currentPage={currentPage}
          totalPages={contacts.length}
          onPrevious={() => onPageChange(currentPage - 1)}
          onNext={() => onPageChange(currentPage + 1)}
          onAdd={isEditing ? onAdd : undefined}
          onDelete={isEditing ? onDelete : undefined}
          canDelete={contacts.length > 0}
        />
      </SectionHeader>
      <ContentCard>
        {!isEditing ? (
          current ? (
            <>
              <div className="font-semibold text-sm mb-1">{current.type}</div>
              <div className="text-base">{current.value}</div>
            </>
          ) : (
            <div className="opacity-60">No contacts</div>
          )
        ) : current ? (
          <div className="space-y-2">
            <input
              className="w-full px-3 py-2 rounded text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              value={current.type || ""}
              onChange={(e) => onUpdate("type", e.target.value)}
              placeholder="Type (e.g., Email, Phone)"
            />
            <input
              className="w-full px-3 py-2 rounded text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              value={current.value || ""}
              onChange={(e) => onUpdate("value", e.target.value)}
              placeholder="Value"
            />
          </div>
        ) : (
          <div className="opacity-60">Click + Add to create contact</div>
        )}
      </ContentCard>
    </div>
  );
};
