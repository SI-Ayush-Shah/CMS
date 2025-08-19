import { memo } from "react";

/**
 * PageTitle Component
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Title content
 * @param {string} props.className - Additional CSS classes
 * @param {React.ElementType} props.as - HTML element to render as (default: "h1")
 */
function PageTitle({ children, className = "", as: Component = "h1" }) {
  const titleStyle = {
    fontSize: "var(--page-title-font-size)",
    fontWeight: "var(--page-title-font-weight)",
    color: "var(--page-title-color)",
  };

  return (
    <Component
      className={`text-center whitespace-nowrap ${className}`}
      style={titleStyle}
    >
      {children}
    </Component>
  );
}

export default memo(PageTitle);
