"use client";

import { ReactNode } from "react";

type ButtonVariant = "solid" | "outline" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
}

function variantClasses(variant: ButtonVariant): string {
  switch (variant) {
    case "solid":
      return "bg-core-prim-500 hover:bg-core-prim-600 text-invert-high";
    case "outline":
      return "border border-core-prim-500 text-core-prim-500 hover:bg-core-prim-50";
    case "ghost":
      return "bg-transparent hover:bg-card text-main-high";
    case "link":
      return "bg-transparent text-core-prim-500 hover:text-core-prim-600 underline underline-offset-2";
  }
}

function sizeClasses(size: ButtonSize): string {
  switch (size) {
    case "sm":
      return "h-8 px-3 text-[14px]";
    case "md":
      return "h-10 px-4 text-[16px]";
    case "lg":
      return "h-12 px-5 text-[18px]";
  }
}

export const Button = ({
  children,
  className = "",
  variant = "solid",
  size = "md",
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-medium gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const classes =
    `${base} ${variantClasses(variant)} ${sizeClasses(size)} ${className}`.trim();

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {leftIcon}
      {isLoading ? (
        <span className="inline-block size-4 rounded-full border-2 border-invert-high border-t-transparent animate-spin" />
      ) : (
        children
      )}
      {rightIcon}
    </button>
  );
};
