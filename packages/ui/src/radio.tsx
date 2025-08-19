"use client";

import { ReactNode } from "react";

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  className?: string;
}

export function RadioGroup({ name, value, defaultValue, onChange, options, className = "" }: RadioGroupProps) {
  return (
    <div role="radiogroup" className={`flex flex-col gap-2 ${className}`.trim()}>
      {options.map((opt) => {
        const checked = value !== undefined ? value === opt.value : defaultValue === opt.value;
        return (
          <label key={opt.value} className={`inline-flex items-center gap-2 ${opt.disabled ? "opacity-50" : ""}`}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              defaultChecked={defaultValue === opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={opt.disabled}
              className="appearance-none size-4 rounded-full border border-default grid place-content-center"
            />
            <span className="text-[14px] text-main-high">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}


