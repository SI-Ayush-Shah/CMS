"use client";

import { useState } from "react";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export function Switch({
  checked,
  defaultChecked,
  onChange,
  disabled,
  className = "",
  label,
}: SwitchProps) {
  const [internal, setInternal] = useState<boolean>(defaultChecked ?? false);
  const isOn = checked ?? internal;

  function toggle() {
    if (disabled) return;
    const next = !isOn;
    if (checked === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      disabled={disabled}
      onClick={toggle}
      className={`inline-flex items-center rounded-full transition-colors w-[42px] h-[24px] px-[2px] ${
        isOn ? "bg-core-prim-500" : "bg-core-prim-100"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`.trim()}
    >
      <span
        className={`inline-block size-[20px] rounded-full bg-surface shadow transition-transform ${
          isOn ? "translate-x-[18px]" : "translate-x-0"
        }`}
      />
      {label && <span className="ml-2 text-[14px] text-main-high">{label}</span>}
    </button>
  );
}


