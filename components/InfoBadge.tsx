import type { ReactNode } from "react";

type InfoBadgeProps = {
  children: ReactNode;
  className?: string;
};

export function InfoBadge({ children, className }: InfoBadgeProps) {
  return (
    <p className={["info-badge", className].filter(Boolean).join(" ")}>
      {children}
    </p>
  );
}
