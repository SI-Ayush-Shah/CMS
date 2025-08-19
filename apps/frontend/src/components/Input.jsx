import React from "react";

export const Input = React.forwardRef(function Input(
  { className = "", invalid, hint, error, ...props },
  ref
) {
  const base =
    "w-full rounded px-3 py-2 border text-main-high placeholder:text-main-low bg-surface";
  const state =
    invalid || error
      ? "border-error-500 focus:outline-error-500"
      : "border-default focus:outline-core-prim-500";
  return (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        className={`${base} ${state} ${className}`.trim()}
        {...props}
      />
      {hint && !error && <p className="text-[12px] text-main-medium">{hint}</p>}
      {error && <p className="text-[12px] text-error-600">{error}</p>}
    </div>
  );
});
