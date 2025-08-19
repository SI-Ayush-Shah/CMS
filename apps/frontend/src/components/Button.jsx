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
    "inline-flex w-full h-10 items-center justify-center rounded-2xl font-medium gap-2 transition-colors disabled:bg-button-filled-main-default disabled:text-text-invert-disabled disabled:cursor-not-allowed";

  function variantClasses(v) {
    switch (v) {
      case "solid":
        return "bg-core-prim-500 hover:bg-core-prim-700 text-invert-high ";
      case "outline":
        return "bg-border-main-default/60 text-invert-high border  border-core-prim-100 text-border-main-default hover:bg-border-main-default/80 ";
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
}