import { memo } from "react";

/**
 * GradientOrb Component - Background gradient orb effect
 *
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.size - Orb size in pixels (default: 1000)
 * @param {string} props.position - CSS position value (default: "absolute")
 * @param {string} props.top - CSS top position
 * @param {string} props.left - CSS left position
 * @param {string} props.right - CSS right position
 * @param {string} props.bottom - CSS bottom position
 * @param {number} props.opacity - Orb opacity (default: 0.3)
 */
function GradientOrb({
  className = "",
  size = 1000,
  position = "absolute",
  top,
  left,
  right,
  bottom,
  opacity = 0.3,
}) {
  const orbStyle = {
    position,
    top,
    left,
    right,
    bottom,
    width: `${size}px`,
    height: `${size}px`,
    background: "var(--gradient-orb-color)",
    borderRadius: "50%",
    filter: `blur(var(--gradient-orb-blur))`,
    opacity,
    pointerEvents: "none",
    zIndex: -1,
  };

  return <div className={className} style={orbStyle} aria-hidden="true" />;
}

export default memo(GradientOrb);
