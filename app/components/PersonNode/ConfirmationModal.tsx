import React from "react";
import { THEME } from "@/app/graph/utils/theme";

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDanger = false,
}) => {
  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
      <div className="rounded-lg p-6 max-w-md w-full" style={{ background: THEME.panel, border: `2px solid ${THEME.border}` }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: THEME.text }}>
          {title}
        </h3>
        <p className="mb-6" style={{ color: THEME.muted }}>
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded font-medium"
            style={{ background: THEME.border, color: THEME.text }}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="px-4 py-2 rounded font-medium"
            style={{ background: isDanger ? "#ef4444" : THEME.primary, color: "#fff" }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
