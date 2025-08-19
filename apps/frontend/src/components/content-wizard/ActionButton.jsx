import { memo } from "react";
import Icon from "../ui/Icon";

/**
 * ActionButton Component
 *
 * @param {Object} props - Component props
 * @param {string} props.type - Button type: "cover-image" or "generate"
 * @param {string} props.label - Button label text
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.className - Additional CSS classes
 */
function ActionButton({
  type = "generate",
  label = "",
  onClick = () => {},
  disabled = false,
  className = "",
}) {
  if (type === "cover-image") {
    return (
      <div
        className={`flex gap-2 items-center justify-center min-h-7 min-w-7 p-[4px] rounded-2xl shrink-0 cursor-pointer transition-opacity hover:opacity-80 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        onClick={disabled ? undefined : onClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <div className="flex items-center justify-center p-0 rounded-lg shrink-0">
          <div className="relative shrink-0 size-4">
            <Icon
              name="paperclip"
              size={16}
              color="var(--cover-image-button-text-color)"
            />
          </div>
        </div>
        <div
          className="font-normal text-[12px] whitespace-nowrap"
          style={{ color: "var(--cover-image-button-text-color)" }}
        >
          {label}
        </div>
      </div>
    );
  }

  if (type === "generate") {
    return (
      <div
        className={`flex gap-1 items-center justify-center px-2 py-1 rounded-2xl shrink-0 cursor-pointer transition-colors hover:opacity-80 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        style={{
          background: disabled
            ? "var(--generate-button-bg)"
            : "var(--generate-button-bg)",
        }}
        onClick={disabled ? undefined : onClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <div className="flex items-center justify-center p-0 rounded-lg shrink-0">
          <div className="relative shrink-0 size-4">
            <Icon
              name="round"
              size={8}
              color="var(--generate-button-text-color)"
            />
          </div>
        </div>
        <div className="flex flex-col items-start justify-center p-0 rounded-xl shrink-0">
          <div
            className="font-['Inter'] font-normal text-[14px] text-center w-full"
            style={{ color: "var(--generate-button-text-color)" }}
          >
            <p className="block leading-[20px]">{label}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(ActionButton);
