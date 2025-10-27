"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useUser } from "@clerk/nextjs";
import { THEME } from "../graph/utils/theme";
import { fullName, initials } from "../graph/utils/graphHelpers";
import type { Person as PersonModel } from "@/types/person";
import type { Contact } from "@/types/contact";
import type { Education } from "@/types/education";
import type { Experience } from "@/types/experience";
import type { PersonNode as RFPersonNode } from "../graph/types";

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
          {/* Left: Experience pager */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold" style={{ color: THEME.muted }}>Experience</div>
              <div className="flex gap-2 items-center">
                {expPage > 0 && (
                  <button
                    className="px-2 py-1 rounded"
                    style={{ background: THEME.border }}
                    onClick={() => setExpPage((p) => p - 1)}
                  >
                    ←
                  </button>
                )}
                {expPages.length > 0 && (
                  <span className="text-sm" style={{ color: THEME.muted }}>
                    {expPage + 1}/{expPages.length}
                  </span>
                )}
                {expPage < expPages.length - 1 && (
                  <button
                    className="px-2 py-1 rounded"
                    style={{ background: THEME.border }}
                    onClick={() => setExpPage((p) => p + 1)}
                  >
                    →
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      className="px-2 py-1 rounded text-sm"
                      style={{ background: THEME.primary, color: THEME.bg }}
                      onClick={() => {
                        const next = ([...(form.experience || []), { role: "", company: "", duration: "" }] as Experience[]);
                        update("experience", next as PersonModel["experience"]);
                        setExpPage(next.length - 1);
                      }}
                    >
                      + Add
                    </button>
                    <button
                      className="px-2 py-1 rounded text-sm disabled:opacity-50"
                      style={{ background: "#ef4444", color: "#fff" }}
                      onClick={() => {
                        if (!(form.experience && form.experience.length)) return;
                        const next = (form.experience || []).filter((_, idx) => idx !== expPage) as Experience[];
                        update("experience", next as PersonModel["experience"]);
                        const newLen = next.length;
                        setExpPage((prev) => (newLen === 0 ? 0 : Math.min(prev, newLen - 1)));
                      }}
                      disabled={!(form.experience && form.experience.length)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}>
              {!isEditing ? (
                expPages.length ? (
                  <div>
                    <div className="text-base font-medium">{expPages[expPage]?.role}</div>
                    <div className="text-sm opacity-80">{expPages[expPage]?.company} {expPages[expPage]?.duration && `(${expPages[expPage]?.duration})`}</div>
                  </div>
                ) : (
                  <div className="opacity-60">No experience</div>
                )
              ) : (
                <div className="space-y-2">
                  <input className="w-full px-3 py-2 rounded" style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }} value={expPages[expPage]?.role || ""} onChange={(e) => {
                    const next = [...(form.experience || [])];
                    next[expPage] = { ...(next[expPage] || { role: "", company: "", duration: "" }), role: e.target.value } as Experience;
                    update("experience", next as PersonModel["experience"]);
                  }} placeholder="Role" />
                  <input className="w-full px-3 py-2 rounded" style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }} value={expPages[expPage]?.company || ""} onChange={(e) => {
                    const next = [...(form.experience || [])];
                    next[expPage] = { ...(next[expPage] || { role: "", company: "", duration: "" }), company: e.target.value } as Experience;
                    update("experience", next as PersonModel["experience"]);
                  }} placeholder="Company" />
                  <input className="w-full px-3 py-2 rounded" style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }} value={expPages[expPage]?.duration || ""} onChange={(e) => {
                    const next = [...(form.experience || [])];
                    next[expPage] = { ...(next[expPage] || { role: "", company: "", duration: "" }), duration: e.target.value } as Experience;
                    update("experience", next as PersonModel["experience"]);
                  }} placeholder="Duration" />
                </div>
              )}
            </div>

            {/* Education pager */}
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold" style={{ color: THEME.muted }}>Education</div>
              <div className="flex gap-2 items-center">
                {eduPage > 0 && (
                  <button
                    className="px-2 py-1 rounded"
                    style={{ background: THEME.border }}
                    onClick={() => setEduPage((p) => p - 1)}
                  >
                    ←
                  </button>
                )}
                {eduPages.length > 0 && (
                  <span className="text-sm" style={{ color: THEME.muted }}>
                    {eduPage + 1}/{eduPages.length}
                  </span>
                )}
                {eduPage < eduPages.length - 1 && (
                  <button
                    className="px-2 py-1 rounded"
                    style={{ background: THEME.border }}
                    onClick={() => setEduPage((p) => p + 1)}
                  >
                    →
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      className="px-2 py-1 rounded text-sm"
                      style={{ background: THEME.primary, color: THEME.bg }}
                      onClick={() => {
                        const next = ([...(form.education || []), { degree: "", school: "", year: "" }] as Education[]);
                        update("education", next as PersonModel["education"]);
                        setEduPage(next.length - 1);
                      }}
                    >
                      + Add
                    </button>
                    <button
                      className="px-2 py-1 rounded text-sm disabled:opacity-50"
                      style={{ background: "#ef4444", color: "#fff" }}
                      onClick={() => {
                        if (!(form.education && form.education.length)) return;
                        const next = (form.education || []).filter((_, idx) => idx !== eduPage) as Education[];
                        update("education", next as PersonModel["education"]);
                        const newLen = next.length;
                        setEduPage((prev) => (newLen === 0 ? 0 : Math.min(prev, newLen - 1)));
                      }}
                      disabled={!(form.education && form.education.length)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}>
              {!isEditing ? (
                eduPages.length ? (
                  <div>
                    <div className="text-base font-medium">{eduPages[eduPage]?.degree}</div>
                    <div className="text-sm opacity-80">{eduPages[eduPage]?.school} {eduPages[eduPage]?.year && `(${eduPages[eduPage]?.year})`}</div>
                  </div>
                ) : (
                  <div className="opacity-60">No education</div>
                )
              ) : (
                <div className="space-y-2">
                  <input className="w-full px-3 py-2 rounded" style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }} value={eduPages[eduPage]?.degree || ""} onChange={(e) => {
                    const next = [...(form.education || [])];
                    next[eduPage] = { ...(next[eduPage] || { degree: "", school: "", year: "" }), degree: e.target.value } as Education;
                    update("education", next as PersonModel["education"]);
                  }} placeholder="Degree" />
                  <input className="w-full px-3 py-2 rounded" style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }} value={eduPages[eduPage]?.school || ""} onChange={(e) => {
                    const next = [...(form.education || [])];
                    next[eduPage] = { ...(next[eduPage] || { degree: "", school: "", year: "" }), school: e.target.value } as Education;
                    update("education", next as PersonModel["education"]);
                  }} placeholder="School" />
                  <input className="w-full px-3 py-2 rounded" style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }} value={eduPages[eduPage]?.year || ""} onChange={(e) => {
                    const next = [...(form.education || [])];
                    next[eduPage] = { ...(next[eduPage] || { degree: "", school: "", year: "" }), year: e.target.value } as Education;
                    update("education", next as PersonModel["education"]);
                  }} placeholder="Year" />
                </div>
              )}
            </div>
          </div>

          {/* Right: Skills, Contacts, Notes */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold" style={{ color: THEME.muted }}>Skills</div>
                <div className="flex gap-2 items-center">
                  {skillPage > 0 && (
                    <button
                      className="px-2 py-1 rounded"
                      style={{ background: THEME.border }}
                      onClick={() => setSkillPage((p) => p - 1)}
                    >
                      ←
                    </button>
                  )}
                  {skillPages.length > 0 && (
                    <span className="text-sm" style={{ color: THEME.muted }}>
                      {skillPage + 1}/{skillPages.length}
                    </span>
                  )}
                  {skillPage < skillPages.length - 1 && (
                    <button
                      className="px-2 py-1 rounded"
                      style={{ background: THEME.border }}
                      onClick={() => setSkillPage((p) => p + 1)}
                    >
                      →
                    </button>
                  )}
                  {isEditing && (
                    <>
                      <button
                        className="px-2 py-1 rounded text-sm"
                        style={{ background: THEME.primary, color: THEME.bg }}
                        onClick={() => {
                          const next = [...(form.skills || []), ""];
                          update("skills", next as string[]);
                          setSkillPage(next.length - 1);
                        }}
                      >
                        + Add
                      </button>
                      <button
                        className="px-2 py-1 rounded text-sm disabled:opacity-50"
                        style={{ background: "#ef4444", color: "#fff" }}
                        onClick={() => {
                          if (!(form.skills && form.skills.length)) return;
                          const next = (form.skills || []).filter((_, idx) => idx !== skillPage);
                          update("skills", next as string[]);
                          const newLen = next.length;
                          setSkillPage((prev) => (newLen === 0 ? 0 : Math.min(prev, newLen - 1)));
                        }}
                        disabled={!(form.skills && form.skills.length)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg" style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}>
                {!isEditing ? (
                  skillPages.length ? (
                    <div className="text-base">{skillPages[skillPage]}</div>
                  ) : (
                    <div className="opacity-60">No skills</div>
                  )
                ) : (
                  <input
                    className="w-full px-3 py-2 rounded"
                    style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }}
                    value={skillPages[skillPage] || ""}
                    onChange={(e) => {
                      const next = [...(form.skills || [])];
                      next[skillPage] = e.target.value;
                      update("skills", next as string[]);
                    }}
                    placeholder="Enter skill"
                  />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold" style={{ color: THEME.muted }}>Contacts</div>
                <div className="flex gap-2 items-center">
                  {contactPage > 0 && (
                    <button
                      className="px-2 py-1 rounded"
                      style={{ background: THEME.border }}
                      onClick={() => setContactPage((p) => p - 1)}
                    >
                      ←
                    </button>
                  )}
                  {contactPages.length > 0 && (
                    <span className="text-sm" style={{ color: THEME.muted }}>
                      {contactPage + 1}/{contactPages.length}
                    </span>
                  )}
                  {contactPage < contactPages.length - 1 && (
                    <button
                      className="px-2 py-1 rounded"
                      style={{ background: THEME.border }}
                      onClick={() => setContactPage((p) => p + 1)}
                    >
                      →
                    </button>
                  )}
                  {isEditing && (
                    <>
                      <button
                        className="px-2 py-1 rounded text-sm"
                        style={{ background: THEME.primary, color: THEME.bg }}
                        onClick={() => {
                          const next = ([...(form.contacts || []), { type: "", value: "" }] as Contact[]);
                          update("contacts", next as PersonModel["contacts"]);
                          setContactPage(next.length - 1);
                        }}
                      >
                        + Add
                      </button>
                      <button
                        className="px-2 py-1 rounded text-sm disabled:opacity-50"
                        style={{ background: "#ef4444", color: "#fff" }}
                        onClick={() => {
                          if (!(form.contacts && form.contacts.length)) return;
                          const next = (form.contacts || []).filter((_, idx) => idx !== contactPage) as Contact[];
                          update("contacts", next as PersonModel["contacts"]);
                          const newLen = next.length;
                          setContactPage((prev) => (newLen === 0 ? 0 : Math.min(prev, newLen - 1)));
                        }}
                        disabled={!(form.contacts && form.contacts.length)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg" style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}>
                {!isEditing ? (
                  contactPages.length ? (
                    <div>
                      <div className="text-base"><span className="font-medium">{contactPages[contactPage]?.type}:</span> {contactPages[contactPage]?.value}</div>
                    </div>
                  ) : (
                    <div className="opacity-60">No contacts</div>
                  )
                ) : (
                  <div className="space-y-2">
                    <input className="w-full px-3 py-2 rounded" style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }} value={contactPages[contactPage]?.type || ""} onChange={(e) => {
                      const next = [...(form.contacts || [])];
                      next[contactPage] = { ...(next[contactPage] || { type: "", value: "" }), type: e.target.value } as Contact;
                      update("contacts", next as PersonModel["contacts"]);
                    }} placeholder="Type" />
                    <input className="w-full px-3 py-2 rounded" style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }} value={contactPages[contactPage]?.value || ""} onChange={(e) => {
                      const next = [...(form.contacts || [])];
                      next[contactPage] = { ...(next[contactPage] || { type: "", value: "" }), value: e.target.value } as Contact;
                      update("contacts", next as PersonModel["contacts"]);
                    }} placeholder="Value" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-lg font-semibold mb-2" style={{ color: THEME.muted }}>Tags</div>
              {!isEditing ? (
                <div className="text-base">{(form.tags || []).join(", ") || "—"}</div>
              ) : (
                <input className="w-full px-3 py-2 rounded" style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }} value={(form.tags || []).join(", ")}
                  onChange={(e) => update("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean) as string[])}
                />
              )}
            </div>

            <div>
              <div className="text-lg font-semibold mb-2" style={{ color: THEME.muted }}>Notes</div>
              {!isEditing ? (
                <div className="text-base leading-relaxed max-h-32 overflow-y-auto" style={{ wordBreak: "break-word" }}>{form.notes || "—"}</div>
              ) : (
                <textarea
                  className="w-full px-3 py-2 rounded resize-none"
                  rows={6}
                  style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, maxHeight: "150px" }}
                  value={form.notes || ""}
                  onChange={(e) => update("notes", e.target.value as string)}
                  placeholder="Enter notes"
                />
              )}
            </div>
          </div>
        </div>

        {/* Edit confirm */}
        {showEditConfirm && (
          <div className="fixed inset-0 z-10000 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.9)" }} onClick={() => setShowEditConfirm(false)}>
            <div className="rounded-lg p-6" style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }} onClick={(e) => e.stopPropagation()}>
              <div className="text-lg font-bold mb-4">Enter edit mode?</div>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 rounded" style={{ background: THEME.border }} onClick={() => setShowEditConfirm(false)}>Cancel</button>
                <button className="px-4 py-2 rounded" style={{ background: THEME.primary, color: THEME.bg }} onClick={confirmEdit}>Yes</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-10000 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.9)" }} onClick={() => setShowDeleteConfirm(false)}>
            <div className="rounded-lg p-6" style={{ background: THEME.panel, border: `1px solid ${THEME.border}` }} onClick={(e) => e.stopPropagation()}>
              <div className="text-lg font-bold mb-4">Delete this person?</div>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 rounded" style={{ background: THEME.border }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button className="px-4 py-2 rounded" style={{ background: "#ef4444", color: "#fff" }} onClick={async () => { await onConfirmDelete(); setShowDeleteConfirm(false); onClose(); }}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof window === "undefined" || !document?.body) return null;
  return createPortal(modal, document.body);
}

// React Flow node adapter that uses the OG overlay
export function PersonCircleNode(props: NodeProps<RFPersonNode> & {
  openNodeId?: string | null;
  setOpenNodeId?: (id: string | null) => void;
  onDelete?: (nodeId: string) => void;
  onUpdate?: (nodeId: string, data: RFPersonNode["data"]) => void;
}) {
  const { data, id, openNodeId, setOpenNodeId, onDelete, onUpdate } = props as NodeProps<RFPersonNode> & {
    openNodeId?: string | null;
    setOpenNodeId?: (id: string | null) => void;
    onDelete?: (nodeId: string) => void;
    onUpdate?: (nodeId: string, data: RFPersonNode["data"]) => void;
  };

  const { user } = useUser();
  const isGuest = !user;

  const name = fullName(data);
  const distance = data.distance ?? 0;
  const maxDistance = data.maxDistance ?? 1;
  const ratio = maxDistance > 0 ? Math.min(1, distance / maxDistance) : 0;
  const hueA = Math.round(190 + 80 * ratio);
  const hueB = Math.round(220 + 80 * ratio);
  const colorA = `hsl(${hueA} 90% 55%)`;
  const colorB = `hsl(${hueB} 70% 50%)`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenNodeId?.(id);
  };

  return (
    <div className="relative nodrag" style={{ pointerEvents: "all" }}>
      <div
        className="node-anim relative flex flex-col items-center justify-center w-24 h-24 rounded-full select-none transition-transform duration-300 will-change-transform overflow-hidden cursor-pointer"
        style={{
          background: `linear-gradient(145deg, ${colorA} 0%, ${colorB} 100%)`,
          border: `2px solid ${THEME.border}`,
          boxShadow: `0 8px 24px rgba(34, 211, 238, 0.12)`,
          pointerEvents: "all",
        }}
        title={name}
        onClick={handleClick}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold" style={{ background: "#ffffffCC", color: "#0b0f14" }}>
          {initials(data)}
        </div>
        <Handle type="source" position={Position.Right} id="center-source" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 12, height: 12, opacity: 0 }} />
        <Handle type="target" position={Position.Left} id="center-target" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 12, height: 12, opacity: 0 }} />
      </div>

      <PersonNodeOverlay
        person={{
          id: data.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          headshot: data.headshot || "",
          education: data.education || [],
          experience: data.experience || [],
          skills: data.skills || [],
          contacts: data.contacts || [],
          tags: data.tags || [],
          notes: data.notes || "",
          parentId: data.parentId,
        }}
        isOpen={openNodeId === id}
        onClose={() => (openNodeId === id ? setOpenNodeId?.(null) : void 0)}
        isGuest={isGuest}
        onConfirmDelete={async () => {
          if (isGuest) return alert("Sign in to delete.");
          const res = await fetch(`/api/connections?connectionId=${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Delete failed");
          onDelete?.(id);
        }}
        onConfirmEdit={async (updated) => {
          if (isGuest) return alert("Sign in to edit.");
          const res = await fetch("/api/connections", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ connectionId: id, updates: updated }),
          });
          if (!res.ok) throw new Error("Update failed");
          const updatedData: RFPersonNode["data"] = {
            id: updated.id,
            firstName: updated.firstName,
            lastName: updated.lastName,
            headshot: updated.headshot,
            education: updated.education,
            experience: updated.experience,
            skills: updated.skills,
            contacts: updated.contacts,
            tags: updated.tags,
            notes: updated.notes,
            parentId: updated.parentId,
            distance: data.distance,
            maxDistance: data.maxDistance,
          };
          onUpdate?.(id, updatedData);
        }}
      />
    </div>
  );
}