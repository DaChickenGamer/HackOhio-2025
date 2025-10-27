import React, { ReactNode } from "react";
import { THEME } from "@/app/graph/utils/theme";

interface ContentCardProps {
  children: ReactNode;
}

export const ContentCard: React.FC<ContentCardProps> = ({ children }) => {
  return (
    <div className="p-4 rounded-lg" style={{ background: THEME.bg, border: `1px solid ${THEME.border}` }}>
      {children}
    </div>
  );
};
