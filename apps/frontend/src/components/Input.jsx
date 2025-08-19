import React from "react";

export const Input = React.forwardRef(function Input(
  { className = "", invalid, hint, error, variant = "default", ...props },
  ref
) {
  const getBaseClasses = (v) => {
    switch (v) {
      case "dark":
        return "w-full bg-neutral-900 rounded-xl p-3 font-['Montserrat'] font-medium text-white placeholder:text-[#464646] border-none";
      default:
        return "w-full rounded px-3 py-2 border text-main-high placeholder:text-main-low bg-surface";
    }
  };
  
  const getStateClasses = (v) => {
    if (invalid || error) {
      return v === "dark" 
        ? "focus:outline-none focus:ring-2 focus:ring-red-500"
        : "border-error-500 focus:outline-error-500";
    }
    return v === "dark"
      ? "focus:outline-none focus:ring-2 focus:ring-[#8c53c3]"
      : "border-default focus:outline-core-prim-500";
  };

  const base = getBaseClasses(variant);
  const state = getStateClasses(variant);
  
  return (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        className={`${base} ${state} ${className}`.trim()}
        {...props}
      />
      {hint && !error && <p className={`text-[12px] ${variant === "dark" ? "text-[#747474]" : "text-main-medium"}`}>{hint}</p>}
      {error && <p className={`text-[12px] ${variant === "dark" ? "text-red-400" : "text-error-600"}`}>{error}</p>}
    </div>
  );
});
