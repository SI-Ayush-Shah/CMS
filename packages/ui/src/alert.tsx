import { ReactNode } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps {
  title?: ReactNode;
  children?: ReactNode;
  variant?: AlertVariant;
  className?: string;
}

function variantClasses(variant: AlertVariant): string {
  switch (variant) {
    case "success":
      return "bg-success-50 text-success-700 border-success-200";
    case "warning":
      return "bg-warning-50 text-warning-700 border-warning-200";
    case "error":
      return "bg-error-50 text-error-700 border-error-200";
    case "info":
    default:
      return "bg-card text-main-high border-default";
  }
}

export function Alert({ title, children, variant = "info", className = "" }: AlertProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${variantClasses(variant)} ${className}`.trim()}>
      {title && <div className="font-medium mb-1">{title}</div>}
      {children && <div className="text-[14px] text-main-medium">{children}</div>}
    </div>
  );
}


