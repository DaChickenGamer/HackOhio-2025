"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useUser } from "@clerk/nextjs";
import { THEME } from "../graph/utils/theme";
import { initials } from "../graph/utils/graphHelpers";
import type { Person as PersonModel } from "@/types/person";
import type { Contact } from "@/types/contact";
import type { Education } from "@/types/education";
import type { Experience } from "@/types/experience";
import type { PersonData } from "../graph/types";
import { ConfirmationModal } from "./PersonNode/ConfirmationModal";
import { ExperienceSection } from "./PersonNode/ExperienceSection";
import { EducationSection } from "./PersonNode/EducationSection";
import { ContactSection } from "./PersonNode/ContactSection";
import { SkillSection } from "./PersonNode/SkillSection";
import { NotesSection } from "./PersonNode/NotesSection";

// OG overlay design component (square, centered)
export default function PersonNodeOverlay({
  person,
  isOpen,
  onClose,
  onConfirmDelete,
  onConfirmEdit,
  isGuest = false,
}: {
  person: PersonModel;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void> | void;
  onConfirmEdit: (updated: PersonModel) => Promise<void> | void;
  isGuest?: boolean;
}) {
  const [expPage, setExpPage] = useState(0);
  const [eduPage, setEduPage] = useState(0);
  const [contactPage, setContactPage] = useState(0);
  const [skillPage, setSkillPage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [form, setForm] = useState<PersonModel>(person);

  const expPages: Experience[] = form.experience || [];
  const eduPages: Education[] = form.education || [];
  const contactPages: Contact[] = form.contacts || [];
  const skillPages: string[] = form.skills || [];

  const update = <K extends keyof PersonModel>(key: K, value: PersonModel[K]) =>
    setForm((f: PersonModel) => ({ ...f, [key]: value }));

  const confirmEdit = () => {
    if (isGuest) {
      alert("Sign in to edit.");
      return;
    }
    setShowEditConfirm(false);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (isGuest) {
      alert("Sign in to save.");
      return;
    }
    await onConfirmEdit(form);
    setIsEditing(false);
  };

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape and trap focus within the modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && containerRef.current) {
        const focusable = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        const isShift = e.shiftKey;
        if (!active || !containerRef.current.contains(active)) {
          e.preventDefault();
          (isShift ? last : first).focus();
        } else if (!isShift && active === last) {
          e.preventDefault();
          first.focus();
        } else if (isShift && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isOpen]);

  // Prevent background scroll while modal is open and move initial focus into modal
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the modal container next tick
    const id = window.requestAnimationFrame(() => {
      containerRef.current?.focus();
    });
    return () => {
      document.body.style.overflow = original;
      window.cancelAnimationFrame(id);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(0,0,0,0.6)", zIndex: 9999 }}
      onClick={onClose}
      aria-hidden={false}
    >
      <div
        ref={containerRef}
        className="relative rounded-2xl shadow-2xl flex flex-col outline-none"
        style={{
          background: THEME.panel,
          border: `2px solid ${THEME.border}`,
          color: THEME.text,
          width: "min(90vmin, 900px)",
          height: "min(90vmin, 900px)",
          overflow: "hidden",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="person-overlay-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: THEME.border }}>
          <div id="person-overlay-title" className="text-2xl font-bold truncate">
            {form.firstName || form.lastName ? `${form.firstName ?? ""} ${form.lastName ?? ""}`.trim() : "Unnamed"}
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => (isGuest ? alert("Sign in to edit.") : setShowEditConfirm(true))}
                  className="px-4 py-2 rounded-md"
                  style={{ background: THEME.primary, color: THEME.bg }}
                >
                  Edit
                </button>
                <button
                  onClick={() => (isGuest ? alert("Sign in to delete.") : setShowDeleteConfirm(true))}
                  className="px-4 py-2 rounded-md"
                  style={{ background: "#ef4444", color: "#fff" }}
                >
                  Delete
                </button>
                <button onClick={onClose} className="px-4 py-2 rounded-md" style={{ background: THEME.border }}>
                  Close
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSave} className="px-4 py-2 rounded-md" style={{ background: "#10b981", color: "#fff" }}>
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-md" style={{ background: "#6b7280", color: "#fff" }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content grid (fills remaining space, scrolls) */}
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-6 p-6 overflow-auto">
          {/* Left Column: Experience & Education */}
          <div className="space-y-6">
            <ExperienceSection
              experiences={expPages}
              currentPage={expPage}
              isEditing={isEditing}
              onPageChange={setExpPage}
              onAdd={() => {
                const next = [...(form.experience || []), { role: "", company: "", duration: "" }] as Experience[];
                update("experience", next as PersonModel["experience"]);
                setExpPage(next.length - 1);
              }}
              onDelete={() => {
                if (!(form.experience && form.experience.length)) return;
                const next = (form.experience || []).filter((_, idx) => idx !== expPage) as Experience[];
                update("experience", next as PersonModel["experience"]);
                const newLen = next.length;
                setExpPage((prev) => (newLen === 0 ? 0 : Math.min(prev, newLen - 1)));
              }}
              onUpdate={(field, value) => {
                const next = [...(form.experience || [])];
                next[expPage] = { ...(next[expPage] || { role: "", company: "", duration: "" }), [field]: value } as Experience;
                update("experience", next as PersonModel["experience"]);
              }}
            />

            <EducationSection
              educations={eduPages}
              currentPage={eduPage}
              isEditing={isEditing}
              onPageChange={setEduPage}
              onAdd={() => {
                const next = [...(form.education || []), { degree: "", school: "", year: "" }] as Education[];
                update("education", next as PersonModel["education"]);
                setEduPage(next.length - 1);
              }}
              onDelete={() => {
                if (!(form.education && form.education.length)) return;
                const next = (form.education || []).filter((_, idx) => idx !== eduPage) as Education[];
                update("education", next as PersonModel["education"]);
                const newLen = next.length;
                setEduPage((prev) => (newLen === 0 ? 0 : Math.min(prev, newLen - 1)));
              }}
              onUpdate={(field, value) => {
                const next = [...(form.education || [])];
                next[eduPage] = { ...(next[eduPage] || { degree: "", school: "", year: "" }), [field]: value } as Education;
                update("education", next as PersonModel["education"]);
              }}
            />
          </div>

          {/* Right Column: Skills, Contacts, Notes */}
          <div className="space-y-6">
            <SkillSection
              skills={skillPages}
              currentPage={skillPage}
              isEditing={isEditing}
              onPageChange={setSkillPage}
              onAdd={() => {
                const next = [...(form.skills || []), ""];
                update("skills", next as string[]);
                setSkillPage(next.length - 1);
              }}
              onDelete={() => {
                if (!(form.skills && form.skills.length)) return;
                const next = (form.skills || []).filter((_, idx) => idx !== skillPage);
                update("skills", next as string[]);
                const newLen = next.length;
                setSkillPage((prev) => (newLen === 0 ? 0 : Math.min(prev, newLen - 1)));
              }}
              onUpdate={(value) => {
                const next = [...(form.skills || [])];
                next[skillPage] = value;
                update("skills", next as string[]);
              }}
            />

            <ContactSection
              contacts={contactPages}
              currentPage={contactPage}
              isEditing={isEditing}
              onPageChange={setContactPage}
              onAdd={() => {
                const next = [...(form.contacts || []), { type: "", value: "" }] as Contact[];
                update("contacts", next as PersonModel["contacts"]);
                setContactPage(next.length - 1);
              }}
              onDelete={() => {
                if (!(form.contacts && form.contacts.length)) return;
                const next = (form.contacts || []).filter((_, idx) => idx !== contactPage) as Contact[];
                update("contacts", next as PersonModel["contacts"]);
                const newLen = next.length;
                setContactPage((prev) => (newLen === 0 ? 0 : Math.min(prev, newLen - 1)));
              }}
              onUpdate={(field, value) => {
                const next = [...(form.contacts || [])];
                next[contactPage] = { ...(next[contactPage] || { type: "", value: "" }), [field]: value } as Contact;
                update("contacts", next as PersonModel["contacts"]);
              }}
            />

            <NotesSection
              notes={form.notes || ""}
              isEditing={isEditing}
              onUpdate={(value) => update("notes", value as string)}
            />
          </div>
        </div>

        {/* Confirmation Modals */}
        {showDeleteConfirm && (
          <ConfirmationModal
            title="Delete Person"
            message="Are you sure you want to delete this person? This action cannot be undone."
            confirmLabel="Delete"
            onConfirm={async () => {
              setShowDeleteConfirm(false);
              await onConfirmDelete();
              onClose();
            }}
            onCancel={() => setShowDeleteConfirm(false)}
            isDanger
          />
        )}

        {showEditConfirm && (
          <ConfirmationModal
            title="Edit Person"
            message="Do you want to edit this person's information?"
            confirmLabel="Edit"
            onConfirm={confirmEdit}
            onCancel={() => setShowEditConfirm(false)}
          />
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// The ReactFlow node component (wraps the overlay)
export function PersonCircleNode(
  props: NodeProps & {
    openNodeId: string | null;
    setOpenNodeId: (id: string | null) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, data: PersonData) => void;
  }
) {
  const { id, data } = props;
  const { isSignedIn } = useUser();
  const person = data as unknown as PersonModel;

  const handleClick = () => {
    props.setOpenNodeId(id);
  };

  const handleConfirmDelete = async () => {
    if (!isSignedIn) {
      alert("Sign in to delete.");
      return;
    }
    try {
      const res = await fetch(`/api/connections?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      props.onDelete(id);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete person.");
    }
  };

  const handleConfirmEdit = async (updated: PersonModel) => {
    if (!isSignedIn) {
      alert("Sign in to edit.");
      return;
    }
    try {
      const res = await fetch("/api/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates: updated }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const result = await res.json();
      props.onUpdate(id, result.data as PersonData);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update person.");
    }
  };

  const gradient = `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.secondary} 100%)`;

  return (
    <>
      <div
        className="nodrag cursor-pointer relative flex items-center justify-center rounded-full"
        style={{
          width: 120,
          height: 120,
          background: gradient,
          boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
        }}
        onClick={handleClick}
      >
        <div className="text-3xl font-bold" style={{ color: THEME.bg }}>
          {initials(person)}
        </div>
        <Handle type="source" position={Position.Right} style={{ background: THEME.primary }} />
        <Handle type="target" position={Position.Left} style={{ background: THEME.primary }} />
      </div>

      <PersonNodeOverlay
        person={person}
        isOpen={props.openNodeId === id}
        onClose={() => props.setOpenNodeId(null)}
        onConfirmDelete={handleConfirmDelete}
        onConfirmEdit={handleConfirmEdit}
        isGuest={!isSignedIn}
      />
    </>
  );
}
