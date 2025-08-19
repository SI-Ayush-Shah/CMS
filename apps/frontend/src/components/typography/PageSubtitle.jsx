import { memo } from "react";

/**
 * PageSubtitle Component
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Subtitle content
 * @param {string} props.className - Additional CSS classes
 * @param {React.ElementType} props.as - HTML element to render as (default: "p")
 */
function PageSubtitle({ children, className = "", as: Component = "p" }) {
  const subtitleStyle = {
    fontSize: "var(--page-subtitle-font-size)",
    fontWeight: "var(--page-subtitle-font-weight)",
    color: "var(--page-subtitle-color)",
  };

  return (
    <Component
      className={`text-center whitespace-nowrap ${className}`}
      style={subtitleStyle}
    >
      {children}
    </Component>
  );
}

export default memo(PageSubtitle);
