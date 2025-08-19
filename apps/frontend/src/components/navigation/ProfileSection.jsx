import { memo } from "react";

/**
 * ProfileSection Component
 *
 * @param {Object} props - Component props
 * @param {string} props.initial - User initial to display (default: "A")
 * @param {string} props.className - Additional CSS classes
 */
function ProfileSection({ initial = "A", className = "" }) {
  const style = {
    width: "var(--nav-item-size)",
    height: "var(--nav-item-size)",
    padding: "var(--nav-item-padding)",
  };

  return (
    <div
      className={`flex items-center justify-start rounded-lg ${className}`}
      style={style}
    >
      <div className="flex items-center justify-center">
        <div
          className="rounded-full overflow-hidden bg-center bg-cover"
          style={{
            width: "24px",
            height: "24px",
            background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
            {initial}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProfileSection);
