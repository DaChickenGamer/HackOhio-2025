import React, { ReactNode } from "react";
import { THEME } from "@/app/graph/utils/theme";

interface SectionHeaderProps {
  title: string;
  children?: ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, children }) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="text-lg font-semibold" style={{ color: THEME.muted }}>
        {title}
      </div>
      {children}
    </div>
  );
};
