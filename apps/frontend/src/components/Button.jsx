export function Button({
  children,
  className = "",
  variant = "solid",
  size = "md",
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
}) {
  const base =
    "inline-flex items-center justify-center font-medium gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  const roundedClasses = variant === "dark" || variant === "dark-secondary" ? "rounded-xl" : "rounded-2xl";

  function variantClasses(v) {
    switch (v) {
      case "solid":
        return "bg-core-prim-500 hover:bg-core-prim-600 text-invert-high";
      case "outline":
        return "border border-core-prim-500 text-core-prim-500 hover:bg-core-prim-50";
      case "ghost":
        return "bg-transparent hover:bg-card text-main-high";
      case "link":
        return "bg-transparent text-core-prim-500 hover:text-core-prim-600 underline underline-offset-2";
      case "dark":
        return "bg-[#641ea7] hover:bg-[#8c53c3] text-white font-['Montserrat']";
      case "dark-secondary":
        return "bg-neutral-900 hover:bg-neutral-800 text-white font-['Montserrat']";
      default:
        return "";
    }
  }

  function sizeClasses(s) {
    switch (s) {
      case "sm":
        return "h-8 px-3 text-[14px]";
      case "md":
        return "h-10 px-4 text-[16px]";
      case "lg":
        return "h-12 px-5 text-[18px]";
      default:
        return "";
    }
  }

  const classes =
    `${base} ${roundedClasses} ${variantClasses(variant)} ${sizeClasses(size)} ${className}`.trim();

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
}
