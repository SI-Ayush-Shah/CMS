import { memo } from "react";
import Icon from "../ui/Icon";

/**
 * NavItem Component
 *
 * @param {Object} props - Component props
 * @param {string} props.icon - Icon name from Icon component
 * @param {boolean} props.isActive - Whether the nav item is active
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
function NavItem({
  icon,
  isActive = false,
  onClick = () => {},
  className = "",
}) {
  const baseClasses =
    "flex items-center justify-start cursor-pointer transition-colors";
  const activeClasses = isActive
    ? "bg-[var(--nav-item-active-bg)] border-[var(--nav-item-border-width)] border-[var(--nav-item-active-border)] rounded-[var(--nav-item-border-radius)]"
    : "";

  const iconColor = isActive
    ? "var(--nav-item-icon-active-color)"
    : "var(--nav-item-icon-inactive-color)";

  const style = {
    width: "var(--nav-item-size)",
    height: "var(--nav-item-size)",
    padding: "var(--nav-item-padding)",
  };

  return (
    <div
      className={`${baseClasses} ${activeClasses} ${className}`}
      style={style}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="w-[var(--nav-item-icon-size)] h-[var(--nav-item-icon-size)] flex items-center justify-center">
        <Icon name={icon} size={16} color={iconColor} />
      </div>
    </div>
  );
}

export default memo(NavItem);
