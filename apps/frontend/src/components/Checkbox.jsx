import React from "react";

export const Checkbox = React.forwardRef(function Checkbox(
  { className = "", label, ...props },
  ref
) {
  return (
    <label className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <input
        ref={ref}
        type="checkbox"
        className="appearance-none size-4 rounded border border-default bg-surface checked:bg-core-prim-500  checked:text-text-invert-high grid place-content-center"
        {...props}
      />
      <span className="text-text-invert-high text-[14px] leading-[20px]">{label}</span>
    </label>
  );
});
