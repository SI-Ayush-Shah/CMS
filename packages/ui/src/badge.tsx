import { ReactNode } from "react";

type BadgeVariant = "neutral" | "success" | "warning" | "error" | "primary";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

function variantClasses(variant: BadgeVariant): string {
  switch (variant) {
    case "primary":
      return "bg-core-prim-50 text-core-prim-700 border-core-prim-200";
    case "success":
      return "bg-success-50 text-success-700 border-success-200";
    case "warning":
      return "bg-warning-50 text-warning-700 border-warning-200";
    case "error":
      return "bg-error-50 text-error-700 border-error-200";
    case "neutral":
    default:
      return "bg-card text-main-high border-default";
  }
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-[12px] border ${variantClasses(variant)} ${className}`.trim()}>
      {children}
    </span>
  );
}


