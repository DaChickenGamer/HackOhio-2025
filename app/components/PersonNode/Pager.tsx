import React from "react";
import { THEME } from "@/app/graph/utils/theme";

interface PagerProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

export const Pager: React.FC<PagerProps> = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onAdd,
  onDelete,
  canDelete = true,
}) => {
  return (
    <div className="flex gap-2 items-center">
      {currentPage > 0 && (
        <button
          className="px-2 py-1 rounded"
          style={{ background: THEME.border }}
          onClick={onPrevious}
        >
          ←
        </button>
      )}
      {totalPages > 0 && (
        <span className="text-sm" style={{ color: THEME.muted }}>
          {currentPage + 1}/{totalPages}
        </span>
      )}
      {currentPage < totalPages - 1 && (
        <button
          className="px-2 py-1 rounded"
          style={{ background: THEME.border }}
          onClick={onNext}
        >
          →
        </button>
      )}
      {onAdd && (
        <button
          className="px-2 py-1 rounded text-sm"
          style={{ background: THEME.primary, color: THEME.bg }}
          onClick={onAdd}
        >
          + Add
        </button>
      )}
      {onDelete && (
        <button
          className="px-2 py-1 rounded text-sm disabled:opacity-50"
          style={{ background: "#ef4444", color: "#fff" }}
          onClick={onDelete}
          disabled={!canDelete}
        >
          Delete
        </button>
      )}
    </div>
  );
};
